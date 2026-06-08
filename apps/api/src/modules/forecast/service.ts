import { prisma } from '../../lib/prisma.js'
import { generateForecast, isAnthropicConfigured } from '../../integrations/anthropic/index.js'
import { forecastRepository } from './repository.js'
import { AppError } from '../../lib/errors.js'
import type { ForecastInput } from '../../integrations/anthropic/types.js'

export const forecastService = {
  async canGenerateForecast(projectId: string): Promise<boolean> {
    if (!isAnthropicConfigured()) {
      return false
    }

    // Get project for tenant isolation
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, organizationId: true },
    })
    if (!project) return false

    const completedSprints = await prisma.sprint.count({
      where: {
        projectId,
        state: 'CLOSED',
        project: { organizationId: project.organizationId }  // ✅ Tenant isolation
      },
    })
    return completedSprints >= 3
  },

  async gatherForecastInput(projectId: string): Promise<ForecastInput | null> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sprints: {
          where: { state: 'CLOSED' },
          orderBy: { endDate: 'desc' },
          include: {
            issues: { select: { points: true, wasReturned: true } },
          },
        },
        developers: true,
        budget: true,
      },
    })

    if (!project || project.sprints.length < 3) return null

    // Calculate velocity from last 3-5 sprints
    const recentSprints = project.sprints.slice(0, 5)
    const velocities = recentSprints.map((s) => s.issues.reduce((sum, i) => sum + i.points, 0))
    const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length

    // Calculate velocity trend
    let velocityTrend: 'increasing' | 'stable' | 'decreasing' = 'stable'
    if (velocities.length >= 3) {
      const recent = velocities.slice(0, 2).reduce((a, b) => a + b, 0) / 2
      const older = velocities.slice(-2).reduce((a, b) => a + b, 0) / 2
      if (recent > older * 1.1) velocityTrend = 'increasing'
      else if (recent < older * 0.9) velocityTrend = 'decreasing'
    }

    // Calculate rework rate
    const allIssues = project.sprints.flatMap((s) => s.issues)
    const returnedCount = allIssues.filter((i) => i.wasReturned).length
    const reworkRate = allIssues.length > 0 ? returnedCount / allIssues.length : 0

    // Get remaining points
    const remainingPoints = await prisma.issue.aggregate({
      where: {
        sprint: {
          projectId,
          state: { in: ['ACTIVE', 'FUTURE'] },
          project: { organizationId: project.organizationId }  // ✅ Tenant isolation
        },
        status: { not: 'DONE' },
      },
      _sum: { points: true },
    })

    // Calculate sprint length
    const sprintWithDates = project.sprints.find((s) => s.startDate && s.endDate)
    const sprintLengthDays = sprintWithDates?.startDate && sprintWithDates?.endDate
      ? Math.ceil(
          (sprintWithDates.endDate.getTime() - sprintWithDates.startDate.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 14

    // Calculate days remaining (if budget has end date)
    const daysRemaining = project.budget?.endDate
      ? Math.ceil((project.budget.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    // Determine budget health based on burn rate (simplified)
    let budgetHealth: 'green' | 'yellow' | 'red' | null = null
    if (project.budget) {
      const _totalBudget = Number(project.budget.totalBudget)
      const startDate = project.budget.startDate.getTime()
      const endDate = project.budget.endDate.getTime()
      const now = Date.now()
      const elapsed = now - startDate
      const total = endDate - startDate
      const expectedProgress = elapsed / total

      // For simplicity, assume linear burn rate and estimate based on project progress
      // A more sophisticated approach would factor in actual costs from SprintHours
      if (expectedProgress > 0.9) {
        budgetHealth = 'yellow' // Nearing end
      } else if (expectedProgress > 0.75) {
        budgetHealth = 'green'
      } else {
        budgetHealth = 'green'
      }
    }

    return {
      projectName: project.name,
      velocity: avgVelocity,
      velocityTrend,
      reworkRate,
      teamSize: project.developers.length,
      totalRemainingPoints: remainingPoints._sum.points ?? 0,
      completedSprints: project.sprints.length,
      daysRemaining,
      budgetHealth,
      sprintLengthDays,
    }
  },

  async generateAndSave(projectId: string) {
    if (!isAnthropicConfigured()) {
      throw new AppError('ANTHROPIC_NOT_CONFIGURED', 'Anthropic API key is not configured', 400)
    }

    const input = await this.gatherForecastInput(projectId)
    if (!input) {
      throw new AppError('INSUFFICIENT_DATA', 'Need at least 3 completed sprints to generate a forecast', 400)
    }

    const output = await generateForecast(input)
    const forecast = await forecastRepository.create(projectId, output, input)

    return { forecast, input, output }
  },

  async getLatest(projectId: string) {
    return forecastRepository.findLatest(projectId)
  },

  async getHistory(projectId: string, limit?: number) {
    return forecastRepository.findHistory(projectId, limit)
  },
}
