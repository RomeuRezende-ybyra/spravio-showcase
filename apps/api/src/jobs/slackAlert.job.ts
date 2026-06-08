import type { Job } from 'bullmq'
import { prisma } from '../lib/prisma.js'
import { sendWebhookMessage, sendChannelMessage } from '../integrations/slack/client.js'
import {
  buildStalePRAlert,
  buildBudgetAlert,
  buildSprintHealthAlert,
  buildDoneWithoutCodeAlert,
} from '../integrations/slack/templates.js'
import type { SlackAlertJob } from '../integrations/slack/types.js'

export async function slackAlertProcessor(job: Job<SlackAlertJob>) {
  const { projectId, alertType, severity, payload } = job.data

  // 1. Validate project exists and get organizationId for tenant isolation
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, organizationId: true },
  })
  if (!project) return

  // 2. Load SlackConfig for the project
  const config = await prisma.slackConfig.findUnique({
    where: { projectId },
    include: { project: { select: { organizationId: true } } },  // ✅ Tenant isolation
  })

  if (!config || !config.isActive) return
  if (!config.alertTypes.includes(alertType)) return

  // Validate tenant isolation
  if (config.project.organizationId !== project.organizationId) {
    throw new Error(`SlackConfig organizationId mismatch for project ${projectId}`)
  }

  // 2. Build Block Kit message
  const { projectName, details } = payload
  let blocks: import('@slack/web-api').KnownBlock[]
  let text: string

  switch (alertType) {
    case 'stale_pr':
      blocks = buildStalePRAlert(
        projectName,
        details.prTitle as string,
        details.prNumber as number,
        severity,
        details.hoursOpen as number,
      )
      text = `Stale PR: #${details.prNumber} ${details.prTitle} (${Math.round(details.hoursOpen as number)}h)`
      break

    case 'budget':
      blocks = buildBudgetAlert(
        projectName,
        details.consumedPercent as number,
        details.totalBudget as number,
        details.spent as number,
      )
      text = `Budget alert: ${(details.consumedPercent as number).toFixed(1)}% consumed`
      break

    case 'sprint_health':
      blocks = buildSprintHealthAlert(
        projectName,
        details.sprintName as string,
        details.completionPercent as number,
        details.daysRemaining as number,
      )
      text = `Sprint health: ${details.sprintName} at ${(details.completionPercent as number).toFixed(1)}%`
      break

    case 'done_without_code':
      blocks = buildDoneWithoutCodeAlert(
        projectName,
        details.issueKey as string,
        details.issueTitle as string,
      )
      text = `Done without code: ${details.issueKey} ${details.issueTitle}`
      break

    default:
      return
  }

  // 3. Send via webhook or channel
  if (config.webhookUrl) {
    await sendWebhookMessage(config.webhookUrl, blocks, text)
  } else if (config.channelId) {
    await sendChannelMessage(config.channelId, blocks, text)
  }
}
