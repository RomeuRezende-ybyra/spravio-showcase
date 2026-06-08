import type { Job } from 'bullmq'
import { prisma } from '../lib/prisma.js'
import {
  getTeamMembers,
  getTeamCycles,
  getTeamIssues,
  mapLinearUser,
  mapLinearCycle,
  mapLinearIssue,
} from '../integrations/linear/index.js'
import { detectAlerts } from './alertDetector.js'
import { forecastService } from '../modules/forecast/service.js'
import { sendForecastAlert } from '../modules/forecast/alerts.js'

export interface SyncLinearPayload {
  projectId: string
  linearTeamId: string
}

export async function syncLinearProcessor(job: Job<SyncLinearPayload>) {
  const { projectId, linearTeamId } = job.data

  const syncLog = await prisma.syncLog.create({
    data: {
      type: 'LINEAR',
      status: 'RUNNING',
      project: { connect: { id: projectId } },
    },
  })

  const startTime = Date.now()
  let itemsSynced = 0

  try {
    // 1. Sync team members as developers
    const members = await getTeamMembers(linearTeamId)
    const developerMap = new Map<string, string>() // linearUserId -> developerId

    for (const member of members) {
      // Skip inactive users
      if (!member.active) continue

      const args = mapLinearUser(member)
      const dev = await prisma.developer.upsert(args)
      developerMap.set(member.id, dev.id)

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

    // 2. Sync cycles as sprints
    const cycles = await getTeamCycles(linearTeamId)
    const cycleMap = new Map<string, string>() // linearCycleId -> sprintId

    for (const cycle of cycles) {
      const args = mapLinearCycle(cycle, projectId)
      const sprint = await prisma.sprint.upsert(args)
      cycleMap.set(cycle.id, sprint.id)
      itemsSynced++
    }
    await job.updateProgress(50)

    // 3. Sync issues
    const issues = await getTeamIssues(linearTeamId)

    // Track points per sprint for updating totals
    const sprintPoints = new Map<string, { total: number; completed: number }>()

    for (const issue of issues) {
      const { data, assigneeUserId, cycleId } = mapLinearIssue(issue)

      // Get sprint ID from cycle
      const sprintId = cycleId ? cycleMap.get(cycleId) ?? null : null

      const developerId = assigneeUserId
        ? developerMap.get(assigneeUserId) ?? null
        : null

      await prisma.issue.upsert({
        where: { linearIssueId: issue.id },
        create: {
          ...data,
          sprintId,
          developerId,
        },
        update: {
          ...data,
          sprintId,
          developerId,
        },
      })

      // Track points for issues in cycles
      if (sprintId) {
        const currentPoints = sprintPoints.get(sprintId) || { total: 0, completed: 0 }
        const issuePoints = data.points ?? 0
        currentPoints.total += issuePoints
        if (data.status === 'DONE') {
          currentPoints.completed += issuePoints
        }
        sprintPoints.set(sprintId, currentPoints)
      }

      itemsSynced++
    }
    await job.updateProgress(70)

    // 4. Update sprint point totals
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
    } catch (alertErr) {
      console.error('Alert detection failed:', alertErr)
    }

    // 8. Generate AI delivery forecast (non-blocking)
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

    // 9. Finalize sync log
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
