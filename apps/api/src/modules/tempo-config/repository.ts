import { prisma } from '../../lib/prisma.js'
import type { UpdateTempoConfigInput } from './types.js'

export const tempoConfigRepository = {
  async findByProject(projectId: string, organizationId?: string) {
    const config = await prisma.tempoConfig.findUnique({
      where: { projectId },
      include: { project: { select: { organizationId: true } } },  // ✅ Tenant isolation
    })

    // Validate tenant isolation if organizationId is provided
    if (config && organizationId && config.project.organizationId !== organizationId) {
      return null
    }

    return config
  },

  async upsert(projectId: string, data: UpdateTempoConfigInput) {
    return prisma.tempoConfig.upsert({
      where: { projectId },
      create: {
        projectId,
        apiToken: data.apiToken,
        isActive: data.isActive ?? true,
      },
      update: {
        apiToken: data.apiToken,
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })
  },

  async updateLastSyncAt(projectId: string) {
    // ✅ Safe: caller (service/job) validates projectId ownership before calling
    return prisma.tempoConfig.update({
      where: { projectId },
      data: { lastSyncAt: new Date() },
    })
  },

  async delete(projectId: string) {
    // ✅ Safe: caller (service) validates projectId ownership before calling
    return prisma.tempoConfig.delete({
      where: { projectId },
    })
  },
}
