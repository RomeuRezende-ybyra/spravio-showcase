import type { FastifyInstance } from 'fastify'
import { overviewService } from './service.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError } from '../../lib/errors.js'

export default async function overviewRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/overview',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const overview = await overviewService.getOverview(request.params.projectId)
        return reply.send({ success: true, data: overview })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
