import { z } from 'zod'

export const CreateProjectInput = z.object({
  name: z.string().min(1).max(200),
  key: z.string().max(10).optional(),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string()).default([]),
  contractType: z.enum(['fixed', 'tm', 'retainer']).optional(),
  contractValue: z.number().positive().optional(),
  estimatedHours: z.number().int().positive().optional(),
  startDate: z.string().datetime().optional(),
  deadline: z.string().datetime().optional(),
  clientId: z.string().optional(),
  pmId: z.string().optional(),
  devIds: z.array(z.string()).default([]),
  source: z.enum(['jira', 'azure']).default('jira'),
  jiraProjectKey: z.string().min(1).max(20).optional(),
  azureProjectId: z.string().min(1).max(200).optional(),
  organizationId: z.string().min(1),
  githubRepo: z.string().nullable().optional(),
})

export type CreateProjectInput = z.infer<typeof CreateProjectInput>

export const UpdateProjectInput = z.object({
  name: z.string().min(1).max(200).optional(),
  source: z.enum(['jira', 'azure']).optional(),
  jiraProjectKey: z.string().min(1).max(20).nullable().optional(),
  azureProjectId: z.string().min(1).max(200).nullable().optional(),
  githubRepo: z.string().nullable().optional(),
})

export type UpdateProjectInput = z.infer<typeof UpdateProjectInput>
