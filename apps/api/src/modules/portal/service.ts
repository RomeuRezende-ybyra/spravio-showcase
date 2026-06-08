import jwt from 'jsonwebtoken'
import { prisma } from '../../lib/prisma.js'
import { env } from '../../config/env.js'
import { sprintService } from '../sprints/service.js'
import { AppError } from '../../lib/errors.js'
import type { PortalData } from '@spravio/types'

interface PortalTokenPayload {
  projectId: string
  expiresAt: string | null
}

export const portalService = {
  generateToken(projectId: string, expiryDays: number | null): string {
    const payload: PortalTokenPayload = {
      projectId,
      expiresAt: expiryDays
        ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
        : null,
    }

    const options: jwt.SignOptions = expiryDays
      ? { expiresIn: `${expiryDays}d` }
      : {}

    return jwt.sign(payload, env.PORTAL_SECRET, options)
  },

  verifyToken(token: string): PortalTokenPayload {
    try {
      return jwt.verify(token, env.PORTAL_SECRET) as PortalTokenPayload
    } catch {
      throw new AppError('INVALID_TOKEN', 'Invalid or expired portal token', 401)
    }
  },

  async getPortalData(projectId: string): Promise<PortalData> {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      throw new AppError('PROJECT_NOT_FOUND', `Project ${projectId} not found`, 404)
    }

    const currentSprint = await sprintService.getCurrentSprint(projectId)

    // Calculate overall progress from current sprint issues
    const currentSprintIssues = currentSprint
      ? await prisma.issue.findMany({
          where: {
            sprint: {
              projectId,
              state: 'ACTIVE',
              project: { organizationId: project.organizationId }  // ✅ Tenant isolation
            }
          },
        })
      : []

    const statusCounts = { done: 0, uat: 0, test: 0, inProgress: 0, todo: 0 }
    for (const issue of currentSprintIssues) {
      switch (issue.status) {
        case 'DONE': statusCounts.done++; break
        case 'UAT': statusCounts.uat++; break
        case 'TEST': statusCounts.test++; break
        case 'IN_PROGRESS': statusCounts.inProgress++; break
        default: statusCounts.todo++; break
      }
    }

    const totalCards = currentSprintIssues.length
    const overallProgress = totalCards > 0
      ? Math.round((statusCounts.done / totalCards) * 100)
      : 0

    // Team average delivery rate (no individual scores)
    const devStats = await prisma.projectDeveloper.findMany({
      where: { projectId },
      select: { deliveryRate: true },
    })
    const teamDeliveryRate = devStats.length > 0
      ? Math.round(devStats.reduce((sum: number, d: typeof devStats[number]) => sum + d.deliveryRate, 0) / devStats.length)
      : 0

    return {
      projectName: project.name,
      jiraProjectKey: project.jiraProjectKey,
      lastSyncAt: project.lastSyncAt?.toISOString() ?? null,
      currentSprint,
      overallProgress,
      progressByStatus: statusCounts,
      teamDeliveryRate,
    }
  },
}
