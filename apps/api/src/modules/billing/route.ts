import type { FastifyInstance } from 'fastify'
import Stripe from 'stripe'
import { z } from 'zod'
import { env } from '../../config/env.js'
import { billingService } from './service.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { rateLimitByUser } from '../../hooks/rateLimitByUser.js'
import { sendError } from '../../lib/errors.js'
import { PlanIdSchema } from '@spravio/types'

const CheckoutInput = z.object({
  planId: PlanIdSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

const PortalInput = z.object({
  returnUrl: z.string().url(),
})

export default async function billingRoutes(fastify: FastifyInstance) {
  // Create Stripe Checkout session
  fastify.post(
    '/billing/checkout',
    {
      preHandler: [requireAuth(['OWNER']), rateLimitByUser(5, 10)], // 5 req per 10 min per user
      config: {
        rateLimit: {
          max: 20, // 20 req per minute globally
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      try {
        const input = CheckoutInput.parse(request.body)
        const result = await billingService.createCheckoutSession(
          request.userSession.orgId,
          input.planId,
          input.successUrl,
          input.cancelUrl,
        )
        return reply.send({ success: true, data: result })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // Create Stripe Customer Portal session
  fastify.post(
    '/billing/portal',
    {
      preHandler: [requireAuth(['OWNER']), rateLimitByUser(10, 10)], // 10 req per 10 min per user
      config: {
        rateLimit: {
          max: 30, // 30 req per minute globally
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      try {
        const input = PortalInput.parse(request.body)
        const result = await billingService.createPortalSession(
          request.userSession.orgId,
          input.returnUrl,
        )
        return reply.send({ success: true, data: result })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // Get current subscription status
  fastify.get(
    '/billing/subscription',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const info = await billingService.getSubscriptionInfo(request.userSession.orgId)
        return reply.send({ success: true, data: info })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}

// Separate encapsulated plugin for webhook (needs raw body parser)
export async function billingWebhookRoute(fastify: FastifyInstance) {
  // Override JSON parser to get raw Buffer for signature verification
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (_req, body, done) => {
      done(null, body)
    },
  )

  fastify.post('/billing/webhook', async (request, reply) => {
    try {
      if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
        return reply.status(500).send({ success: false, error: { code: 'STRIPE_NOT_CONFIGURED', message: 'Stripe not configured' } })
      }

      const stripe = new Stripe(env.STRIPE_SECRET_KEY)
      const sig = request.headers['stripe-signature'] as string
      const rawBody = request.body as Buffer

      if (!rawBody || !sig) {
        return reply.status(400).send({ success: false, error: { code: 'MISSING_SIGNATURE', message: 'Missing Stripe signature' } })
      }

      const event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET)
      await billingService.handleWebhookEvent(event)

      return reply.send({ received: true })
    } catch (error) {
      sendError(reply, error)
    }
  })
}
