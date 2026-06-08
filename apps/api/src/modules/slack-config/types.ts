import { z } from 'zod'
import { SlackAlertTypeSchema } from '@spravio/types'

export const UpdateSlackConfigInput = z.object({
  webhookUrl: z.string().url().nullable().optional(),
  channelId: z.string().nullable().optional(),
  alertTypes: z.array(SlackAlertTypeSchema).optional(),
  isActive: z.boolean().optional(),
})

export type UpdateSlackConfigInput = z.infer<typeof UpdateSlackConfigInput>
