import Stripe from 'stripe'
import { prisma } from '../../lib/prisma.js'
import { env } from '../../config/env.js'
import { AppError } from '../../lib/errors.js'
import { getPlanByPriceId, getPlanLimits } from './plans.js'
import type { SubscriptionInfo, PlanId } from '@spravio/types'

function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new AppError('STRIPE_NOT_CONFIGURED', 'Stripe is not configured', 500)
  }
  return new Stripe(env.STRIPE_SECRET_KEY)
}

export const billingService = {
  async createCheckoutSession(orgId: string, planId: PlanId, successUrl: string, cancelUrl: string) {
    const stripe = getStripe()
    const { PLANS } = await import('./plans.js')
    const plan = PLANS[planId]
    if (!plan.stripePriceId) {
      throw new AppError('PLAN_NOT_CONFIGURED', `Stripe price not configured for plan: ${planId}`, 400)
    }

    const org = await prisma.organization.findUniqueOrThrow({ where: { id: orgId } })

    // Get or create Stripe customer
    let customerId = org.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: org.name,
        metadata: { orgId: org.id },
      })
      customerId = customer.id
      await prisma.organization.update({
        where: { id: orgId },
        data: { stripeCustomerId: customerId },
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { orgId },
    })

    return { url: session.url }
  },

  async createPortalSession(orgId: string, returnUrl: string) {
    const stripe = getStripe()
    const org = await prisma.organization.findUniqueOrThrow({ where: { id: orgId } })

    if (!org.stripeCustomerId) {
      throw new AppError('NO_SUBSCRIPTION', 'No billing account found', 400)
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: returnUrl,
    })

    return { url: session.url }
  },

  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orgId = session.metadata?.orgId
        if (!orgId || !session.subscription) break

        const stripe = getStripe()
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId = subscription.items.data[0]?.price.id

        await prisma.organization.update({
          where: { id: orgId },
          data: {
            stripeCustomerId: session.customer as string,
            stripePriceId: priceId ?? null,
            subscriptionStatus: 'ACTIVE',
          },
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price.id
        const status = subscription.status === 'active' ? 'ACTIVE'
          : subscription.status === 'past_due' ? 'PAST_DUE'
          : subscription.status === 'trialing' ? 'TRIALING'
          : 'CANCELLED'

        await prisma.organization.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripePriceId: priceId ?? null,
            subscriptionStatus: status,
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await prisma.organization.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripePriceId: null,
            subscriptionStatus: 'CANCELLED',
          },
        })
        break
      }
    }
  },

  async getSubscriptionInfo(orgId: string): Promise<SubscriptionInfo> {
    const org = await prisma.organization.findUniqueOrThrow({ where: { id: orgId } })
    const limits = getPlanLimits(org.stripePriceId)
    const plan = org.stripePriceId ? getPlanByPriceId(org.stripePriceId) : null

    const [projectCount, developerCount, gpCount] = await Promise.all([
      prisma.project.count({ where: { organizationId: orgId, isActive: true } }),
      prisma.projectDeveloper.count({
        where: { project: { organizationId: orgId, isActive: true } },
      }),
      prisma.organizationUser.count({
        where: { organizationId: orgId, role: 'PROJECT_MANAGER' },
      }),
    ])

    return {
      status: org.subscriptionStatus,
      planId: plan?.id ?? null,
      limits,
      usage: {
        projects: projectCount,
        developers: developerCount,
        gps: gpCount,
      },
    }
  },
}
