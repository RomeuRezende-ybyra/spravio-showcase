import { sprintRepository } from './repository.js'
import { prisma } from '../../lib/prisma.js'
import type { SprintSummary } from '@spravio/types'

export const sprintService = {
  async listByProject(projectId: string) {
    return sprintRepository.findByProjectId(projectId)
  },

  async listAllForOrg(orgId: string) {
    const sprints = await prisma.sprint.findMany({
      where: { project: { organizationId: orgId } },
      include: {
        project: { select: { id: true, name: true, key: true } },
        issues: { select: { id: true, points: true, status: true, issueType: true } },
        burndownPoints: { orderBy: { date: 'asc' } },
      },
      orderBy: [{ state: 'asc' }, { startDate: 'desc' }],
    })

    return sprints.map((sprint) => {
      const issues = sprint.issues
      const totalCards = issues.length
      const completedCards = issues.filter((i) => i.status === 'DONE').length
      const totalPoints = sprint.totalPoints
      const backendPoints = issues
        .filter((i) => i.issueType === 'BACKEND')
        .reduce((sum, i) => sum + i.points, 0)
      const frontendPoints = issues
        .filter((i) => i.issueType === 'FRONTEND')
        .reduce((sum, i) => sum + i.points, 0)

      return {
        id: sprint.id,
        name: sprint.name,
        state: sprint.state,
        startDate: sprint.startDate?.toISOString() ?? null,
        endDate: sprint.endDate?.toISOString() ?? null,
        totalPoints,
        completedPoints: sprint.completedPoints,
        project: sprint.project,
        totalCards,
        completedCards,
        remainingCards: totalCards - completedCards,
        completionPercentage: totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0,
        backendPoints,
        frontendPoints,
        burndown: sprint.burndownPoints.map((bp) => ({
          date: bp.date.toISOString().split('T')[0]!,
          baselinePoints: bp.baselinePoints,
          actualPoints: bp.actualPoints,
          completedPoints: bp.completedPoints,
        })),
        issuesByStatus: {
          todo: issues.filter((i) => i.status === 'TODO').length,
          inProgress: issues.filter((i) => i.status === 'IN_PROGRESS').length,
          test: issues.filter((i) => i.status === 'TEST').length,
          uat: issues.filter((i) => i.status === 'UAT').length,
          done: issues.filter((i) => i.status === 'DONE').length,
          cancelled: issues.filter((i) => i.status === 'CANCELLED').length,
        },
      }
    })
  },

  async getCurrentSprint(projectId: string): Promise<SprintSummary | null> {
    const sprint = await sprintRepository.findCurrent(projectId)
    if (!sprint) return null

    const issues = sprint.issues
    const totalCards = issues.length
    const completedCards = issues.filter((i: typeof issues[number]) => i.status === 'DONE').length
    const remainingCards = totalCards - completedCards
    const totalPoints = sprint.totalPoints
    const backendPoints = issues
      .filter((i: typeof issues[number]) => i.issueType === 'BACKEND')
      .reduce((sum: number, i: typeof issues[number]) => sum + i.points, 0)
    const frontendPoints = issues
      .filter((i: typeof issues[number]) => i.issueType === 'FRONTEND')
      .reduce((sum: number, i: typeof issues[number]) => sum + i.points, 0)

    return {
      sprint: {
        id: sprint.id,
        jiraSprintId: sprint.jiraSprintId,
        azureIterationId: sprint.azureIterationId,
        name: sprint.name,
        state: sprint.state,
        startDate: sprint.startDate?.toISOString() ?? null,
        endDate: sprint.endDate?.toISOString() ?? null,
        totalPoints: sprint.totalPoints,
        completedPoints: sprint.completedPoints,
      },
      totalCards,
      completedCards,
      remainingCards,
      completionPercentage: totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0,
      totalPoints,
      backendPoints,
      frontendPoints,
      burndown: sprint.burndownPoints.map((bp: typeof sprint.burndownPoints[number]) => ({
        date: bp.date.toISOString().split('T')[0]!,
        baselinePoints: bp.baselinePoints,
        actualPoints: bp.actualPoints,
        completedPoints: bp.completedPoints,
      })),
    }
  },
}
