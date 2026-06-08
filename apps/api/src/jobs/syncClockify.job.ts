import type { Job } from 'bullmq'
import { prisma } from '../lib/prisma.js'
import {
  getTimeEntries,
  getWorkspaceUsers,
  aggregateEntriesByUser,
} from '../integrations/clockify/index.js'
import { clockifyConfigRepository } from '../modules/clockify-config/repository.js'
import { readToken } from '../lib/secure-tokens.js'

export interface SyncClockifyPayload {
  projectId: string
}

export async function syncClockifyProcessor(job: Job<SyncClockifyPayload>) {
  const { projectId } = job.data

  // 1. Get project with Clockify config and sprints
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      clockifyConfig: true,
      sprints: {
        where: { state: { in: ['ACTIVE', 'CLOSED'] } },
        orderBy: { startDate: 'desc' },
      },
    },
    // Explicitly select organizationId for tenant isolation
  })

  if (!project) {
    return { skipped: true, reason: 'Project not found' }
  }

  if (!project?.clockifyConfig?.isActive) {
    return { skipped: true, reason: 'Clockify not configured or inactive' }
  }

  // Decrypt API key
  const apiKey = readToken(project.clockifyConfig.apiKey)
  if (!apiKey) {
    throw new Error('Clockify API key is invalid or corrupted')
  }
  const { workspaceId } = project.clockifyConfig

  const syncLog = await prisma.syncLog.create({
    data: {
      type: 'CLOCKIFY',
      status: 'RUNNING',
      project: { connect: { id: projectId } },
    },
  })

  const startTime = Date.now()
  let itemsSynced = 0

  try {
    // 2. Fetch Clockify users to build userId -> email map
    const clockifyUsers = await getWorkspaceUsers(apiKey, workspaceId)
    const userIdToEmail = new Map(clockifyUsers.map((u) => [u.id, u.email.toLowerCase()]))

    await job.updateProgress(10)

    // 3. Build developer map (email -> developerId)
    // Note: Developers are shared across orgs, filtered via ProjectDeveloper relation
    const developers = await prisma.developer.findMany({
      where: {
        email: { not: null },
        projects: {  // ✅ Tenant isolation: only devs linked to this org's projects
          some: {
            project: {
              organizationId: project.organizationId
            }
          }
        }
      },
      select: { id: true, email: true },
    })
    const devMapByEmail = new Map(developers.map((d) => [d.email!.toLowerCase(), d.id]))

    await job.updateProgress(20)

    // 4. Process each sprint
    const totalSprints = project.sprints.length
    let processedSprints = 0

    for (const sprint of project.sprints) {
      if (!sprint.startDate || !sprint.endDate) continue

      const start = sprint.startDate.toISOString()
      const end = sprint.endDate.toISOString()

      // 5. Fetch time entries for each Clockify user
      const allEntries = []
      for (const clockifyUser of clockifyUsers) {
        const entries = await getTimeEntries(apiKey, workspaceId, clockifyUser.id, start, end)
        allEntries.push(...entries)
      }

      // 6. Aggregate entries by user
      const hoursByClockifyUser = aggregateEntriesByUser(allEntries)

      // 7. Upsert SprintHours for each developer (matched by email)
      for (const [clockifyUserId, data] of hoursByClockifyUser) {
        const email = userIdToEmail.get(clockifyUserId)
        if (!email) continue

        const developerId = devMapByEmail.get(email)
        if (!developerId) continue

        await prisma.sprintHours.upsert({
          where: {
            sprintId_developerId_source: {
              sprintId: sprint.id,
              developerId,
              source: 'clockify',
            },
          },
          create: {
            sprintId: sprint.id,
            developerId,
            hoursLogged: data.totalHours,
            source: 'clockify',
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
      const progress = 20 + Math.round((processedSprints / totalSprints) * 70)
      await job.updateProgress(progress)
    }

    // 8. Update lastSyncAt on config
    await clockifyConfigRepository.updateLastSyncAt(projectId)

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
