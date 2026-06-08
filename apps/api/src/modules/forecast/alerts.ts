import { prisma } from '../../lib/prisma.js'
import { sendWebhookMessage, sendChannelMessage } from '../../integrations/slack/client.js'
import { sendTeamsMessage } from '../../integrations/teams/client.js'
import { buildDeliveryRiskMessage } from '../../integrations/slack/templates.js'
import { buildTeamsDeliveryRiskCard } from '../../integrations/teams/templates.js'
import type { ForecastOutput } from '../../integrations/anthropic/types.js'

export async function sendForecastAlert(projectId: string, forecast: ForecastOutput): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { slackConfig: true, teamsConfig: true },
  })

  if (!project) return

  // Send Slack alert if configured
  if (project.slackConfig?.isActive && project.slackConfig.alertTypes.includes('sprint_health')) {
    try {
      const blocks = buildDeliveryRiskMessage(project.name, forecast)
      const text = `Delivery Risk Alert: ${forecast.onTimeProbability}% on-time probability for ${project.name}`

      if (project.slackConfig.webhookUrl) {
        await sendWebhookMessage(project.slackConfig.webhookUrl, blocks, text)
      } else if (project.slackConfig.channelId) {
        await sendChannelMessage(project.slackConfig.channelId, blocks, text)
      }
    } catch (error) {
      console.error('Failed to send Slack forecast alert:', error)
    }
  }

  // Send Teams alert if configured
  if (project.teamsConfig?.isActive && project.teamsConfig.alertTypes.includes('sprint_health')) {
    try {
      const card = buildTeamsDeliveryRiskCard(project.name, forecast)
      const summary = `Delivery Risk Alert: ${forecast.onTimeProbability}% on-time probability for ${project.name}`
      await sendTeamsMessage(project.teamsConfig.webhookUrl, card, summary)
    } catch (error) {
      console.error('Failed to send Teams forecast alert:', error)
    }
  }
}
