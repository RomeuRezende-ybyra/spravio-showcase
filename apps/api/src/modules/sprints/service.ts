import { sprintRepository } from './repository.js'
import type { SprintSummary } from '@spravio/types'

export const sprintService = {
  async listByProject(projectId: string) {
    return sprintRepository.findByProjectId(projectId)
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
