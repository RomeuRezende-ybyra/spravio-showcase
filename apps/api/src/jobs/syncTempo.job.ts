import type { Job } from 'bullmq'
import { prisma } from '../lib/prisma.js'
import { getWorklogs, aggregateWorklogsByAuthor } from '../integrations/tempo/index.js'
import { tempoConfigRepository } from '../modules/tempo-config/repository.js'
import { readToken } from '../lib/secure-tokens.js'

export interface SyncTempoPayload {
  projectId: string
}

export async function syncTempoProcessor(job: Job<SyncTempoPayload>) {
  const { projectId } = job.data

  // 1. Get project with Tempo config and sprints
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tempoConfig: true,
      sprints: {
        where: { state: { in: ['ACTIVE', 'CLOSED'] } },
        orderBy: { startDate: 'desc' },
      },
    },
  })

  if (!project) {
    return { skipped: true, reason: 'Project not found' }
  }

  if (!project.tempoConfig?.isActive || !project.jiraProjectKey) {
    return { skipped: true, reason: 'Tempo not configured, inactive, or no Jira project key' }
  }

  // Decrypt API token
  const apiToken = readToken(project.tempoConfig.apiToken)
  if (!apiToken) {
    throw new Error('Tempo API token is invalid or corrupted')
  }
  const jiraProjectKey = project.jiraProjectKey

  const syncLog = await prisma.syncLog.create({
    data: {
      type: 'TEMPO',
      status: 'RUNNING',
      project: { connect: { id: projectId } },
    },
  })

  const startTime = Date.now()
  let itemsSynced = 0

  try {
    // 2. Build developer map (jiraAccountId -> developerId)
    // Note: Developers are shared across orgs, filtered via ProjectDeveloper relation
    const developers = await prisma.developer.findMany({
      where: {
        jiraAccountId: { not: null },
        projects: {  // ✅ Tenant isolation: only devs linked to this org's projects
          some: {
            project: {
              organizationId: project.organizationId
            }
          }
        }
      },
      select: { id: true, jiraAccountId: true },
    })
    const devMap = new Map(developers.map((d) => [d.jiraAccountId!, d.id]))

    await job.updateProgress(10)

    // 3. Process each sprint
    const totalSprints = project.sprints.length
    let processedSprints = 0

    for (const sprint of project.sprints) {
      if (!sprint.startDate || !sprint.endDate) continue

      const from = sprint.startDate.toISOString().split('T')[0]!
      const to = sprint.endDate.toISOString().split('T')[0]!

      // 4. Fetch worklogs for this sprint's date range
      const worklogs = await getWorklogs(
        apiToken,
        jiraProjectKey,
        from,
        to
      )

      // 5. Aggregate hours by author
      const hoursByAuthor = aggregateWorklogsByAuthor(worklogs)

      // 6. Upsert SprintHours for each developer
      for (const [accountId, data] of hoursByAuthor) {
        const developerId = devMap.get(accountId)
        if (!developerId) continue

        await prisma.sprintHours.upsert({
          where: {
            sprintId_developerId_source: {
              sprintId: sprint.id,
              developerId,
              source: 'tempo',
            },
          },
          create: {
            sprintId: sprint.id,
            developerId,
            hoursLogged: data.totalHours,
            source: 'tempo',
            externalId: data.externalIds.join(','),
          },
          update: {
            hoursLogged: data.totalHours,
            externalId: data.externalIds.join(','),
          },
        })
        itemsSynced++
      }

      processedSprints++
      const progress = 10 + Math.round((processedSprints / totalSprints) * 80)
      await job.updateProgress(progress)
    }

    // 7. Update lastSyncAt on config
    await tempoConfigRepository.updateLastSyncAt(projectId)

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
