import type { FastifyInstance} from 'fastify'
import { z } from 'zod'
import { portalService } from './service.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { rateLimitByUser } from '../../hooks/rateLimitByUser.js'
import { sendError } from '../../lib/errors.js'

const GenerateTokenInput = z.object({
  expiryDays: z.number().int().positive().nullable(),
})

export default async function portalRoutes(fastify: FastifyInstance) {
  // Generate portal token (Owner/GP only)
  fastify.post<{ Params: { projectId: string } }>(
    '/projects/:projectId/portal-token',
    {
      preHandler: [requireAuth(['OWNER', 'PROJECT_MANAGER']), rateLimitByUser(10, 60)], // 10 per hour per user
      config: {
        rateLimit: {
          max: 50, // 50 per minute globally
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      try {
        const { expiryDays } = GenerateTokenInput.parse(request.body)
        const token = portalService.generateToken(request.params.projectId, expiryDays)
        return reply.send({ success: true, data: { token } })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // Public portal data endpoint (no auth — token-based)
  fastify.get<{ Params: { token: string } }>(
    '/portal/:token',
    async (request, reply) => {
      try {
        const payload = portalService.verifyToken(request.params.token)
        const data = await portalService.getPortalData(payload.projectId)
        return reply.send({ success: true, data })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
