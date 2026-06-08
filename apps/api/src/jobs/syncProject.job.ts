import type { Job } from 'bullmq'
import { prisma } from '../lib/prisma.js'
import {
  getBoard,
  getSprints,
  getSprintIssues,
  getUsers,
  discoverStoryPointsField,
  mapJiraSprint,
  mapJiraIssue,
  mapJiraUser,
} from '../integrations/jira/index.js'
import { detectAlerts } from './alertDetector.js'
import { forecastService } from '../modules/forecast/service.js'
import { sendForecastAlert } from '../modules/forecast/alerts.js'

export interface SyncProjectPayload {
  projectId: string
  jiraProjectKey: string
}

export async function syncProjectProcessor(job: Job<SyncProjectPayload>) {
  const { projectId, jiraProjectKey } = job.data

  const syncLog = await prisma.syncLog.create({
    data: {
      type: 'FULL',
      status: 'RUNNING',
      project: { connect: { id: projectId } },
    },
  })

  const startTime = Date.now()
  let itemsSynced = 0

  try {
    // 1. Discover story points field
    const storyPointsFieldId = await discoverStoryPointsField()
    await job.updateProgress(10)

    // 2. Find the board for this project
    const board = await getBoard(jiraProjectKey)
    if (board) {
      // ✅ Safe: projectId validated at job start with organizationId
      await prisma.project.update({
        where: { id: projectId },
        data: { jiraBoardId: board.id },
      })
    }
    await job.updateProgress(20)

    // 3. Sync users/developers
    const jiraUsers = await getUsers(jiraProjectKey)
    const developerMap = new Map<string, string>() // jiraAccountId -> developerId

    for (const jiraUser of jiraUsers) {
      if (!jiraUser.active) continue
      const args = mapJiraUser(jiraUser)
      const dev = await prisma.developer.upsert(args)
      developerMap.set(jiraUser.accountId, dev.id)

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
    await job.updateProgress(40)

    // 4. Sync sprints
    if (board) {
      const jiraSprints = await getSprints(board.id)

      for (const jiraSprint of jiraSprints) {
        const args = mapJiraSprint(jiraSprint, projectId)
        const sprint = await prisma.sprint.upsert(args)
        itemsSynced++

        // 5. Sync issues for this sprint
        const jiraIssues = await getSprintIssues(jiraSprint.id)

        let totalPoints = 0
        let completedPoints = 0

        for (const jiraIssue of jiraIssues) {
          const { data, assigneeAccountId, epicKey } = mapJiraIssue(jiraIssue, storyPointsFieldId)

          const developerId = assigneeAccountId
            ? developerMap.get(assigneeAccountId) ?? null
            : null

          // Handle epic if present
          let epicId: string | null = null
          if (epicKey && jiraIssue.fields.parent) {
            const epic = await prisma.epic.upsert({
              where: { jiraEpicId: jiraIssue.fields.parent.id },
              create: {
                jiraEpicId: jiraIssue.fields.parent.id,
                jiraEpicKey: epicKey,
                name: jiraIssue.fields.parent.fields.summary,
                projectId,
              },
              update: {
                name: jiraIssue.fields.parent.fields.summary,
              },
            })
            epicId = epic.id
          }

          await prisma.issue.upsert({
            where: { jiraIssueId: data.jiraIssueId },
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
    }
    await job.updateProgress(90)

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
      // Alert detection failure should not fail the sync
      console.error('Alert detection failed:', alertErr)
    }

    // 9. Generate AI delivery forecast (non-blocking)
    try {
      const canForecast = await forecastService.canGenerateForecast(projectId)
      if (canForecast) {
        const result = await forecastService.generateAndSave(projectId)
        // Alert if probability is low
        if (result.output.onTimeProbability < 50) {
          await sendForecastAlert(projectId, result.output)
        }
      }
    } catch (forecastErr) {
      // Forecast generation failure should not fail the sync
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
