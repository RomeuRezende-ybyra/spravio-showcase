import { organizationRepository } from './repository.js'
import { AppError } from '../../lib/errors.js'
import { secureToken, readToken } from '../../lib/secure-tokens.js'
import type { UpdateOrganizationSettingsInput } from './types.js'

export const organizationService = {
  async getSettings(orgId: string) {
    const org = await organizationRepository.getOrganization(orgId)
    if (!org) {
      throw new AppError('ORGANIZATION_NOT_FOUND', `Organization ${orgId} not found`, 404)
    }

    const settings = org.settings
    if (!settings) return null

    // Decrypt sensitive tokens before returning
    return {
      ...settings,
      jiraApiToken: readToken(settings.jiraApiToken),
      azurePersonalAccessToken: readToken(settings.azurePersonalAccessToken),
      githubToken: readToken(settings.githubToken),
    }
  },

  async updateSettings(orgId: string, input: UpdateOrganizationSettingsInput) {
    const org = await organizationRepository.getOrganization(orgId)
    if (!org) {
      throw new AppError('ORGANIZATION_NOT_FOUND', `Organization ${orgId} not found`, 404)
    }

    // Encrypt sensitive fields before storing in database
    const securedInput = {
      ...input,
      jiraApiToken: input.jiraApiToken ? secureToken(input.jiraApiToken) : undefined,
      azurePersonalAccessToken: input.azurePersonalAccessToken
        ? secureToken(input.azurePersonalAccessToken)
        : undefined,
      githubToken: input.githubToken ? secureToken(input.githubToken) : undefined,
    }

    const settings = await organizationRepository.upsertSettings(orgId, securedInput)

    // Decrypt before returning to client
    return {
      ...settings,
      jiraApiToken: readToken(settings.jiraApiToken),
      azurePersonalAccessToken: readToken(settings.azurePersonalAccessToken),
      githubToken: readToken(settings.githubToken),
    }
  },
}
