import { prisma } from '../../lib/prisma.js'
import { budgetService, type ProjectFinancialsResult } from '../budget/service.js'

export interface FinancialProjectSummary {
  id: string
  name: string
  client: string
  budget: number
  consumed: number
  billed: number
  margin: number
  health: 'green' | 'yellow' | 'red'
  currency: string
}

export interface FinancialSummary {
  totalRevenue: number
  totalConsumed: number
  totalBilled: number
  overdue: number
  burnByProject: Array<{
    projectName: string
    consumed: number
    budget: number
    health: 'green' | 'yellow' | 'red'
  }>
  projects: FinancialProjectSummary[]
}

export const financialService = {
  async getSummary(orgId: string): Promise<FinancialSummary> {
    const projects = await prisma.project.findMany({
      where: { organizationId: orgId, isActive: true },
      include: {
        client: { select: { name: true } },
        budget: true,
      },
    })

    let totalRevenue = 0
    let totalConsumed = 0
    const projectSummaries: FinancialProjectSummary[] = []
    const burnByProject: FinancialSummary['burnByProject'] = []

    for (const project of projects) {
      let financials: ProjectFinancialsResult | null = null
      try {
        financials = await budgetService.calculateFinancials(project.id)
      } catch {
        // Budget not configured
      }

      const budget = project.budget ? Number(project.budget.totalBudget) : 0
      const consumed = financials?.cumulativeCost ?? 0
      const health = financials?.budgetHealth ?? 'green'
      // For demo: billed is slightly higher than consumed (markup)
      const billed = Math.round(consumed * 1.3)
      const margin = billed - consumed

      totalRevenue += budget
      totalConsumed += consumed

      projectSummaries.push({
        id: project.id,
        name: project.name,
        client: project.client?.name ?? 'No client',
        budget,
        consumed,
        billed,
        margin,
        health,
        currency: project.budget?.currency ?? 'USD',
      })

      if (budget > 0) {
        burnByProject.push({
          projectName: project.name,
          consumed,
          budget,
          health,
        })
      }
    }

    const totalBilled = projectSummaries.reduce((sum, p) => sum + p.billed, 0)

    return {
      totalRevenue,
      totalConsumed,
      totalBilled,
      overdue: 0, // No invoice model; show zero
      burnByProject,
      projects: projectSummaries,
    }
  },
}
