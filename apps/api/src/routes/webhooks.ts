import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../hooks/requireAuth.js'
import { sendError } from '../lib/errors.js'
import crypto from 'node:crypto'

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────

const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().optional(),
})

const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  secret: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function deliverWebhook(
  webhookId: string,
  event: string,
  payload: Record<string, unknown>,
  secret?: string | null
) {
  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId },
  })

  if (!webhook || !webhook.isActive) {
    return
  }

  const startTime = Date.now()
  let success = false
  let statusCode: number | null = null
  let errorMessage: string | null = null

  try {
    // Create HMAC signature if secret is provided
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Spravio-Webhooks/1.0',
      'X-Webhook-Event': event,
      'X-Webhook-Delivery': crypto.randomUUID(),
    }

    if (secret) {
      const signature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex')
      headers['X-Webhook-Signature'] = signature
    }

    // Send webhook
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    statusCode = response.status
    success = response.ok

    if (!response.ok) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Unknown error'
  }

  const responseTime = Date.now() - startTime

  // Log delivery
  await prisma.webhookDelivery.create({
    data: {
      webhookId,
      event,
      payload: payload as any, // Prisma Json type
      statusCode,
      success,
      errorMessage,
      responseTime,
    },
  })

  // Update webhook lastDeliveryAt
  await prisma.webhook.update({
    where: { id: webhookId },
    data: { lastDeliveryAt: new Date() },
  })

  return { success, statusCode, errorMessage, responseTime }
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────

export default async function webhooksRoutes(fastify: FastifyInstance) {
  // GET /webhooks - List all webhooks
  fastify.get('/webhooks', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession

        const webhooks = await prisma.webhook.findMany({
          where: { userId },
          include: {
            _count: {
              select: { deliveries: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        // Calculate success rate for each webhook
        const webhooksWithStats = await Promise.all(
          webhooks.map(async (webhook) => {
            const deliveries = await prisma.webhookDelivery.findMany({
              where: { webhookId: webhook.id },
              orderBy: { createdAt: 'desc' },
              take: 100, // Last 100 deliveries
            })

            const successCount = deliveries.filter((d) => d.success).length
            const successRate =
              deliveries.length > 0 ? Math.round((successCount / deliveries.length) * 100) : 100

            const lastDelivery = deliveries[0]

            return {
              id: webhook.id,
              url: webhook.url,
              events: webhook.events,
              isActive: webhook.isActive,
              successRate,
              lastDeliveryAt: lastDelivery?.createdAt || webhook.lastDeliveryAt,
              createdAt: webhook.createdAt,
              totalDeliveries: webhook._count.deliveries,
            }
          })
        )

        return reply.send({ webhooks: webhooksWithStats })
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // POST /webhooks - Create webhook
  fastify.post<{ Body: z.infer<typeof createWebhookSchema> }>('/webhooks', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession
        const data = createWebhookSchema.parse(request.body)

        const webhook = await prisma.webhook.create({
          data: {
            userId,
            url: data.url,
            events: data.events,
            secret: data.secret,
          },
        })

        return reply.status(201).send(webhook)
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // GET /webhooks/:id - Get specific webhook
  fastify.get<{ Params: { id: string } }>('/webhooks/:id', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession
        const { id } = request.params

        const webhook = await prisma.webhook.findFirst({
          where: {
            id,
            userId,
          },
        })

        if (!webhook) {
          return reply.status(404).send({ error: 'Webhook not found' })
        }

        return reply.send(webhook)
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // PUT /webhooks/:id - Update webhook
  fastify.put<{ Params: { id: string }; Body: z.infer<typeof updateWebhookSchema> }>(
    '/webhooks/:id',
    {
      preHandler: requireAuth(),
      handler: async (request, reply) => {
        try {
          const { userId } = request.userSession
          const { id } = request.params
          const data = updateWebhookSchema.parse(request.body)

          // Check ownership
          const existing = await prisma.webhook.findFirst({
            where: { id, userId },
          })

          if (!existing) {
            return reply.status(404).send({ error: 'Webhook not found' })
          }

          const webhook = await prisma.webhook.update({
            where: { id },
            data,
          })

          return reply.send(webhook)
        } catch (error) {
          return sendError(reply, error)
        }
      },
    }
  )

  // DELETE /webhooks/:id - Delete webhook
  fastify.delete<{ Params: { id: string } }>('/webhooks/:id', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession
        const { id } = request.params

        // Check ownership
        const existing = await prisma.webhook.findFirst({
          where: { id, userId },
        })

        if (!existing) {
          return reply.status(404).send({ error: 'Webhook not found' })
        }

        await prisma.webhook.delete({
          where: { id },
        })

        return reply.status(204).send()
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // POST /webhooks/:id/test - Test webhook
  fastify.post<{ Params: { id: string } }>('/webhooks/:id/test', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession
        const { id } = request.params

        // Check ownership
        const webhook = await prisma.webhook.findFirst({
          where: { id, userId },
        })

        if (!webhook) {
          return reply.status(404).send({ error: 'Webhook not found' })
        }

        // Send test payload
        const testPayload = {
          event: 'webhook.test',
          timestamp: new Date().toISOString(),
          data: {
            message: 'This is a test webhook delivery from Spravio',
          },
        }

        const result = await deliverWebhook(id, 'webhook.test', testPayload, webhook.secret)

        return reply.send({
          success: result?.success || false,
          statusCode: result?.statusCode,
          errorMessage: result?.errorMessage,
          responseTime: result?.responseTime,
        })
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // GET /webhooks/:id/deliveries - Get delivery history
  fastify.get<{
    Params: { id: string }
    Querystring: { limit?: string; offset?: string }
  }>('/webhooks/:id/deliveries', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession
        const { id } = request.params
        const limit = parseInt(request.query.limit || '50')
        const offset = parseInt(request.query.offset || '0')

        // Check ownership
        const webhook = await prisma.webhook.findFirst({
          where: { id, userId },
        })

        if (!webhook) {
          return reply.status(404).send({ error: 'Webhook not found' })
        }

        const [deliveries, total] = await Promise.all([
          prisma.webhookDelivery.findMany({
            where: { webhookId: id },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
          }),
          prisma.webhookDelivery.count({
            where: { webhookId: id },
          }),
        ])

        return reply.send({
          deliveries,
          pagination: {
            total,
            limit,
            offset,
          },
        })
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })
}
