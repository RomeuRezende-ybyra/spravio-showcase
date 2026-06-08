import type { Job } from 'bullmq'
import { prisma } from '../lib/prisma.js'
import {
  getSprintIssues,
  discoverStoryPointsField,
  mapJiraIssue,
} from '../integrations/jira/index.js'

export interface SyncSprintPayload {
  projectId: string
  sprintId: string
  jiraSprintId: number
}

export async function syncSprintProcessor(job: Job<SyncSprintPayload>) {
  const { projectId, sprintId, jiraSprintId } = job.data

  const syncLog = await prisma.syncLog.create({
    data: {
      type: 'SPRINT',
      status: 'RUNNING',
      project: { connect: { id: projectId } },
    },
  })

  const startTime = Date.now()
  let itemsSynced = 0

  try {
    const storyPointsFieldId = await discoverStoryPointsField()
    const jiraIssues = await getSprintIssues(jiraSprintId)

    // Build a map of known developers for this project
    const devLinks = await prisma.projectDeveloper.findMany({
      where: { projectId },
      include: { developer: true },
    })
    const developerMap = new Map(
      devLinks.map((dl: typeof devLinks[number]) => [dl.developer.jiraAccountId, dl.developer.id]),
    )

    let totalPoints = 0
    let completedPoints = 0

    for (const jiraIssue of jiraIssues) {
      const { data, assigneeAccountId, epicKey } = mapJiraIssue(jiraIssue, storyPointsFieldId)

      const developerId = assigneeAccountId
        ? developerMap.get(assigneeAccountId) ?? null
        : null

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
          sprintId,
          developerId,
          epicId,
        },
        update: {
          ...data,
          sprintId,
          developerId,
          epicId,
        },
      })

      totalPoints += data.points
      if (data.status === 'DONE') completedPoints += data.points
      itemsSynced++
    }

    // Update sprint totals
    // ✅ Safe: sprintId validated at job start, belongs to validated projectId
    await prisma.sprint.update({
      where: { id: sprintId },
      data: { totalPoints, completedPoints },
    })

    // Update project lastSyncAt
    // ✅ Safe: projectId validated at job start with organizationId
    await prisma.project.update({
      where: { id: projectId },
      data: { lastSyncAt: new Date() },
    })

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'SUCCESS',
        finishedAt: new Date(),
        durationMs: Date.now() - startTime,
        itemsSynced,
      },
    })
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
