import { teamsConfigRepository } from './repository.js'
import { sendTeamsMessage } from '../../integrations/teams/client.js'
import { buildTestCard } from '../../integrations/teams/templates.js'
import { AppError } from '../../lib/errors.js'
import { prisma } from '../../lib/prisma.js'
import type { UpdateTeamsConfigInput } from './types.js'

export const teamsConfigService = {
  async getConfig(projectId: string) {
    return teamsConfigRepository.findByProject(projectId)
  },

  async upsertConfig(projectId: string, input: UpdateTeamsConfigInput) {
    return teamsConfigRepository.upsert(projectId, input)
  },

  async deleteConfig(projectId: string) {
    return teamsConfigRepository.delete(projectId)
  },

  async testWebhook(projectId: string) {
    const config = await teamsConfigRepository.findByProject(projectId)
    if (!config) {
      throw new AppError('TEAMS_NOT_CONFIGURED', 'Teams is not configured for this project', 400)
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    })

    const card = buildTestCard(project?.name ?? 'Unknown Project')
    const summary = 'Spravio test message — Teams integration is working!'

    await sendTeamsMessage(config.webhookUrl, card, summary)
  },
}
