import { z } from 'zod'

export const UpdateOrganizationSettingsInput = z.object({
  jiraBaseUrl: z.string().url().optional().nullable(),
  jiraEmail: z.string().email().optional().nullable(),
  jiraApiToken: z.string().min(1).optional().nullable(),
  jiraCloudId: z.string().min(1).optional().nullable(),
  azureOrganization: z.string().min(1).optional().nullable(),
  azurePersonalAccessToken: z.string().min(1).optional().nullable(),
  githubOrg: z.string().min(1).optional().nullable(),
  githubToken: z.string().min(1).optional().nullable(),
})

export type UpdateOrganizationSettingsInput = z.infer<typeof UpdateOrganizationSettingsInput>
