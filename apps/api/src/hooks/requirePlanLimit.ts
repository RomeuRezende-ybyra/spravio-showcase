import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { getPlanLimits } from '../modules/billing/plans.js'
import { AppError } from '../lib/errors.js'

type LimitType = 'projects' | 'developers' | 'gps'

export function requirePlanLimit(limitType: LimitType) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const { orgId } = request.userSession
    const org = await prisma.organization.findUniqueOrThrow({ where: { id: orgId } })

    // Skip enforcement if subscription is cancelled (locked out)
    if (org.subscriptionStatus === 'CANCELLED') {
      throw new AppError('SUBSCRIPTION_CANCELLED', 'Your subscription has been cancelled. Please reactivate.', 403)
    }

    const limits = getPlanLimits(org.stripePriceId)

    if (limitType === 'projects') {
      const count = await prisma.project.count({ where: { organizationId: orgId, isActive: true } })
      if (count >= limits.maxProjects) {
        throw new AppError('PLAN_LIMIT_EXCEEDED', `Your plan allows up to ${limits.maxProjects} projects. Upgrade to add more.`, 403)
      }
    }

    if (limitType === 'developers') {
      const count = await prisma.projectDeveloper.count({
        where: { project: { organizationId: orgId, isActive: true } },
      })
      if (count >= limits.maxDevelopers) {
        throw new AppError('PLAN_LIMIT_EXCEEDED', `Your plan allows up to ${limits.maxDevelopers} developers. Upgrade to add more.`, 403)
      }
    }

    if (limitType === 'gps') {
      const count = await prisma.organizationUser.count({
        where: { organizationId: orgId, role: 'PROJECT_MANAGER' },
      })
      if (count >= limits.maxGPs) {
        throw new AppError('PLAN_LIMIT_EXCEEDED', `Your plan allows up to ${limits.maxGPs} project managers. Upgrade to add more.`, 403)
      }
    }
  }
}
