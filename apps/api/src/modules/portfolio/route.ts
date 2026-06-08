import type { FastifyInstance } from 'fastify'
import { portfolioService } from './service.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError } from '../../lib/errors.js'

export default async function portfolioRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/portfolio',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const { orgId } = request.userSession
        const result = await portfolioService.getPortfolio(orgId)
        return reply.send({ success: true, data: result })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
