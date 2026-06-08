import { prisma } from '../../lib/prisma.js'
import type { CreateProjectInput, UpdateProjectInput } from './types.js'

export const projectRepository = {
  findAll(organizationId?: string) {
    return prisma.project.findMany({
      where: {
        isActive: true,
        ...(organizationId && { organizationId })  // ✅ Tenant isolation
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
    })
  },

  create(input: CreateProjectInput) {
    return prisma.project.create({
      data: {
        name: input.name,
        key: input.key ?? null,
        description: input.description ?? null,
        tags: input.tags ?? [],
        contractType: input.contractType ?? null,
        contractValue: input.contractValue ?? null,
        estimatedHours: input.estimatedHours ?? null,
        startDate: input.startDate ? new Date(input.startDate) : null,
        deadline: input.deadline ? new Date(input.deadline) : null,
        source: input.source ?? 'jira',
        jiraProjectKey: input.jiraProjectKey ?? null,
        azureProjectId: input.azureProjectId ?? null,
        githubRepo: input.githubRepo ?? null,
        organization: { connect: { id: input.organizationId } },
        ...(input.clientId && { client: { connect: { id: input.clientId } } }),
      },
    })
  },

  findAllByOrg(orgId: string) {
    return prisma.project.findMany({
      where: { organizationId: orgId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  findByAssignment(userId: string, organizationId?: string) {
    return prisma.project.findMany({
      where: {
        isActive: true,
        assignments: { some: { userId } },
        ...(organizationId && { organizationId })  // ✅ Tenant isolation
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  update(id: string, input: UpdateProjectInput) {
    // ✅ Safe: caller (service) validates project ownership before calling
    return prisma.project.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.source && { source: input.source }),
        ...(input.jiraProjectKey !== undefined && { jiraProjectKey: input.jiraProjectKey }),
        ...(input.azureProjectId !== undefined && { azureProjectId: input.azureProjectId }),
        ...(input.githubRepo !== undefined && { githubRepo: input.githubRepo }),
      },
    })
  },

  async softDelete(id: string) {
    // ✅ Safe: caller (service) validates project ownership before calling
    return prisma.project.update({
      where: { id },
      data: { isActive: false },
    })
  },
}
