import { z } from 'zod'

export const AssignInput = z.object({
  userId: z.string().min(1),
})

export type AssignInput = z.infer<typeof AssignInput>
