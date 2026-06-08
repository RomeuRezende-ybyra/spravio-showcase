import type { FastifyInstance } from 'fastify'
import { teamsConfigService } from './service.js'
import { UpdateTeamsConfigInput } from './types.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError } from '../../lib/errors.js'

export default async function teamsConfigRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/teams-config',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const config = await teamsConfigService.getConfig(request.params.projectId)
        return reply.send({ success: true, data: config })
      } catch (error) {
        sendError(reply, error)
      }
    }
  )

  fastify.put<{ Params: { projectId: string } }>(
    '/projects/:projectId/teams-config',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const input = UpdateTeamsConfigInput.parse(request.body)
        const config = await teamsConfigService.upsertConfig(request.params.projectId, input)
        return reply.send({ success: true, data: config })
      } catch (error) {
        sendError(reply, error)
      }
    }
  )

  fastify.delete<{ Params: { projectId: string } }>(
    '/projects/:projectId/teams-config',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        await teamsConfigService.deleteConfig(request.params.projectId)
        return reply.send({ success: true, data: null })
      } catch (error) {
        sendError(reply, error)
      }
    }
  )

  fastify.post<{ Params: { projectId: string } }>(
    '/projects/:projectId/teams-config/test',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        await teamsConfigService.testWebhook(request.params.projectId)
        return reply.send({ success: true, data: { message: 'Test message sent' } })
      } catch (error) {
        sendError(reply, error)
      }
    }
  )
}
