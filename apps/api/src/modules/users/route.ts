import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { userService } from './service.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError } from '../../lib/errors.js'

const UpdateProfileInput = z.object({
  name: z.string().min(1).nullable().optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
  avatarUrl: z.string().url().nullable().optional().or(z.literal('')),
  language: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  dateFormat: z.string().nullable().optional(),
  theme: z.string().nullable().optional(),
}).refine(
  (data) => {
    // If newPassword is provided, currentPassword must also be provided
    if (data.newPassword && !data.currentPassword) {
      return false
    }
    return true
  },
  {
    message: 'Current password is required when changing password',
  }
)

export default async function userRoutes(fastify: FastifyInstance) {
  // GET /api/users/me — Get current user profile
  fastify.get('/users/me', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession
        const profile = await userService.getProfile(userId)
        return reply.send(profile)
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // PUT /api/users/me — Update current user profile
  fastify.put('/users/me', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession
        const input = UpdateProfileInput.parse(request.body)

        // Convert empty string to null for avatarUrl
        const payload = {
          ...input,
          avatarUrl: input.avatarUrl === '' ? null : input.avatarUrl,
        }

        const updatedProfile = await userService.updateProfile(userId, payload)
        return reply.send(updatedProfile)
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // POST /api/users/me/avatar — Upload avatar (placeholder for future implementation)
  fastify.post('/users/me/avatar', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        // TODO: Implement file upload with multer or @fastify/multipart
        // For now, return error
        return reply.status(501).send({
          error: 'NOT_IMPLEMENTED',
          message: 'Avatar upload not yet implemented. Use avatarUrl in PUT /users/me for now.',
        })
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })
}
