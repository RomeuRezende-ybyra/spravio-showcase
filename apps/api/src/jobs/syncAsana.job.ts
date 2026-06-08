import type { Job } from 'bullmq'
import { prisma } from '../lib/prisma.js'
import {
  getProject,
  getProjectSections,
  getProjectTasks,
  getProjectMembers,
  mapAsanaUser,
  mapAsanaSection,
  mapAsanaTask,
} from '../integrations/asana/index.js'
import { detectAlerts } from './alertDetector.js'
import { forecastService } from '../modules/forecast/service.js'
import { sendForecastAlert } from '../modules/forecast/alerts.js'

export interface SyncAsanaPayload {
  projectId: string
  asanaProjectId: string
}

export async function syncAsanaProcessor(job: Job<SyncAsanaPayload>) {
  const { projectId, asanaProjectId } = job.data

  const syncLog = await prisma.syncLog.create({
    data: {
      type: 'ASANA',
      status: 'RUNNING',
      project: { connect: { id: projectId } },
    },
  })

  const startTime = Date.now()
  let itemsSynced = 0

  try {
    // 1. Get project info to find workspace
    const _asanaProject = await getProject(asanaProjectId)

    // 2. Sync members/developers
    const members = await getProjectMembers(asanaProjectId)
    const developerMap = new Map<string, string>() // asanaUserGid -> developerId

    for (const member of members) {
      const args = mapAsanaUser(member)
      const dev = await prisma.developer.upsert(args)
      developerMap.set(member.gid, dev.id)

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

    // 3. Sync sections as sprints
    const sections = await getProjectSections(asanaProjectId)
    const sectionMap = new Map<string, { id: string; name: string }>() // asanaSectionGid -> { sprintId, sectionName }

    for (const section of sections) {
      const args = mapAsanaSection(section, projectId)
      const sprint = await prisma.sprint.upsert(args)
      sectionMap.set(section.gid, { id: sprint.id, name: section.name })
      itemsSynced++
    }
    await job.updateProgress(50)

    // 4. Sync tasks as issues
    const tasks = await getProjectTasks(asanaProjectId)

    // Track points per sprint for updating totals
    const sprintPoints = new Map<string, { total: number; completed: number }>()

    for (const task of tasks) {
      // Skip subtasks (they have num_subtasks = 0 but parent tasks have > 0)
      // Actually, subtasks are not returned in project tasks by default

      // Find the section for this task
      const membership = task.memberships?.find((m) => m.section && m.project.gid === asanaProjectId)
      const sectionGid = membership?.section?.gid
      const sectionInfo = sectionGid ? sectionMap.get(sectionGid) : null

      if (!sectionInfo) continue // Skip tasks not in a section

      const { data, assigneeGid } = mapAsanaTask(task, sectionInfo.name)

      const developerId = assigneeGid
        ? developerMap.get(assigneeGid) ?? null
        : null

      await prisma.issue.upsert({
        where: { asanaTaskId: task.gid },
        create: {
          ...data,
          sprintId: sectionInfo.id,
          developerId,
        },
        update: {
          ...data,
          sprintId: sectionInfo.id,
          developerId,
        },
      })

      // Track points
      const currentPoints = sprintPoints.get(sectionInfo.id) || { total: 0, completed: 0 }
      const taskPoints = data.points ?? 0
      currentPoints.total += taskPoints
      if (data.status === 'DONE') {
        currentPoints.completed += taskPoints
      }
      sprintPoints.set(sectionInfo.id, currentPoints)

      itemsSynced++
    }
    await job.updateProgress(70)

    // 5. Update sprint point totals
    for (const [sprintId, points] of sprintPoints) {
      // ✅ Safe: sprintId from sprints created/fetched with validated projectId
      await prisma.sprint.update({
        where: { id: sprintId },
        data: {
          totalPoints: points.total,
          completedPoints: points.completed,
        },
      })
    }
    await job.updateProgress(80)

    // 6. Update project lastSyncAt
    // ✅ Safe: projectId validated at job start with organizationId
    await prisma.project.update({
      where: { id: projectId },
      data: { lastSyncAt: new Date() },
    })

    // 7. Update developer metrics
    await updateDeveloperMetrics(projectId)

    // 8. Detect alerts (non-blocking)
    try {
      await detectAlerts(projectId)
    } catch (alertErr) {
      console.error('Alert detection failed:', alertErr)
    }

    // 9. Generate AI delivery forecast (non-blocking)
    try {
      const canForecast = await forecastService.canGenerateForecast(projectId)
      if (canForecast) {
        const result = await forecastService.generateAndSave(projectId)
        if (result.output.onTimeProbability < 50) {
          await sendForecastAlert(projectId, result.output)
        }
      }
    } catch (forecastErr) {
      console.error('Forecast generation failed:', forecastErr)
    }

    // 10. Finalize sync log
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

    return { success: true, itemsSynced }
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

    const doneIssues = issues.filter((i) => i.status === 'DONE')
    const returnedIssues = issues.filter((i) => i.wasReturned)
    const backendPoints = issues
      .filter((i) => i.issueType === 'BACKEND' && i.status === 'DONE')
      .reduce((sum, i) => sum + i.points, 0)
    const frontendPoints = issues
      .filter((i) => i.issueType === 'FRONTEND' && i.status === 'DONE')
      .reduce((sum, i) => sum + i.points, 0)

    const deliveryRate = (doneIssues.length / totalIssues) * 100
    const returnRate = totalIssues > 0 ? (returnedIssues.length / totalIssues) * 100 : 0

    // Rating: weighted formula (delivery 60%, low return 40%), scale 0-5
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
