import * as Sentry from '@sentry/node'
import { syncQueue } from './queue.js'
import { prisma } from '../lib/prisma.js'
import { env } from '../config/env.js'
import type { SyncProjectPayload } from './syncProject.job.js'
import type { SyncGithubPayload } from './syncGithub.job.js'
import type { SyncAzureProjectPayload } from './syncAzureProject.job.js'
import type { SyncGitlabPayload } from './syncGitlab.job.js'
import type { SyncTempoPayload } from './syncTempo.job.js'
import type { SyncClockifyPayload } from './syncClockify.job.js'
import type { SyncTrelloPayload } from './syncTrello.job.js'
import type { SyncClickUpPayload } from './syncClickUp.job.js'
import type { SyncLinearPayload } from './syncLinear.job.js'
import type { SyncAsanaPayload } from './syncAsana.job.js'
import type { SyncMondayPayload } from './syncMonday.job.js'

const REFRESH_INTERVAL_MS = 15 * 60 * 1000 // 15 minutes

let intervalId: ReturnType<typeof setInterval> | null = null

async function enqueueActiveProjectSyncs() {
  // ADMIN: Cross-org query - scheduler processes ALL active projects across all organizations
  // TODO: Consider refactoring to iterate by organization for better resource isolation and rate limiting
  const projects = await prisma.project.findMany({
    where: { isActive: true },
    select: {
      id: true,
      source: true,
      jiraProjectKey: true,
      azureProjectId: true,
      trelloBoardId: true,
      clickupSpaceId: true,
      linearTeamId: true,
      asanaProjectId: true,
      mondayBoardId: true,
      githubRepo: true,
      gitlabRepo: true,
      tempoConfig: { select: { isActive: true } },
      clockifyConfig: { select: { isActive: true } },
    },
  })

  for (const project of projects) {
    if (project.source === 'azure' && project.azureProjectId) {
      // Azure DevOps project sync
      await syncQueue.add(
        'sync-azure-project',
        {
          projectId: project.id,
          azureProjectId: project.azureProjectId,
        } satisfies SyncAzureProjectPayload,
        { jobId: `refresh-${project.id}`, removeOnComplete: true, removeOnFail: 5 },
      )
    } else if (project.source === 'trello' && project.trelloBoardId) {
      // Trello project sync
      await syncQueue.add(
        'sync-trello',
        {
          projectId: project.id,
          trelloBoardId: project.trelloBoardId,
        } satisfies SyncTrelloPayload,
        { jobId: `refresh-${project.id}`, removeOnComplete: true, removeOnFail: 5 },
      )
    } else if (project.source === 'clickup' && project.clickupSpaceId) {
      // ClickUp project sync
      await syncQueue.add(
        'sync-clickup',
        {
          projectId: project.id,
          clickupSpaceId: project.clickupSpaceId,
        } satisfies SyncClickUpPayload,
        { jobId: `refresh-${project.id}`, removeOnComplete: true, removeOnFail: 5 },
      )
    } else if (project.source === 'linear' && project.linearTeamId) {
      // Linear project sync
      await syncQueue.add(
        'sync-linear',
        {
          projectId: project.id,
          linearTeamId: project.linearTeamId,
        } satisfies SyncLinearPayload,
        { jobId: `refresh-${project.id}`, removeOnComplete: true, removeOnFail: 5 },
      )
    } else if (project.source === 'asana' && project.asanaProjectId) {
      // Asana project sync
      await syncQueue.add(
        'sync-asana',
        {
          projectId: project.id,
          asanaProjectId: project.asanaProjectId,
        } satisfies SyncAsanaPayload,
        { jobId: `refresh-${project.id}`, removeOnComplete: true, removeOnFail: 5 },
      )
    } else if (project.source === 'monday' && project.mondayBoardId) {
      // Monday.com project sync
      await syncQueue.add(
        'sync-monday',
        {
          projectId: project.id,
          mondayBoardId: project.mondayBoardId,
        } satisfies SyncMondayPayload,
        { jobId: `refresh-${project.id}`, removeOnComplete: true, removeOnFail: 5 },
      )
    } else if (project.jiraProjectKey) {
      // Jira project sync
      await syncQueue.add(
        'sync-project',
        {
          projectId: project.id,
          jiraProjectKey: project.jiraProjectKey,
        } satisfies SyncProjectPayload,
        { jobId: `refresh-${project.id}`, removeOnComplete: true, removeOnFail: 5 },
      )
    }

    // GitHub sync for both Jira and Azure projects
    if (project.githubRepo) {
      await syncQueue.add(
        'sync-github',
        {
          projectId: project.id,
          githubRepo: project.githubRepo,
        } satisfies SyncGithubPayload,
        { jobId: `github-${project.id}`, removeOnComplete: true, removeOnFail: 5 },
      )
    }

    // GitLab sync for projects with GitLab repos
    if (project.gitlabRepo) {
      await syncQueue.add(
        'sync-gitlab',
        {
          projectId: project.id,
          gitlabRepo: project.gitlabRepo,
        } satisfies SyncGitlabPayload,
        { jobId: `gitlab-${project.id}`, removeOnComplete: true, removeOnFail: 5 },
      )
    }

    // Tempo sync for projects with active Tempo config
    if (project.tempoConfig?.isActive) {
      await syncQueue.add(
        'sync-tempo',
        { projectId: project.id } satisfies SyncTempoPayload,
        { jobId: `tempo-${project.id}`, removeOnComplete: true, removeOnFail: 5 },
      )
    }

    // Clockify sync for projects with active Clockify config
    if (project.clockifyConfig?.isActive) {
      await syncQueue.add(
        'sync-clockify',
        { projectId: project.id } satisfies SyncClockifyPayload,
        { jobId: `clockify-${project.id}`, removeOnComplete: true, removeOnFail: 5 },
      )
    }
  }
}

export function startScheduler() {
  intervalId = setInterval(() => {
    enqueueActiveProjectSyncs().catch((err) => {
      if (env.SENTRY_DSN_API) {
        Sentry.captureException(err, {
          tags: { 'scheduler.task': 'enqueueActiveProjectSyncs' },
        })
      }
    })
  }, REFRESH_INTERVAL_MS)
}

export function stopScheduler() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
