import type { ForecastInput } from './types.js'

export const FORECAST_SYSTEM_PROMPT = `You are an expert project manager AI assistant specializing in software delivery forecasting.

Your task is to analyze project metrics and predict:
1. The probability (0-100%) that the project will be delivered on time
2. A predicted end date based on current velocity
3. Your confidence level in the prediction
4. Clear reasoning explaining your analysis

Consider these factors:
- Historical velocity and its trend
- Rework/return rate (higher = more risk)
- Team size stability
- Remaining work vs capacity
- Budget health (if available)
- Days remaining vs work remaining

Be realistic but not pessimistic. Base predictions on data, not assumptions.

IMPORTANT: You must respond with ONLY a valid JSON object in this exact format:
{
  "onTimeProbability": <number 0-100>,
  "predictedEndDate": "<ISO date string or null>",
  "confidence": "<low|medium|high>",
  "reasoning": "<2-3 sentences explaining your analysis>"
}

Do not include any other text before or after the JSON object.`

export function buildUserPrompt(input: ForecastInput): string {
  return `Analyze this project and provide a delivery forecast:

Project: ${input.projectName}
Completed Sprints: ${input.completedSprints}
Sprint Length: ${input.sprintLengthDays} days

Performance Metrics:
- Average Velocity: ${input.velocity.toFixed(1)} points/sprint
- Velocity Trend: ${input.velocityTrend}
- Rework Rate: ${(input.reworkRate * 100).toFixed(1)}%
- Team Size: ${input.teamSize} developers

Remaining Work:
- Total Remaining Points: ${input.totalRemainingPoints}
- Days Until Deadline: ${input.daysRemaining ?? 'No deadline set'}
- Budget Health: ${input.budgetHealth ?? 'Not tracked'}`
}
