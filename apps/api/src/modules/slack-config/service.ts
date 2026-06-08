import { slackConfigRepository } from './repository.js'
import { sendWebhookMessage, sendChannelMessage } from '../../integrations/slack/client.js'
import { buildTestMessage } from '../../integrations/slack/templates.js'
import { AppError } from '../../lib/errors.js'
import { prisma } from '../../lib/prisma.js'
import type { UpdateSlackConfigInput } from './types.js'

export const slackConfigService = {
  async getConfig(projectId: string) {
    return slackConfigRepository.findByProject(projectId)
  },

  async upsertConfig(projectId: string, input: UpdateSlackConfigInput) {
    return slackConfigRepository.upsert(projectId, input)
  },

  async testWebhook(projectId: string) {
    const config = await slackConfigRepository.findByProject(projectId)
    if (!config) {
      throw new AppError('SLACK_NOT_CONFIGURED', 'Slack is not configured for this project', 400)
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    })

    const blocks = buildTestMessage(project?.name ?? 'Unknown Project')
    const text = 'Spravio test message — Slack integration is working!'

    if (config.webhookUrl) {
      await sendWebhookMessage(config.webhookUrl, blocks, text)
    } else if (config.channelId) {
      await sendChannelMessage(config.channelId, blocks, text)
    } else {
      throw new AppError('SLACK_NO_TARGET', 'No webhook URL or channel ID configured', 400)
    }
  },
}
