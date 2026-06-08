import type { FastifyInstance } from 'fastify'
import { financialService } from './service.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError } from '../../lib/errors.js'

export default async function financialRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/financial/summary',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const { orgId } = request.userSession
        const result = await financialService.getSummary(orgId)
        return reply.send({ success: true, data: result })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
