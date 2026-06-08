import { budgetRepository } from './repository.js'
import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import type { SetBudgetInput, SetRateInput, LogHoursInput } from './types.js'
import type { BudgetHealth } from '@spravio/types'

export interface SprintCostBreakdown {
  sprintId: string
  sprintName: string
  cost: number
}

export interface DeveloperCostBreakdown {
  developerId: string
  name: string
  avatarUrl: string | null
  hourlyRate: number
  totalHours: number
  totalCost: number
}

export interface ProjectFinancialsResult {
  budget: {
    id: string
    totalBudget: number
    currency: string
    startDate: string
    endDate: string
    projectId: string
  } | null
  sprintCost: number
  cumulativeCost: number
  budgetRemaining: number | null
  burnRate: number | null
  projectedTotal: number | null
  budgetHealth: BudgetHealth | null
  consumedPercent: number | null
  sprintCosts: SprintCostBreakdown[]
  developerCosts: DeveloperCostBreakdown[]
}

export const budgetService = {
  async getBudget(projectId: string) {
    return budgetRepository.findBudget(projectId)
  },

  async setBudget(projectId: string, input: SetBudgetInput) {
    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      throw new AppError('PROJECT_NOT_FOUND', `Project ${projectId} not found`, 404)
    }
    return budgetRepository.upsertBudget(projectId, input)
  },

  async setRate(projectId: string, developerId: string, input: SetRateInput) {
    // Verify developer is part of the project
    const link = await prisma.projectDeveloper.findFirst({
      where: { projectId, developerId },
    })
    if (!link) {
      throw new AppError('DEVELOPER_NOT_IN_PROJECT', 'Developer is not assigned to this project', 400)
    }
    return budgetRepository.upsertRate(developerId, projectId, input)
  },

  async logHours(projectId: string, sprintId: string, input: LogHoursInput) {
    // Verify sprint belongs to project
    const sprint = await prisma.sprint.findFirst({
      where: { id: sprintId, projectId },
    })
    if (!sprint) {
      throw new AppError('SPRINT_NOT_FOUND', 'Sprint not found in this project', 404)
    }
    return budgetRepository.upsertHours(sprintId, input)
  },

  async getRates(projectId: string) {
    return budgetRepository.findRatesByProject(projectId)
  },

  async calculateFinancials(projectId: string): Promise<ProjectFinancialsResult> {
    // Get project for tenant isolation
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, organizationId: true },
    })
    if (!project) {
      throw new AppError('PROJECT_NOT_FOUND', `Project ${projectId} not found`, 404)
    }

    const budget = await budgetRepository.findBudget(projectId)

    // Get all sprints for this project
    const sprints = await prisma.sprint.findMany({
      where: {
        projectId,
        project: { organizationId: project.organizationId }  // ✅ Tenant isolation
      },
      select: { id: true, name: true },
      orderBy: { startDate: 'asc' },
    })

    // Get all sprint hours with developer info
    const allHours = await budgetRepository.findAllSprintHours(projectId)

    // Get all rates for this project
    const rates = await budgetRepository.findRatesByProject(projectId)
    const rateMap = new Map(rates.map((r: typeof rates[number]) => [r.developerId, Number(r.hourlyRate)]))

    // Calculate cost per sprint
    const sprintCosts: SprintCostBreakdown[] = []
    let cumulativeCost = 0

    for (const sprint of sprints) {
      const sprintHours = allHours.filter((h: typeof allHours[number]) => h.sprint.id === sprint.id)
      let sprintCost = 0
      for (const sh of sprintHours) {
        const rate = rateMap.get(sh.developerId) ?? 0
        sprintCost += rate * Number(sh.hoursLogged)
      }
      sprintCosts.push({ sprintId: sprint.id, sprintName: sprint.name, cost: sprintCost })
      cumulativeCost += sprintCost
    }

    // Calculate cost per developer (aggregate)
    const devCostMap = new Map<string, { name: string; avatarUrl: string | null; totalHours: number; totalCost: number }>()
    for (const sh of allHours) {
      const rate = rateMap.get(sh.developerId) ?? 0
      const hours = Number(sh.hoursLogged)
      const existing = devCostMap.get(sh.developerId)
      if (existing) {
        existing.totalHours += hours
        existing.totalCost += rate * hours
      } else {
        devCostMap.set(sh.developerId, {
          name: sh.developer.name,
          avatarUrl: sh.developer.avatarUrl,
          totalHours: hours,
          totalCost: rate * hours,
        })
      }
    }

    const developerCosts: DeveloperCostBreakdown[] = Array.from(devCostMap.entries()).map(
      ([developerId, data]) => ({
        developerId,
        name: data.name,
        avatarUrl: data.avatarUrl,
        hourlyRate: rateMap.get(developerId) ?? 0,
        totalHours: data.totalHours,
        totalCost: data.totalCost,
      }),
    )

    // Current sprint cost (last sprint if exists)
    const lastSprintCost = sprintCosts.length > 0 ? sprintCosts[sprintCosts.length - 1]!.cost : 0

    if (!budget) {
      return {
        budget: null,
        sprintCost: lastSprintCost,
        cumulativeCost,
        budgetRemaining: null,
        burnRate: null,
        projectedTotal: null,
        budgetHealth: null,
        consumedPercent: null,
        sprintCosts,
        developerCosts,
      }
    }

    const totalBudget = Number(budget.totalBudget)
    const budgetRemaining = totalBudget - cumulativeCost
    const consumedPercent = totalBudget > 0 ? (cumulativeCost / totalBudget) * 100 : 0

    // Calculate burn rate and projection
    const now = new Date()
    const startDate = new Date(budget.startDate)
    const endDate = new Date(budget.endDate)
    const daysElapsed = Math.max(1, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.max(0, (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    const burnRate = cumulativeCost / daysElapsed
    const projectedTotal = cumulativeCost + burnRate * daysRemaining

    // Determine budget health
    let budgetHealth: BudgetHealth
    if (consumedPercent > 85 || projectedTotal > totalBudget) {
      budgetHealth = 'red'
    } else if (consumedPercent >= 70) {
      budgetHealth = 'yellow'
    } else {
      budgetHealth = 'green'
    }

    return {
      budget: {
        id: budget.id,
        totalBudget,
        currency: budget.currency,
        startDate: budget.startDate.toISOString(),
        endDate: budget.endDate.toISOString(),
        projectId: budget.projectId,
      },
      sprintCost: lastSprintCost,
      cumulativeCost,
      budgetRemaining,
      burnRate: Math.round(burnRate * 100) / 100,
      projectedTotal: Math.round(projectedTotal * 100) / 100,
      budgetHealth,
      consumedPercent: Math.round(consumedPercent * 10) / 10,
      sprintCosts,
      developerCosts,
    }
  },
}
