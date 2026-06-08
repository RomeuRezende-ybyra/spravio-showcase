import { tempoConfigRepository } from './repository.js'
import { testConnection } from '../../integrations/tempo/endpoints.js'
import { AppError } from '../../lib/errors.js'
import { syncQueue } from '../../jobs/queue.js'
import { secureToken, readToken } from '../../lib/secure-tokens.js'
import type { UpdateTempoConfigInput } from './types.js'

export const tempoConfigService = {
  async getConfig(projectId: string) {
    const config = await tempoConfigRepository.findByProject(projectId)
    if (!config) return null

    // Don't expose the full API token
    return {
      id: config.id,
      projectId: config.projectId,
      isActive: config.isActive,
      lastSyncAt: config.lastSyncAt,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
      hasToken: !!config.apiToken,
    }
  },

  async upsertConfig(projectId: string, input: UpdateTempoConfigInput) {
    // Encrypt API token before saving
    const securedInput = {
      ...input,
      apiToken: input.apiToken ? secureToken(input.apiToken) ?? input.apiToken : undefined,
    }

    const config = await tempoConfigRepository.upsert(projectId, securedInput as typeof input)
    return {
      id: config.id,
      projectId: config.projectId,
      isActive: config.isActive,
      lastSyncAt: config.lastSyncAt,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
      hasToken: !!config.apiToken,
    }
  },

  async deleteConfig(projectId: string) {
    return tempoConfigRepository.delete(projectId)
  },

  async testConnection(projectId: string) {
    const config = await tempoConfigRepository.findByProject(projectId)
    if (!config) {
      throw new AppError('TEMPO_NOT_CONFIGURED', 'Tempo is not configured for this project', 400)
    }

    // Decrypt token before using
    const apiToken = readToken(config.apiToken)
    if (!apiToken) {
      throw new AppError('TEMPO_INVALID_TOKEN', 'Tempo API token is invalid or corrupted', 500)
    }

    await testConnection(apiToken)
    return { success: true }
  },

  async triggerSync(projectId: string) {
    const config = await tempoConfigRepository.findByProject(projectId)
    if (!config) {
      throw new AppError('TEMPO_NOT_CONFIGURED', 'Tempo is not configured for this project', 400)
    }

    if (!config.isActive) {
      throw new AppError('TEMPO_INACTIVE', 'Tempo integration is inactive for this project', 400)
    }

    await syncQueue.add(
      'sync-tempo',
      { projectId },
      { jobId: `tempo-manual-${projectId}-${Date.now()}`, removeOnComplete: true, removeOnFail: 5 }
    )

    return { queued: true }
  },
}
