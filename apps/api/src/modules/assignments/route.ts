import type { FastifyInstance } from 'fastify'
import { assignmentService } from './service.js'
import { AssignInput } from './types.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { requirePlanLimit } from '../../hooks/requirePlanLimit.js'
import { sendError } from '../../lib/errors.js'

export default async function assignmentRoutes(fastify: FastifyInstance) {
  // List assignments for a project
  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/assignments',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const assignments = await assignmentService.listByProject(request.params.projectId)
        return reply.send({ success: true, data: assignments })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // Assign a user to a project
  fastify.post<{ Params: { projectId: string } }>(
    '/projects/:projectId/assign',
    { preHandler: [requireAuth(['OWNER']), requirePlanLimit('gps')] },
    async (request, reply) => {
      try {
        const { userId } = AssignInput.parse(request.body)
        const assignment = await assignmentService.assign(request.params.projectId, userId)
        return reply.status(201).send({ success: true, data: assignment })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // Unassign a user from a project
  fastify.delete<{ Params: { projectId: string; userId: string } }>(
    '/projects/:projectId/assign/:userId',
    { preHandler: requireAuth(['OWNER']) },
    async (request, reply) => {
      try {
        await assignmentService.unassign(request.params.projectId, request.params.userId)
        return reply.send({ success: true, data: null })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // Get GP portfolios (owner only)
  fastify.get(
    '/gp/portfolios',
    { preHandler: requireAuth(['OWNER']) },
    async (request, reply) => {
      try {
        const portfolios = await assignmentService.getGPPortfolios(request.userSession.orgId)
        return reply.send({ success: true, data: portfolios })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
