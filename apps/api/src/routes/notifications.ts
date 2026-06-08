import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../hooks/requireAuth.js'
import { sendError } from '../lib/errors.js'
import { secureToken, readToken } from '../lib/secure-tokens.js'

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────

const updateNotificationSettingSchema = z.object({
  emailEnabled: z.boolean().optional(),
  slackEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
})

const updateNotificationChannelsSchema = z.object({
  email: z.string().email().optional().nullable(),
  emailVerified: z.boolean().optional(),
  slackWebhookUrl: z.string().url().optional().nullable(),
  slackChannelId: z.string().optional().nullable(),
  slackConnected: z.boolean().optional(),
})

// ─── ROUTES ──────────────────────────────────────────────────────────────────

export default async function notificationsRoutes(fastify: FastifyInstance) {
  // GET /notifications/settings - List all notification settings
  fastify.get('/notifications/settings', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession

        const settings = await prisma.notificationSetting.findMany({
          where: { userId },
          orderBy: { event: 'asc' },
        })

        return reply.send({ settings })
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // GET /notifications/settings/:event - Get specific notification setting
  fastify.get<{ Params: { event: string } }>('/notifications/settings/:event', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession
        const { event } = request.params

        const setting = await prisma.notificationSetting.findUnique({
          where: {
            userId_event: {
              userId,
              event,
            },
          },
        })

        if (!setting) {
          return reply.status(404).send({
            error: 'Notification setting not found',
          })
        }

        return reply.send(setting)
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // PUT /notifications/settings/:event - Update notification setting
  fastify.put<{
    Params: { event: string }
    Body: z.infer<typeof updateNotificationSettingSchema>
  }>('/notifications/settings/:event', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession
        const { event } = request.params
        const data = updateNotificationSettingSchema.parse(request.body)

        // Validate that at least one field is provided
        if (
          data.emailEnabled === undefined &&
          data.slackEnabled === undefined &&
          data.inAppEnabled === undefined
        ) {
          return reply.status(400).send({
            error: 'At least one notification channel must be specified',
          })
        }

        // Upsert the setting
        const setting = await prisma.notificationSetting.upsert({
          where: {
            userId_event: {
              userId,
              event,
            },
          },
          create: {
            userId,
            event,
            emailEnabled: data.emailEnabled ?? false,
            slackEnabled: data.slackEnabled ?? false,
            inAppEnabled: data.inAppEnabled ?? false,
          },
          update: data,
        })

        return reply.send(setting)
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // DELETE /notifications/settings/:event - Delete notification setting
  fastify.delete<{ Params: { event: string } }>('/notifications/settings/:event', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession
        const { event } = request.params

        await prisma.notificationSetting.deleteMany({
          where: {
            userId,
            event,
          },
        })

        return reply.status(204).send()
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // GET /notifications/channels - Get notification channels configuration
  fastify.get('/notifications/channels', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession

        let channels = await prisma.notificationChannel.findUnique({
          where: { userId },
        })

        // Create default channels if they don't exist
        if (!channels) {
          channels = await prisma.notificationChannel.create({
            data: {
              userId,
            },
          })
        }

        // Decrypt webhook URL before returning
        if (channels.slackWebhookUrl) {
          channels.slackWebhookUrl = readToken(channels.slackWebhookUrl)
        }

        return reply.send(channels)
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // PUT /notifications/channels - Update notification channels
  fastify.put<{ Body: z.infer<typeof updateNotificationChannelsSchema> }>(
    '/notifications/channels',
    {
      preHandler: requireAuth(),
      handler: async (request, reply) => {
        try {
          const { userId } = request.userSession
          const data = updateNotificationChannelsSchema.parse(request.body)

          // Encrypt webhook URL before saving
          const securedData = {
            ...data,
            ...(data.slackWebhookUrl !== undefined && {
              slackWebhookUrl: secureToken(data.slackWebhookUrl),
            }),
          }

          const channels = await prisma.notificationChannel.upsert({
            where: { userId },
            create: {
              userId,
              ...securedData,
            },
            update: securedData,
          })

          return reply.send(channels)
        } catch (error) {
          return sendError(reply, error)
        }
      },
    }
  )
}
