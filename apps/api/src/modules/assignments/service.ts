import { assignmentRepository } from './repository.js'
import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import type { GPPortfolio, Project } from '@spravio/types'

export const assignmentService = {
  async listByProject(projectId: string) {
    return assignmentRepository.findByProject(projectId)
  },

  async assign(projectId: string, userId: string) {
    // Validate project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      throw new AppError('PROJECT_NOT_FOUND', `Project ${projectId} not found`, 404)
    }

    // Validate user exists and is in the same org
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        userId,
        organizationId: project.organizationId,
      },
    })
    if (!orgUser) {
      throw new AppError('USER_NOT_IN_ORG', 'User is not a member of this organization', 400)
    }

    if (orgUser.role === 'VIEWER') {
      throw new AppError('VIEWER_CANNOT_BE_ASSIGNED', 'Viewers cannot be assigned to projects', 400)
    }

    return assignmentRepository.create(projectId, userId)
  },

  async unassign(projectId: string, userId: string) {
    return assignmentRepository.delete(projectId, userId)
  },

  async getGPPortfolios(orgId: string): Promise<GPPortfolio[]> {
    const gps = await assignmentRepository.findAllGroupedByGP(orgId)

    return gps.map((gp: typeof gps[number]) => ({
      userId: gp.id,
      name: gp.name ?? gp.email,
      projects: gp.assignments.map((a: typeof gp.assignments[number]) => ({
        id: a.project.id,
        name: a.project.name,
        source: a.project.source as 'jira' | 'azure',
        jiraProjectKey: a.project.jiraProjectKey,
        azureProjectId: a.project.azureProjectId,
        githubRepo: a.project.githubRepo,
        isActive: a.project.isActive,
        lastSyncAt: a.project.lastSyncAt?.toISOString() ?? null,
        assignedGPId: gp.id,
        assignedGPName: gp.name ?? gp.email,
      } satisfies Project)),
      totalProjects: gp.assignments.length,
    }))
  },
}
