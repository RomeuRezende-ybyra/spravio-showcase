import { prisma } from '../../lib/prisma.js'
import type { UpdateClockifyConfigInput } from './types.js'

export const clockifyConfigRepository = {
  async findByProject(projectId: string, organizationId?: string) {
    const config = await prisma.clockifyConfig.findUnique({
      where: { projectId },
      include: { project: { select: { organizationId: true } } },  // ✅ Tenant isolation
    })

    // Validate tenant isolation if organizationId is provided
    if (config && organizationId && config.project.organizationId !== organizationId) {
      return null
    }

    return config
  },

  async upsert(projectId: string, data: UpdateClockifyConfigInput) {
    return prisma.clockifyConfig.upsert({
      where: { projectId },
      create: {
        projectId,
        apiKey: data.apiKey,
        workspaceId: data.workspaceId,
        isActive: data.isActive ?? true,
      },
      update: {
        apiKey: data.apiKey,
        workspaceId: data.workspaceId,
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })
  },

  async updateLastSyncAt(projectId: string) {
    // ✅ Safe: caller (service/job) validates projectId ownership before calling
    return prisma.clockifyConfig.update({
      where: { projectId },
      data: { lastSyncAt: new Date() },
    })
  },

  async delete(projectId: string) {
    // ✅ Safe: caller (service) validates projectId ownership before calling
    return prisma.clockifyConfig.delete({
      where: { projectId },
    })
  },
}
