import { z } from 'zod'
import { TeamsAlertTypeSchema } from '@spravio/types'

export const UpdateTeamsConfigInput = z.object({
  webhookUrl: z.string().url().optional(),
  alertTypes: z.array(TeamsAlertTypeSchema).optional(),
  isActive: z.boolean().optional(),
})

export type UpdateTeamsConfigInput = z.infer<typeof UpdateTeamsConfigInput>
