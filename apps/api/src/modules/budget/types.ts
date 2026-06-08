import { z } from 'zod'

export const SetBudgetInput = z.object({
  totalBudget: z.number().positive(),
  currency: z.string().min(1).default('USD'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

export const SetRateInput = z.object({
  hourlyRate: z.number().positive(),
  currency: z.string().min(1).default('USD'),
})

export const LogHoursInput = z.object({
  developerId: z.string().min(1),
  hoursLogged: z.number().min(0),
  source: z.string().default('manual'),
})

export type SetBudgetInput = z.infer<typeof SetBudgetInput>
export type SetRateInput = z.infer<typeof SetRateInput>
export type LogHoursInput = z.infer<typeof LogHoursInput>
