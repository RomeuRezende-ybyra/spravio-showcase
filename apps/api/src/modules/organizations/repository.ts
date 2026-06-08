import { prisma } from '../../lib/prisma.js'
import type { UpdateOrganizationSettingsInput } from './types.js'

export const organizationRepository = {
  async getSettings(orgId: string) {
    return prisma.organizationSettings.findUnique({
      where: { organizationId: orgId },
    })
  },

  async upsertSettings(orgId: string, data: UpdateOrganizationSettingsInput) {
    return prisma.organizationSettings.upsert({
      where: { organizationId: orgId },
      create: {
        organizationId: orgId,
        ...data,
      },
      update: data,
    })
  },

  async getOrganization(orgId: string) {
    return prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        settings: true,
      },
    })
  },
}
