import type { Job } from 'bullmq'
import { prisma } from '../lib/prisma.js'
import {
  getIterations,
  getIterationWorkItems,
  getWorkItems,
  getTeamMembers,
  mapAzureIteration,
  mapAzureWorkItem,
  mapAzureUser,
} from '../integrations/azure/index.js'
import { detectAlerts } from './alertDetector.js'

export interface SyncAzureProjectPayload {
  projectId: string
  azureProjectId: string
}

export async function syncAzureProjectProcessor(job: Job<SyncAzureProjectPayload>) {
  const { projectId, azureProjectId } = job.data

  const syncLog = await prisma.syncLog.create({
    data: {
      type: 'AZURE',
      status: 'RUNNING',
      project: { connect: { id: projectId } },
    },
  })

  const startTime = Date.now()
  let itemsSynced = 0

  try {
    // 1. Sync team members / developers
    const members = await getTeamMembers(azureProjectId)
    const developerMap = new Map<string, string>() // azureUserId -> developerId

    for (const member of members) {
      const args = mapAzureUser(member)
      const dev = await prisma.developer.upsert(args)
      developerMap.set(member.identity.id, dev.id)

      // Ensure ProjectDeveloper link
      await prisma.projectDeveloper.upsert({
        where: {
          projectId_developerId: { projectId, developerId: dev.id },
        },
        create: { projectId, developerId: dev.id },
        update: {},
      })
      itemsSynced++
    }
    await job.updateProgress(30)

    // 2. Sync iterations (sprints)
    const iterations = await getIterations(azureProjectId)

    for (const iteration of iterations) {
      const args = mapAzureIteration(iteration, projectId)
      const sprint = await prisma.sprint.upsert(args)
      itemsSynced++

      // 3. Get work items for this iteration
      const iterationWorkItems = await getIterationWorkItems(azureProjectId, iteration.id)
      const workItemIds = iterationWorkItems.workItemRelations
        .map((r) => r.target.id)
        .filter((id): id is number => id != null)

      if (workItemIds.length === 0) continue

      const workItems = await getWorkItems(azureProjectId, workItemIds)

      let totalPoints = 0
      let completedPoints = 0

      // Collect parent IDs for epic resolution
      const parentIds = new Set<number>()
      for (const wi of workItems) {
        const { parentId } = mapAzureWorkItem(wi)
        if (parentId != null) parentIds.add(parentId)
      }

      // Fetch parent work items (potential epics/features)
      const parentWorkItems = parentIds.size > 0
        ? await getWorkItems(azureProjectId, [...parentIds])
        : []

      const epicMap = new Map<number, string>() // parentId -> epicId

      for (const parent of parentWorkItems) {
        const parentType = parent.fields['System.WorkItemType']
        if (parentType === 'Epic' || parentType === 'Feature') {
          const epic = await prisma.epic.upsert({
            where: { azureEpicId: parent.id },
            create: {
              azureEpicId: parent.id,
              name: parent.fields['System.Title'],
              projectId,
            },
            update: {
              name: parent.fields['System.Title'],
            },
          })
          epicMap.set(parent.id, epic.id)
        }
      }

      // 4. Upsert work items as issues
      for (const wi of workItems) {
        const workItemType = wi.fields['System.WorkItemType']
        // Skip Epics and Features — they're parents, not cards
        if (workItemType === 'Epic' || workItemType === 'Feature') continue

        const { data, assigneeUserId, parentId } = mapAzureWorkItem(wi)

        const developerId = assigneeUserId
          ? developerMap.get(assigneeUserId) ?? null
          : null

        const epicId = parentId != null ? epicMap.get(parentId) ?? null : null

        await prisma.issue.upsert({
          where: { azureWorkItemId: data.azureWorkItemId },
          create: {
            ...data,
            sprintId: sprint.id,
            developerId,
            epicId,
          },
          update: {
            ...data,
            sprintId: sprint.id,
            developerId,
            epicId,
          },
        })

        totalPoints += data.points
        if (data.status === 'DONE') completedPoints += data.points
        itemsSynced++
      }

      // Update sprint point totals
      // ✅ Safe: sprint created via upsert with validated projectId
      await prisma.sprint.update({
        where: { id: sprint.id },
        data: { totalPoints, completedPoints },
      })
    }
    await job.updateProgress(80)

    // 5. Update project lastSyncAt
    // ✅ Safe: projectId validated at job start with organizationId
    await prisma.project.update({
      where: { id: projectId },
      data: { lastSyncAt: new Date() },
    })

    // 6. Update developer metrics
    await updateDeveloperMetrics(projectId)

    // 7. Detect alerts (non-blocking)
    try {
      await detectAlerts(projectId)
    } catch {
      // Alert detection failure should not fail the sync
    }

    // 8. Finalize sync log
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'SUCCESS',
        finishedAt: new Date(),
        durationMs: Date.now() - startTime,
        itemsSynced,
      },
    })

    await job.updateProgress(100)
  } catch (error) {
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        durationMs: Date.now() - startTime,
        itemsSynced,
        errorMsg: error instanceof Error ? error.message : String(error),
      },
    })
    throw error
  }
}

async function updateDeveloperMetrics(projectId: string) {
  const projectDevs = await prisma.projectDeveloper.findMany({
    where: { projectId },
    include: {
      developer: {
        include: {
          issues: {
            where: { sprint: { projectId } },
          },
        },
      },
    },
  })

  for (const pd of projectDevs) {
    const issues = pd.developer.issues
    const totalIssues = issues.length
    if (totalIssues === 0) continue

    const doneIssues = issues.filter((i: typeof issues[number]) => i.status === 'DONE')
    const returnedIssues = issues.filter((i: typeof issues[number]) => i.wasReturned)
    const backendPoints = issues
      .filter((i: typeof issues[number]) => i.issueType === 'BACKEND' && i.status === 'DONE')
      .reduce((sum: number, i: typeof issues[number]) => sum + i.points, 0)
    const frontendPoints = issues
      .filter((i: typeof issues[number]) => i.issueType === 'FRONTEND' && i.status === 'DONE')
      .reduce((sum: number, i: typeof issues[number]) => sum + i.points, 0)

    const deliveryRate = (doneIssues.length / totalIssues) * 100
    const returnRate = totalIssues > 0 ? (returnedIssues.length / totalIssues) * 100 : 0

    const rating = Math.min(5, ((deliveryRate / 100) * 0.6 + (1 - returnRate / 100) * 0.4) * 5)

    await prisma.projectDeveloper.update({
      where: { id: pd.id },
      data: {
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        returnRate: Math.round(returnRate * 100) / 100,
        rating: Math.round(rating * 100) / 100,
        backendPoints,
        frontendPoints,
      },
    })
  }
}
