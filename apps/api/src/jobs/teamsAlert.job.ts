import type { Job } from 'bullmq'
import { prisma } from '../lib/prisma.js'
import { sendTeamsMessage } from '../integrations/teams/client.js'
import * as templates from '../integrations/teams/templates.js'
import type { TeamsAlertJob } from '../integrations/teams/types.js'

export async function teamsAlertProcessor(job: Job<TeamsAlertJob>) {
  const { projectId, alertType, severity, payload } = job.data

  // Validate project exists and get organizationId for tenant isolation
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, organizationId: true },
  })
  if (!project) return

  const config = await prisma.teamsConfig.findUnique({
    where: { projectId },
    include: { project: { select: { organizationId: true } } },  // ✅ Tenant isolation
  })

  if (!config || !config.isActive) return
  if (!config.alertTypes.includes(alertType)) return

  // Validate tenant isolation
  if (config.project.organizationId !== project.organizationId) {
    throw new Error(`TeamsConfig organizationId mismatch for project ${projectId}`)
  }

  const details = payload.details as Record<string, number | string>

  let card
  let summary: string

  switch (alertType) {
    case 'stale_pr':
      card = templates.buildStalePRCard(
        payload.projectName,
        String(details.title ?? ''),
        Number(details.prNumber ?? 0),
        severity,
        Number(details.hoursOpen ?? 0)
      )
      summary = `Stale PR: ${details.title}`
      break

    case 'budget':
      card = templates.buildBudgetCard(
        payload.projectName,
        Number(details.consumedPercent ?? 0),
        Number(details.totalBudget ?? 0),
        Number(details.spent ?? 0)
      )
      summary = `Budget Alert: ${details.consumedPercent}% consumed`
      break

    case 'sprint_health':
      card = templates.buildSprintHealthCard(
        payload.projectName,
        String(details.sprintName ?? ''),
        Number(details.completionPercent ?? 0),
        Number(details.daysRemaining ?? 0)
      )
      summary = `Sprint Health: ${details.completionPercent}% complete`
      break

    case 'done_without_code':
      card = templates.buildDoneWithoutCodeCard(
        payload.projectName,
        String(details.issueKey ?? ''),
        String(details.issueTitle ?? '')
      )
      summary = `Done Without Code: ${details.issueKey}`
      break

    default:
      return
  }

  await sendTeamsMessage(config.webhookUrl, card, summary)
}
