import type { FastifyInstance } from 'fastify'
import { slackConfigService } from './service.js'
import { UpdateSlackConfigInput } from './types.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError } from '../../lib/errors.js'

export default async function slackConfigRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/slack-config',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const config = await slackConfigService.getConfig(request.params.projectId)
        return reply.send({ success: true, data: config })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  fastify.put<{ Params: { projectId: string } }>(
    '/projects/:projectId/slack-config',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const input = UpdateSlackConfigInput.parse(request.body)
        const config = await slackConfigService.upsertConfig(request.params.projectId, input)
        return reply.send({ success: true, data: config })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  fastify.post<{ Params: { projectId: string } }>(
    '/projects/:projectId/slack-config/test',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        await slackConfigService.testWebhook(request.params.projectId)
        return reply.send({ success: true, data: { message: 'Test message sent' } })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
