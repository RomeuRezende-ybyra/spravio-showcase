import { clockifyConfigRepository } from './repository.js'
import { testConnection } from '../../integrations/clockify/endpoints.js'
import { AppError } from '../../lib/errors.js'
import { syncQueue } from '../../jobs/queue.js'
import { secureToken, readToken } from '../../lib/secure-tokens.js'
import type { UpdateClockifyConfigInput } from './types.js'

export const clockifyConfigService = {
  async getConfig(projectId: string) {
    const config = await clockifyConfigRepository.findByProject(projectId)
    if (!config) return null

    // Don't expose the full API key
    return {
      id: config.id,
      projectId: config.projectId,
      workspaceId: config.workspaceId,
      isActive: config.isActive,
      lastSyncAt: config.lastSyncAt,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
      hasApiKey: !!config.apiKey,
    }
  },

  async upsertConfig(projectId: string, input: UpdateClockifyConfigInput) {
    // Encrypt API key before saving
    const securedInput = {
      ...input,
      apiKey: input.apiKey ? secureToken(input.apiKey) ?? input.apiKey : undefined,
    }

    const config = await clockifyConfigRepository.upsert(projectId, securedInput as typeof input)
    return {
      id: config.id,
      projectId: config.projectId,
      workspaceId: config.workspaceId,
      isActive: config.isActive,
      lastSyncAt: config.lastSyncAt,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
      hasApiKey: !!config.apiKey,
    }
  },

  async deleteConfig(projectId: string) {
    return clockifyConfigRepository.delete(projectId)
  },

  async testConnection(projectId: string) {
    const config = await clockifyConfigRepository.findByProject(projectId)
    if (!config) {
      throw new AppError('CLOCKIFY_NOT_CONFIGURED', 'Clockify is not configured for this project', 400)
    }

    // Decrypt API key before using
    const apiKey = readToken(config.apiKey)
    if (!apiKey) {
      throw new AppError('CLOCKIFY_INVALID_KEY', 'Clockify API key is invalid or corrupted', 500)
    }

    const user = await testConnection(apiKey)
    return { success: true, user: { name: user.name, email: user.email } }
  },

  async triggerSync(projectId: string) {
    const config = await clockifyConfigRepository.findByProject(projectId)
    if (!config) {
      throw new AppError('CLOCKIFY_NOT_CONFIGURED', 'Clockify is not configured for this project', 400)
    }

    if (!config.isActive) {
      throw new AppError('CLOCKIFY_INACTIVE', 'Clockify integration is inactive for this project', 400)
    }

    await syncQueue.add(
      'sync-clockify',
      { projectId },
      { jobId: `clockify-manual-${projectId}-${Date.now()}`, removeOnComplete: true, removeOnFail: 5 }
    )

    return { queued: true }
  },
}
