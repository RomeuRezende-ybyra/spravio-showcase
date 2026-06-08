import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../hooks/requireAuth.js'
import { sendError } from '../lib/errors.js'
import crypto from 'node:crypto'

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────

const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).min(1),
  expiresInDays: z.number().int().min(1).max(365).optional(),
})

const updateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  scopes: z.array(z.string()).min(1).optional(),
})

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function generateApiKey(): { key: string; prefix: string; hash: string } {
  // Generate a random key with format: spv_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  const randomBytes = crypto.randomBytes(32)
  const keySecret = randomBytes.toString('base64url')
  const key = `spv_live_${keySecret}`

  // Store prefix (first 12 chars) for display
  const prefix = key.substring(0, 16) // "spv_live_xxxxxxx"

  // Hash the full key for storage
  const hash = crypto.createHash('sha256').update(key).digest('hex')

  return { key, prefix, hash }
}

function maskApiKey(prefix: string): string {
  // Show prefix and mask the rest: spv_live_abc••••••••••••••••••••••
  return `${prefix}${'•'.repeat(32)}`
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────

export default async function apiKeysRoutes(fastify: FastifyInstance) {
  // GET /api-keys - List all API keys
  fastify.get('/api-keys', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession

        const apiKeys = await prisma.apiKey.findMany({
          where: { userId },
          select: {
            id: true,
            name: true,
            keyPrefix: true,
            scopes: true,
            lastUsedAt: true,
            expiresAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        })

        const maskedKeys = apiKeys.map((key) => ({
          ...key,
          key: maskApiKey(key.keyPrefix),
        }))

        return reply.send({ apiKeys: maskedKeys })
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // POST /api-keys - Create new API key
  fastify.post<{ Body: z.infer<typeof createApiKeySchema> }>('/api-keys', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession
        const data = createApiKeySchema.parse(request.body)

        // Generate API key
        const { key, prefix, hash } = generateApiKey()

        // Calculate expiration
        const expiresAt = data.expiresInDays
          ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
          : null

        // Create API key
        const apiKey = await prisma.apiKey.create({
          data: {
            userId,
            name: data.name,
            keyPrefix: prefix,
            keyHash: hash,
            scopes: data.scopes,
            expiresAt,
          },
        })

        // Return the full key ONLY on creation (this is the only time we show it)
        return reply.status(201).send({
          apiKey: {
            id: apiKey.id,
            name: apiKey.name,
            key, // Full key - ONLY shown once!
            scopes: apiKey.scopes,
            expiresAt: apiKey.expiresAt,
            createdAt: apiKey.createdAt,
          },
        })
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // PUT /api-keys/:id - Update API key (name and scopes only)
  fastify.put<{ Params: { id: string }; Body: z.infer<typeof updateApiKeySchema> }>(
    '/api-keys/:id',
    {
      preHandler: requireAuth(),
      handler: async (request, reply) => {
        try {
          const { userId } = request.userSession
          const { id } = request.params
          const data = updateApiKeySchema.parse(request.body)

          // Check ownership
          const existing = await prisma.apiKey.findFirst({
            where: { id, userId },
          })

          if (!existing) {
            return reply.status(404).send({ error: 'API key not found' })
          }

          // Update
          const apiKey = await prisma.apiKey.update({
            where: { id },
            data,
            select: {
              id: true,
              name: true,
              keyPrefix: true,
              scopes: true,
              lastUsedAt: true,
              expiresAt: true,
              createdAt: true,
            },
          })

          return reply.send({
            ...apiKey,
            key: maskApiKey(apiKey.keyPrefix),
          })
        } catch (error) {
          return sendError(reply, error)
        }
      },
    }
  )

  // DELETE /api-keys/:id - Delete API key
  fastify.delete<{ Params: { id: string } }>('/api-keys/:id', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession
        const { id } = request.params

        // Check ownership
        const existing = await prisma.apiKey.findFirst({
          where: { id, userId },
        })

        if (!existing) {
          return reply.status(404).send({ error: 'API key not found' })
        }

        await prisma.apiKey.delete({
          where: { id },
        })

        return reply.status(204).send()
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })
}
