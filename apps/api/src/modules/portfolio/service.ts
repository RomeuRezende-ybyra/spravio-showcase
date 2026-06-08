import { prisma } from '../../lib/prisma.js'
import { budgetService } from '../budget/service.js'

export interface PortfolioProject {
  id: string
  key: string
  name: string
  client: string
  clientSector: string
  source: string
  health: 'green' | 'yellow' | 'red'
  healthScore: number
  sprintNum: number
  sprintDay: number
  sprintLength: number
  sprintCompleted: number
  sprintTotalPoints: number
  burndown: { ideal: number[]; actual: number[] }
  velocityPoints: number
  velocitySpark: number[]
  velocityTrend: 'up' | 'down' | 'stable'
  consumedPct: number
  team: Array<{ name: string; avatar: string; color?: string }>
  prsOpen: number
  prsStale: number
  onTimeProb: number
  lastSync: string
}

export interface PortfolioKPIs {
  totalProjects: number
  activeBudget: number
  avgBurn: number
  openPRs: number
  avgMargin: number
  avgHealth: number
  burnTimeline: Array<{ spent: number; budget: number }>
}

export const portfolioService = {
  async getPortfolio(orgId: string): Promise<{ projects: PortfolioProject[]; kpis: PortfolioKPIs }> {
    // Get all active projects for this org
    const projects = await prisma.project.findMany({
      where: { organizationId: orgId, isActive: true },
      include: {
        client: { select: { name: true } },
        sprints: {
          orderBy: { startDate: 'desc' },
          include: {
            burndownPoints: { orderBy: { date: 'asc' } },
            issues: { select: { points: true, status: true, issueType: true } },
          },
        },
        developers: {
          include: { developer: { select: { name: true, avatarUrl: true } } },
        },
        budget: true,
        forecasts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    let totalBudget = 0
    let totalConsumed = 0
    let totalHealthScore = 0
    const portfolioProjects: PortfolioProject[] = []

    for (const project of projects) {
      // Calculate financials
      let consumedPct = 0
      let budgetHealth: 'green' | 'yellow' | 'red' = 'green'
      let cumulativeCost = 0

      try {
        const financials = await budgetService.calculateFinancials(project.id)
        consumedPct = financials.consumedPercent ?? 0
        budgetHealth = financials.budgetHealth ?? 'green'
        cumulativeCost = financials.cumulativeCost
        if (financials.budget) {
          totalBudget += financials.budget.totalBudget
          totalConsumed += cumulativeCost
        }
      } catch {
        // Budget not configured
      }

      // Find active sprint
      const activeSprint = project.sprints.find((s) => s.state === 'ACTIVE')
      const closedSprints = project.sprints
        .filter((s) => s.state === 'CLOSED')
        .sort((a, b) => (b.endDate?.getTime() ?? 0) - (a.endDate?.getTime() ?? 0))

      // Sprint info
      const sprintNum = activeSprint
        ? project.sprints.filter((s) => s.state !== 'FUTURE').length
        : closedSprints.length
      const now = new Date()
      let sprintDay = 0
      let sprintLength = 14
      if (activeSprint?.startDate && activeSprint?.endDate) {
        sprintDay = Math.max(1, Math.ceil((now.getTime() - activeSprint.startDate.getTime()) / 86_400_000))
        sprintLength = Math.ceil((activeSprint.endDate.getTime() - activeSprint.startDate.getTime()) / 86_400_000)
      }

      // Burndown from active sprint
      const burndownPoints = activeSprint?.burndownPoints ?? []
      const idealArr = burndownPoints.map((bp) => bp.baselinePoints)
      const actualArr = burndownPoints.map((bp) => bp.actualPoints)

      // Velocity from closed sprints
      const velocities = closedSprints.slice(0, 5).map((s) => s.completedPoints)
      const avgVelocity = velocities.length > 0
        ? Math.round(velocities.reduce((a, b) => a + b, 0) / velocities.length)
        : 0
      let velocityTrend: 'up' | 'down' | 'stable' = 'stable'
      if (velocities.length >= 3) {
        const recent = (velocities[0]! + (velocities[1] ?? velocities[0]!)) / 2
        const older = (velocities[velocities.length - 1]! + (velocities[velocities.length - 2] ?? velocities[velocities.length - 1]!)) / 2
        if (recent > older * 1.1) velocityTrend = 'up'
        else if (recent < older * 0.9) velocityTrend = 'down'
      }

      // Team
      const team = project.developers.map((pd) => ({
        name: pd.developer.name,
        avatar: pd.developer.avatarUrl ?? '',
      }))

      // Forecast
      const forecast = project.forecasts[0]
      const onTimeProb = forecast?.onTimeProbability ?? 0

      // Health score (0-100 composite)
      let healthScore = 80 // baseline
      if (budgetHealth === 'red') healthScore -= 30
      else if (budgetHealth === 'yellow') healthScore -= 15
      if (velocityTrend === 'down') healthScore -= 10
      if (onTimeProb < 50) healthScore -= 15
      else if (onTimeProb < 70) healthScore -= 5
      healthScore = Math.max(0, Math.min(100, healthScore))

      totalHealthScore += healthScore

      portfolioProjects.push({
        id: project.id,
        key: project.key ?? project.jiraProjectKey ?? project.azureProjectId ?? '—',
        name: project.name,
        client: project.client?.name ?? 'No client',
        clientSector: project.contractType === 'fixed' ? 'Fixed Price' : project.contractType === 'tm' ? 'Time & Material' : 'Retainer',
        source: project.source,
        health: budgetHealth,
        healthScore,
        sprintNum,
        sprintDay,
        sprintLength,
        sprintCompleted: activeSprint?.completedPoints ?? 0,
        sprintTotalPoints: activeSprint?.totalPoints ?? 0,
        burndown: { ideal: idealArr, actual: actualArr },
        velocityPoints: avgVelocity,
        velocitySpark: velocities.reverse(), // oldest to newest
        velocityTrend,
        consumedPct: Math.round(consumedPct * 10) / 10,
        team,
        prsOpen: 0, // No PR model in DB
        prsStale: 0,
        onTimeProb,
        lastSync: project.lastSyncAt ? formatTimeAgo(project.lastSyncAt) : 'Never',
      })
    }

    const avgBurn = totalBudget > 0 ? Math.round((totalConsumed / totalBudget) * 100) : 0
    const avgHealth = projects.length > 0 ? Math.round(totalHealthScore / projects.length) : 0

    // Build burn timeline from budget data
    const burnTimeline = portfolioProjects.map((p) => {
      const proj = projects.find((pp) => pp.id === p.id)
      return {
        spent: p.consumedPct,
        budget: proj?.budget ? Number(proj.budget.totalBudget) : 0,
      }
    })

    return {
      projects: portfolioProjects,
      kpis: {
        totalProjects: projects.length,
        activeBudget: totalBudget,
        avgBurn,
        openPRs: 0,
        avgMargin: totalBudget > 0 ? Math.round(((totalBudget - totalConsumed) / totalBudget) * 100) : 0,
        avgHealth,
        burnTimeline,
      },
    }
  },
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
