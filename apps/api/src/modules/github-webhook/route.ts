import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { readToken } from '../../lib/secure-tokens.js'
import { verifyGitHubSignature } from './verify.js'
import { handlePullRequestEvent, handlePushEvent } from './handlers.js'

/**
 * GitHub Webhook route — encapsulated with raw body parser.
 * Must be registered separately (same pattern as billingWebhookRoute).
 */
export async function githubWebhookRoute(fastify: FastifyInstance) {
  // Override JSON parser to get raw Buffer for HMAC signature verification
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (_req, body, done) => {
      done(null, body)
    },
  )

  fastify.post('/webhooks/github', async (request, reply) => {
    const signature = request.headers['x-hub-signature-256'] as string | undefined
    const event = request.headers['x-github-event'] as string | undefined
    const deliveryId = request.headers['x-github-delivery'] as string | undefined
    const rawBody = request.body as Buffer

    if (!signature || !event || !deliveryId || !rawBody) {
      return reply.status(400).send({
        success: false,
        error: { code: 'MISSING_HEADERS', message: 'Missing required GitHub webhook headers' },
      })
    }

    // Find webhook config by matching signature against all active configs
    // In practice, orgs have unique webhook secrets so we try each active config
    const configs = await prisma.gitHubWebhookConfig.findMany({
      where: { isActive: true },
      select: { id: true, organizationId: true, webhookSecret: true },
    })

    let matchedOrgId: string | null = null
    for (const config of configs) {
      const secret = readToken(config.webhookSecret)
      if (!secret) continue

      if (verifyGitHubSignature(rawBody, signature, secret)) {
        matchedOrgId = config.organizationId
        break
      }
    }

    if (!matchedOrgId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature' },
      })
    }

    // Deduplicate by deliveryId
    const existing = await prisma.gitHubWebhookEvent.findUnique({
      where: { deliveryId },
    })

    if (existing) {
      return reply.send({ success: true, message: 'Already processed' })
    }

    // Store the event record
    const webhookEvent = await prisma.gitHubWebhookEvent.create({
      data: {
        event,
        action: null,
        deliveryId,
        organizationId: matchedOrgId,
      },
    })

    // Update last event timestamp
    await prisma.gitHubWebhookConfig.update({
      where: { organizationId: matchedOrgId },
      data: { lastEventAt: new Date() },
    })

    // Return 200 immediately, then process async
    reply.send({ success: true })

    // Process event in background (after response is sent)
    const payload = JSON.parse(rawBody.toString())

    try {
      if (event === 'pull_request') {
        await handlePullRequestEvent(payload, matchedOrgId)
      } else if (event === 'push') {
        await handlePushEvent(payload, matchedOrgId)
      }

      await prisma.gitHubWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: { processed: true, action: payload.action ?? null },
      })
    } catch (err) {
      await prisma.gitHubWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          processed: false,
          errorMessage: err instanceof Error ? err.message : String(err),
        },
      })
      fastify.log.error({ err, deliveryId, event }, 'GitHub webhook processing failed')
    }
  })
}
