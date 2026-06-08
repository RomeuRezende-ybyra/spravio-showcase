import { prisma } from '../../lib/prisma.js'

export const assignmentRepository = {
  findByProject(projectId: string, organizationId?: string) {
    return prisma.projectAssignment.findMany({
      where: {
        projectId,
        ...(organizationId && {  // ✅ Tenant isolation (optional for backwards compat)
          project: { organizationId }
        })
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { assignedAt: 'desc' },
    })
  },

  findByUser(userId: string) {
    return prisma.projectAssignment.findMany({
      where: { userId },
      include: {
        project: true,
      },
      orderBy: { assignedAt: 'desc' },
    })
  },

  create(projectId: string, userId: string) {
    return prisma.projectAssignment.create({
      data: { projectId, userId },
    })
  },

  delete(projectId: string, userId: string) {
    return prisma.projectAssignment.delete({
      where: { projectId_userId: { projectId, userId } },
    })
  },

  findAllGroupedByGP(orgId: string) {
    return prisma.user.findMany({
      where: {
        organizations: {
          some: {
            organizationId: orgId,
            role: 'PROJECT_MANAGER',
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        assignments: {
          include: {
            project: true,
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
    })
  },
}
