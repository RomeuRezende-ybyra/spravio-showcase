import type { FastifyInstance } from 'fastify'
import { sprintService } from './service.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError } from '../../lib/errors.js'

export default async function sprintRoutes(fastify: FastifyInstance) {
  // List all sprints across all projects for the org
  fastify.get(
    '/sprints',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const { orgId } = request.userSession
        const result = await sprintService.listAllForOrg(orgId)
        return reply.send({ success: true, data: result })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/sprints',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const sprints = await sprintService.listByProject(request.params.projectId)
        return reply.send({ success: true, data: sprints })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/sprints/current',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const summary = await sprintService.getCurrentSprint(request.params.projectId)
        return reply.send({ success: true, data: summary })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
