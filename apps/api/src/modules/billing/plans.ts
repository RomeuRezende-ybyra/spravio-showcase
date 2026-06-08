import type { PlanId, PlanLimits } from '@spravio/types'
import { env } from '../../config/env.js'

export interface PlanConfig {
  id: PlanId
  name: string
  priceMonthly: number
  stripePriceId: string | undefined
  limits: PlanLimits
}

export const PLANS: Record<PlanId, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 49,
    stripePriceId: env.STRIPE_PRICE_STARTER,
    limits: { maxProjects: 3, maxDevelopers: 10, maxGPs: 1 },
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    priceMonthly: 149,
    stripePriceId: env.STRIPE_PRICE_GROWTH,
    limits: { maxProjects: 10, maxDevelopers: 30, maxGPs: 5 },
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    priceMonthly: 399,
    stripePriceId: env.STRIPE_PRICE_SCALE,
    limits: { maxProjects: Infinity, maxDevelopers: Infinity, maxGPs: Infinity },
  },
}

export function getPlanByPriceId(priceId: string): PlanConfig | undefined {
  return Object.values(PLANS).find((p) => p.stripePriceId === priceId)
}

export function getPlanLimits(stripePriceId: string | null): PlanLimits {
  if (!stripePriceId) {
    // Default trialing limits = starter
    return PLANS.starter.limits
  }
  const plan = getPlanByPriceId(stripePriceId)
  return plan?.limits ?? PLANS.starter.limits
}
