import { prisma } from '../../lib/prisma.js'
import type { ForecastInput, ForecastOutput } from '../../integrations/anthropic/types.js'

export const forecastRepository = {
  create(projectId: string, output: ForecastOutput, input: ForecastInput) {
    return prisma.deliveryForecast.create({
      data: {
        projectId,
        onTimeProbability: output.onTimeProbability,
        predictedEndDate: output.predictedEndDate ? new Date(output.predictedEndDate) : null,
        confidence: output.confidence,
        reasoning: output.reasoning,
        inputSnapshot: input as object,
      },
    })
  },

  findLatest(projectId: string) {
    return prisma.deliveryForecast.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })
  },

  findHistory(projectId: string, limit = 10) {
    return prisma.deliveryForecast.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  },
}
