import { prisma } from '../../lib/prisma.js'
import { secureToken, readToken } from '../../lib/secure-tokens.js'
import type { UpdateSlackConfigInput } from './types.js'

export const slackConfigRepository = {
  async findByProject(projectId: string, organizationId?: string) {
    const config = await prisma.slackConfig.findUnique({
      where: { projectId },
      include: { project: { select: { organizationId: true } } },  // ✅ Tenant isolation
    })

    // Validate tenant isolation if organizationId is provided
    if (config && organizationId && config.project.organizationId !== organizationId) {
      return null
    }

    if (config) {
      config.webhookUrl = readToken(config.webhookUrl) ?? config.webhookUrl
    }
    return config
  },

  async upsert(projectId: string, data: UpdateSlackConfigInput) {
    return prisma.slackConfig.upsert({
      where: { projectId },
      create: {
        projectId,
        webhookUrl: secureToken(data.webhookUrl) ?? null,
        channelId: data.channelId ?? null,
        alertTypes: data.alertTypes ?? [],
        isActive: data.isActive ?? true,
      },
      update: {
        ...(data.webhookUrl !== undefined && { webhookUrl: secureToken(data.webhookUrl) }),
        ...(data.channelId !== undefined && { channelId: data.channelId }),
        ...(data.alertTypes !== undefined && { alertTypes: data.alertTypes }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })
  },
}
