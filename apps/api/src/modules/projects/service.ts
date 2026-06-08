import { projectRepository } from './repository.js'
import { prisma } from '../../lib/prisma.js'
import { syncQueue } from '../../jobs/queue.js'
import { AppError } from '../../lib/errors.js'
import type { CreateProjectInput, UpdateProjectInput } from './types.js'
import type { SyncProjectPayload } from '../../jobs/syncProject.job.js'
import type { SyncAzureProjectPayload } from '../../jobs/syncAzureProject.job.js'

export const projectService = {
  async list() {
    return projectRepository.findAll()
  },

  async getById(id: string) {
    const project = await projectRepository.findById(id)
    if (!project) {
      throw new AppError('PROJECT_NOT_FOUND', `Project ${id} not found`, 404)
    }
    return project
  },

  async create(input: CreateProjectInput) {
    const { pmId, devIds, ...projectInput } = input
    const project = await projectRepository.create(projectInput as CreateProjectInput)

    // Create team assignments (PM + devs)
    const memberIds = [
      ...(pmId ? [pmId] : []),
      ...devIds.filter((id) => id !== pmId),
    ]
    if (memberIds.length > 0) {
      await prisma.projectAssignment.createMany({
        data: memberIds.map((userId) => ({
          projectId: project.id,
          userId,
        })),
        skipDuplicates: true,
      })
    }

    // Trigger the appropriate sync job based on source
    if (project.source === 'azure' && project.azureProjectId) {
      await syncQueue.add('sync-azure-project', {
        projectId: project.id,
        azureProjectId: project.azureProjectId,
      } satisfies SyncAzureProjectPayload)
    } else if (project.jiraProjectKey) {
      await syncQueue.add('sync-project', {
        projectId: project.id,
        jiraProjectKey: project.jiraProjectKey,
      } satisfies SyncProjectPayload)
    }

    return project
  },

  async listByOrg(orgId: string) {
    return projectRepository.findAllByOrg(orgId)
  },

  async listByAssignment(userId: string) {
    return projectRepository.findByAssignment(userId)
  },

  async update(id: string, input: UpdateProjectInput) {
    const project = await projectRepository.findById(id)
    if (!project) {
      throw new AppError('PROJECT_NOT_FOUND', `Project ${id} not found`, 404)
    }

    const updated = await projectRepository.update(id, input)

    // Trigger sync if credentials were just added
    const credentialsAdded =
      (input.jiraProjectKey && !project.jiraProjectKey) ||
      (input.azureProjectId && !project.azureProjectId)

    if (credentialsAdded) {
      if (updated.source === 'azure' && updated.azureProjectId) {
        await syncQueue.add('sync-azure-project', {
          projectId: updated.id,
          azureProjectId: updated.azureProjectId,
        } satisfies SyncAzureProjectPayload)
      } else if (updated.jiraProjectKey) {
        await syncQueue.add('sync-project', {
          projectId: updated.id,
          jiraProjectKey: updated.jiraProjectKey,
        } satisfies SyncProjectPayload)
      }
    }

    return updated
  },

  async remove(id: string) {
    const project = await projectRepository.findById(id)
    if (!project) {
      throw new AppError('PROJECT_NOT_FOUND', `Project ${id} not found`, 404)
    }
    return projectRepository.softDelete(id)
  },
}
