import type { FastifyInstance } from 'fastify'
import { tempoConfigService } from './service.js'
import { UpdateTempoConfigInput } from './types.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError } from '../../lib/errors.js'

export default async function tempoConfigRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/tempo-config',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const config = await tempoConfigService.getConfig(request.params.projectId)
        return reply.send({ success: true, data: config })
      } catch (error) {
        sendError(reply, error)
      }
    }
  )

  fastify.put<{ Params: { projectId: string } }>(
    '/projects/:projectId/tempo-config',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const input = UpdateTempoConfigInput.parse(request.body)
        const config = await tempoConfigService.upsertConfig(request.params.projectId, input)
        return reply.send({ success: true, data: config })
      } catch (error) {
        sendError(reply, error)
      }
    }
  )

  fastify.delete<{ Params: { projectId: string } }>(
    '/projects/:projectId/tempo-config',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        await tempoConfigService.deleteConfig(request.params.projectId)
        return reply.send({ success: true, data: null })
      } catch (error) {
        sendError(reply, error)
      }
    }
  )

  fastify.post<{ Params: { projectId: string } }>(
    '/projects/:projectId/tempo-config/test',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const result = await tempoConfigService.testConnection(request.params.projectId)
        return reply.send({ success: true, data: result })
      } catch (error) {
        sendError(reply, error)
      }
    }
  )

  fastify.post<{ Params: { projectId: string } }>(
    '/projects/:projectId/tempo-config/sync',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const result = await tempoConfigService.triggerSync(request.params.projectId)
        return reply.send({ success: true, data: result })
      } catch (error) {
        sendError(reply, error)
      }
    }
  )
}
