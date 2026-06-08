import * as Sentry from '@sentry/node'
import { env } from './config/env.js'
import { buildApp } from './app.js'
import { redis } from './lib/redis.js'
import { createWorker } from './jobs/queue.js'
import { syncProjectProcessor, type SyncProjectPayload } from './jobs/syncProject.job.js'
import { syncSprintProcessor, type SyncSprintPayload } from './jobs/syncSprint.job.js'
import { syncGithubProcessor, type SyncGithubPayload } from './jobs/syncGithub.job.js'
import { syncAzureProjectProcessor, type SyncAzureProjectPayload } from './jobs/syncAzureProject.job.js'
import { syncGitlabProcessor, type SyncGitlabPayload } from './jobs/syncGitlab.job.js'
import { syncTempoProcessor, type SyncTempoPayload } from './jobs/syncTempo.job.js'
import { syncClockifyProcessor, type SyncClockifyPayload } from './jobs/syncClockify.job.js'
import { syncTrelloProcessor, type SyncTrelloPayload } from './jobs/syncTrello.job.js'
import { syncClickUpProcessor, type SyncClickUpPayload } from './jobs/syncClickUp.job.js'
import { syncLinearProcessor, type SyncLinearPayload } from './jobs/syncLinear.job.js'
import { syncAsanaProcessor, type SyncAsanaPayload } from './jobs/syncAsana.job.js'
import { syncMondayProcessor, type SyncMondayPayload } from './jobs/syncMonday.job.js'
import { slackAlertProcessor } from './jobs/slackAlert.job.js'
import { teamsAlertProcessor } from './jobs/teamsAlert.job.js'
import { startScheduler, stopScheduler } from './jobs/scheduler.js'
import type { Job, Worker } from 'bullmq'
import type { SlackAlertJob } from './integrations/slack/types.js'
import type { TeamsAlertJob } from './integrations/teams/types.js'

const app = buildApp()
const workers: Worker[] = []

function startWorkers() {
  const syncWorker = createWorker<SyncProjectPayload | SyncSprintPayload | SyncGithubPayload | SyncAzureProjectPayload | SyncGitlabPayload | SyncTempoPayload | SyncClockifyPayload | SyncTrelloPayload | SyncClickUpPayload | SyncLinearPayload | SyncAsanaPayload | SyncMondayPayload>('sync', async (job) => {
    if (job.name === 'sync-project') {
      return syncProjectProcessor(job as Job<SyncProjectPayload>)
    }
    if (job.name === 'sync-sprint') {
      return syncSprintProcessor(job as Job<SyncSprintPayload>)
    }
    if (job.name === 'sync-github') {
      return syncGithubProcessor(job as Job<SyncGithubPayload>)
    }
    if (job.name === 'sync-azure-project') {
      return syncAzureProjectProcessor(job as Job<SyncAzureProjectPayload>)
    }
    if (job.name === 'sync-gitlab') {
      return syncGitlabProcessor(job as Job<SyncGitlabPayload>)
    }
    if (job.name === 'sync-tempo') {
      return syncTempoProcessor(job as Job<SyncTempoPayload>)
    }
    if (job.name === 'sync-clockify') {
      return syncClockifyProcessor(job as Job<SyncClockifyPayload>)
    }
    if (job.name === 'sync-trello') {
      return syncTrelloProcessor(job as Job<SyncTrelloPayload>)
    }
    if (job.name === 'sync-clickup') {
      return syncClickUpProcessor(job as Job<SyncClickUpPayload>)
    }
    if (job.name === 'sync-linear') {
      return syncLinearProcessor(job as Job<SyncLinearPayload>)
    }
    if (job.name === 'sync-asana') {
      return syncAsanaProcessor(job as Job<SyncAsanaPayload>)
    }
    if (job.name === 'sync-monday') {
      return syncMondayProcessor(job as Job<SyncMondayPayload>)
    }
    throw new Error(`Unknown job name: ${job.name}`)
  })

  syncWorker.on('completed', (job) => {
    app.log.info(`Job ${job.name}[${job.id}] completed`)
  })

  syncWorker.on('failed', (job, err) => {
    app.log.error(`Job ${job?.name}[${job?.id}] failed: ${err.message}`)
    if (env.SENTRY_DSN_API) {
      Sentry.captureException(err, {
        tags: { 'bullmq.job_name': job?.name, 'bullmq.queue': 'sync' },
      })
    }
  })

  workers.push(syncWorker)

  const alertWorker = createWorker<SlackAlertJob | TeamsAlertJob>('alerts', async (job) => {
    if (job.name === 'slack-alert') {
      return slackAlertProcessor(job as Job<SlackAlertJob>)
    }
    if (job.name === 'teams-alert') {
      return teamsAlertProcessor(job as Job<TeamsAlertJob>)
    }
    throw new Error(`Unknown alert job name: ${job.name}`)
  })

  alertWorker.on('completed', (job) => {
    app.log.info(`Alert job ${job.name}[${job.id}] completed`)
  })

  alertWorker.on('failed', (job, err) => {
    app.log.error(`Alert job ${job?.name}[${job?.id}] failed: ${err.message}`)
    if (env.SENTRY_DSN_API) {
      Sentry.captureException(err, {
        tags: { 'bullmq.job_name': job?.name, 'bullmq.queue': 'alerts' },
      })
    }
  })

  workers.push(alertWorker)
  app.log.info('BullMQ workers started')
}

async function start() {
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    startWorkers()
    startScheduler()
    app.log.info('Periodic sync scheduler started')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

async function shutdown(signal: string) {
  app.log.info(`${signal} received. Shutting down gracefully...`)
  stopScheduler()
  await Promise.all(workers.map((w) => w.close()))
  await app.close()
  await redis.quit()
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

start()
