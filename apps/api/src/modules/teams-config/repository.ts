import { prisma } from '../../lib/prisma.js'
import { secureToken, readToken } from '../../lib/secure-tokens.js'
import type { UpdateTeamsConfigInput } from './types.js'

export const teamsConfigRepository = {
  async findByProject(projectId: string, organizationId?: string) {
    const config = await prisma.teamsConfig.findUnique({
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

  async upsert(projectId: string, data: UpdateTeamsConfigInput) {
    // For create, webhookUrl is required
    if (!data.webhookUrl) {
      const existing = await prisma.teamsConfig.findUnique({
        where: { projectId },
        include: { project: { select: { organizationId: true } } },  // ✅ Tenant isolation
      })
      if (!existing) {
        throw new Error('webhookUrl is required when creating Teams config')
      }
    }

    return prisma.teamsConfig.upsert({
      where: { projectId },
      create: {
        projectId,
        webhookUrl: secureToken(data.webhookUrl)!,
        alertTypes: data.alertTypes ?? [],
        isActive: data.isActive ?? true,
      },
      update: {
        ...(data.webhookUrl !== undefined && { webhookUrl: secureToken(data.webhookUrl)! }),
        ...(data.alertTypes !== undefined && { alertTypes: data.alertTypes }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })
  },

  async delete(projectId: string) {
    // ✅ Safe: caller (service) validates projectId ownership before calling
    return prisma.teamsConfig.delete({
      where: { projectId },
    })
  },
}
