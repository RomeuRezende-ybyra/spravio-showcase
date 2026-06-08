import type { FastifyInstance } from 'fastify'
import { developerService } from './service.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError } from '../../lib/errors.js'

export default async function developerRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/developers',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const developers = await developerService.listByProject(request.params.projectId)
        return reply.send({ success: true, data: developers })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  fastify.get<{ Params: { projectId: string; devId: string } }>(
    '/projects/:projectId/developers/:devId/cards',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const cards = await developerService.getCards(
          request.params.projectId,
          request.params.devId,
        )
        return reply.send({ success: true, data: cards })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
