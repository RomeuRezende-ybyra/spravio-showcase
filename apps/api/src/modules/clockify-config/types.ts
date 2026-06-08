import { z } from 'zod'

export const UpdateClockifyConfigInput = z.object({
  apiKey: z.string().min(1),
  workspaceId: z.string().min(1),
  isActive: z.boolean().optional(),
})

export type UpdateClockifyConfigInput = z.infer<typeof UpdateClockifyConfigInput>
