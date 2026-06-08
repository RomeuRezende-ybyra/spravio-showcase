import { z } from 'zod'

export const UpdateTempoConfigInput = z.object({
  apiToken: z.string().min(1),
  isActive: z.boolean().optional(),
})

export type UpdateTempoConfigInput = z.infer<typeof UpdateTempoConfigInput>
