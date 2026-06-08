import { prisma } from '../../lib/prisma.js'

export const developerRepository = {
  findByProjectId(projectId: string, organizationId?: string) {
    return prisma.projectDeveloper.findMany({
      where: {
        projectId,
        ...(organizationId && {  // ✅ Tenant isolation
          project: { organizationId }
        })
      },
      include: { developer: true },
      orderBy: { rating: 'desc' },
    })
  },

  findCards(projectId: string, developerId: string, organizationId?: string) {
    return prisma.issue.findMany({
      where: {
        developerId,
        sprint: {
          projectId,
          ...(organizationId && {  // ✅ Tenant isolation
            project: { organizationId }
          })
        },
      },
      include: { epic: true },
      orderBy: { updatedAt: 'desc' },
    })
  },
}
