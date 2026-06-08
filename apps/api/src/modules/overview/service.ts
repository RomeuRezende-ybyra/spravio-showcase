import { prisma } from '../../lib/prisma.js'
import { sprintService } from '../sprints/service.js'
import { developerService } from '../developers/service.js'
import { pullRequestService } from '../pullrequests/service.js'
import { budgetService } from '../budget/service.js'
import { AppError } from '../../lib/errors.js'
import type { ProjectOverview } from '@spravio/types'

export const overviewService = {
  async getOverview(projectId: string): Promise<ProjectOverview> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assignments: {
          include: { user: { select: { id: true, name: true } } },
          take: 1,
        },
      },
    })
    if (!project) {
      throw new AppError('PROJECT_NOT_FOUND', `Project ${projectId} not found`, 404)
    }

    const gp = project.assignments[0]?.user ?? null

    const [currentSprint, developers] = await Promise.all([
      sprintService.getCurrentSprint(projectId),
      developerService.listByProject(projectId),
    ])

    // Aggregate issues from current sprint for progress breakdown
    const currentSprintIssues = currentSprint
      ? await prisma.issue.findMany({
          where: {
            sprint: {
              projectId,
              state: 'ACTIVE',
              project: { organizationId: project.organizationId }  // ✅ Tenant isolation
            },
          },
        })
      : []

    const statusCounts = {
      done: 0,
      uat: 0,
      test: 0,
      inProgress: 0,
      todo: 0,
    }

    let totalPoints = 0
    let backendPoints = 0
    let frontendPoints = 0

    for (const issue of currentSprintIssues) {
      totalPoints += issue.points
      if (issue.issueType === 'BACKEND') backendPoints += issue.points
      if (issue.issueType === 'FRONTEND') frontendPoints += issue.points

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

    // Fetch GitHub summary if repo is configured
    let githubSummary: ProjectOverview['githubSummary'] = null
    if (project.githubRepo) {
      try {
        githubSummary = await pullRequestService.getStats(projectId)
      } catch {
        // GitHub not available — leave as null
      }
    }

    // Fetch budget summary
    let budgetSummary: ProjectOverview['budgetSummary'] = null
    try {
      const financials = await budgetService.calculateFinancials(projectId)
      if (financials.budget) {
        budgetSummary = {
          totalBudget: financials.budget.totalBudget,
          cumulativeCost: financials.cumulativeCost,
          consumedPercent: financials.consumedPercent ?? 0,
          budgetHealth: financials.budgetHealth ?? 'green',
          currency: financials.budget.currency,
        }
      }
    } catch {
      // Budget not configured — leave as null
    }

    return {
      project: {
        id: project.id,
        name: project.name,
        source: project.source as 'jira' | 'azure',
        jiraProjectKey: project.jiraProjectKey,
        azureProjectId: project.azureProjectId,
        githubRepo: project.githubRepo,
        isActive: project.isActive,
        lastSyncAt: project.lastSyncAt?.toISOString() ?? null,
        assignedGPId: gp?.id ?? null,
        assignedGPName: gp?.name ?? null,
      },
      currentSprint,
      developers,
      progressByStatus: statusCounts,
      totalPoints,
      backendPoints,
      frontendPoints,
      overallProgress,
      githubSummary,
      budgetSummary,
    }
  },
}
