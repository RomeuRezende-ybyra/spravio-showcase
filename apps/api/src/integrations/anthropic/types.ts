import { z } from 'zod'

export const ForecastInputSchema = z.object({
  projectName: z.string(),
  velocity: z.number(), // avg points per sprint
  velocityTrend: z.enum(['increasing', 'stable', 'decreasing']),
  reworkRate: z.number(), // percentage of returned cards (0-1)
  teamSize: z.number(),
  totalRemainingPoints: z.number(),
  completedSprints: z.number(),
  daysRemaining: z.number().nullable(), // null if no end date set
  budgetHealth: z.enum(['green', 'yellow', 'red']).nullable(),
  sprintLengthDays: z.number(),
})

export const ForecastOutputSchema = z.object({
  onTimeProbability: z.number().min(0).max(100),
  predictedEndDate: z.string().nullable(), // ISO date
  confidence: z.enum(['low', 'medium', 'high']),
  reasoning: z.string(),
})

export type ForecastInput = z.infer<typeof ForecastInputSchema>
export type ForecastOutput = z.infer<typeof ForecastOutputSchema>
