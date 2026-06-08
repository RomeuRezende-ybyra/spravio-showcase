import { prisma } from '../../lib/prisma.js'

export const sprintRepository = {
  findByProjectId(projectId: string, organizationId?: string) {
    return prisma.sprint.findMany({
      where: {
        projectId,
        ...(organizationId && {  // ✅ Tenant isolation
          project: { organizationId }
        })
      },
      orderBy: { startDate: 'desc' },
      include: {
        _count: { select: { issues: true } },
      },
    })
  },

  findCurrent(projectId: string, organizationId?: string) {
    return prisma.sprint.findFirst({
      where: {
        projectId,
        state: 'ACTIVE',
        ...(organizationId && {  // ✅ Tenant isolation
          project: { organizationId }
        })
      },
      include: {
        issues: {
          include: {
            developer: true,
            epic: true,
          },
        },
        burndownPoints: {
          orderBy: { date: 'asc' },
        },
      },
    })
  },
}
