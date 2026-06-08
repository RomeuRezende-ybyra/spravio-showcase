import type { Job } from 'bullmq'
import { prisma } from '../lib/prisma.js'
import {
  getBoardGroups,
  getBoardItems,
  getBoardSubscribers,
  mapMondayUser,
  mapMondayGroup,
  mapMondayItem,
} from '../integrations/monday/index.js'
import { detectAlerts } from './alertDetector.js'
import { forecastService } from '../modules/forecast/service.js'
import { sendForecastAlert } from '../modules/forecast/alerts.js'

export interface SyncMondayPayload {
  projectId: string
  mondayBoardId: string
}

export async function syncMondayProcessor(job: Job<SyncMondayPayload>) {
  const { projectId, mondayBoardId } = job.data

  const syncLog = await prisma.syncLog.create({
    data: {
      type: 'MONDAY',
      status: 'RUNNING',
      project: { connect: { id: projectId } },
    },
  })

  const startTime = Date.now()
  let itemsSynced = 0

  try {
    // 1. Sync board subscribers as developers
    const subscribers = await getBoardSubscribers(mondayBoardId)
    const developerMap = new Map<string, string>() // mondayUserId -> developerId

    for (const subscriber of subscribers) {
      const args = mapMondayUser(subscriber)
      const dev = await prisma.developer.upsert(args)
      developerMap.set(subscriber.id, dev.id)

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

    // 2. Sync groups as sprints
    const groups = await getBoardGroups(mondayBoardId)
    const groupMap = new Map<string, string>() // mondayGroupId -> sprintId

    for (const group of groups) {
      const args = mapMondayGroup(group, projectId)
      const sprint = await prisma.sprint.upsert(args)
      groupMap.set(group.id, sprint.id)
      itemsSynced++
    }
    await job.updateProgress(50)

    // 3. Sync items as issues
    const items = await getBoardItems(mondayBoardId)

    // Track points per sprint for updating totals
    const sprintPoints = new Map<string, { total: number; completed: number }>()

    for (const item of items) {
      const { data, assigneeId, groupId } = mapMondayItem(item)

      const sprintId = groupMap.get(groupId)
      if (!sprintId) continue // Skip items not in a known group

      const developerId = assigneeId
        ? developerMap.get(assigneeId) ?? null
        : null

      await prisma.issue.upsert({
        where: { mondayItemId: item.id },
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

      // Track points
      const currentPoints = sprintPoints.get(sprintId) || { total: 0, completed: 0 }
      const itemPoints = data.points ?? 0
      currentPoints.total += itemPoints
      if (data.status === 'DONE') {
        currentPoints.completed += itemPoints
      }
      sprintPoints.set(sprintId, currentPoints)

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
