import type { FastifyInstance } from 'fastify'
import { forecastService } from './service.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError, AppError } from '../../lib/errors.js'

export default async function forecastRoutes(fastify: FastifyInstance) {
  // Get latest forecast
  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/forecast',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const forecast = await forecastService.getLatest(request.params.projectId)
        return reply.send({ success: true, data: forecast })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // Get forecast history
  fastify.get<{ Params: { projectId: string }; Querystring: { limit?: string } }>(
    '/projects/:projectId/forecast/history',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const limit = request.query.limit ? parseInt(request.query.limit, 10) : undefined
        const forecasts = await forecastService.getHistory(request.params.projectId, limit)
        return reply.send({ success: true, data: forecasts })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // Manually trigger forecast generation
  fastify.post<{ Params: { projectId: string } }>(
    '/projects/:projectId/forecast/generate',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const canGenerate = await forecastService.canGenerateForecast(request.params.projectId)
        if (!canGenerate) {
          throw new AppError(
            'INSUFFICIENT_DATA',
            'Need at least 3 completed sprints and ANTHROPIC_API_KEY configured',
            400,
          )
        }

        const result = await forecastService.generateAndSave(request.params.projectId)
        return reply.send({ success: true, data: result.forecast })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
