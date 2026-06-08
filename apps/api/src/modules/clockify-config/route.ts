import type { FastifyInstance } from 'fastify'
import { clockifyConfigService } from './service.js'
import { UpdateClockifyConfigInput } from './types.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError } from '../../lib/errors.js'

export default async function clockifyConfigRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/clockify-config',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const config = await clockifyConfigService.getConfig(request.params.projectId)
        return reply.send({ success: true, data: config })
      } catch (error) {
        sendError(reply, error)
      }
    }
  )

  fastify.put<{ Params: { projectId: string } }>(
    '/projects/:projectId/clockify-config',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const input = UpdateClockifyConfigInput.parse(request.body)
        const config = await clockifyConfigService.upsertConfig(request.params.projectId, input)
        return reply.send({ success: true, data: config })
      } catch (error) {
        sendError(reply, error)
      }
    }
  )

  fastify.delete<{ Params: { projectId: string } }>(
    '/projects/:projectId/clockify-config',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        await clockifyConfigService.deleteConfig(request.params.projectId)
        return reply.send({ success: true, data: null })
      } catch (error) {
        sendError(reply, error)
      }
    }
  )

  fastify.post<{ Params: { projectId: string } }>(
    '/projects/:projectId/clockify-config/test',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const result = await clockifyConfigService.testConnection(request.params.projectId)
        return reply.send({ success: true, data: result })
      } catch (error) {
        sendError(reply, error)
      }
    }
  )

  fastify.post<{ Params: { projectId: string } }>(
    '/projects/:projectId/clockify-config/sync',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const result = await clockifyConfigService.triggerSync(request.params.projectId)
        return reply.send({ success: true, data: result })
      } catch (error) {
        sendError(reply, error)
      }
    }
  )
}
