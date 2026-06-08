import type { Prisma, SprintState, IssueType, IssueStatus } from '@prisma/client'
import type { LinearCycle, LinearIssue, LinearUser, LinearLabel } from './types.js'

/**
 * Map Linear workflow state type to IssueStatus
 */
export function mapLinearStateToStatus(stateType: string): IssueStatus {
  switch (stateType) {
    case 'completed':
      return 'DONE'
    case 'canceled':
      return 'CANCELLED'
    case 'started':
      return 'IN_PROGRESS'
    case 'unstarted':
      return 'TODO'
    case 'backlog':
      return 'TODO'
    default:
      return 'TODO'
  }
}

/**
 * Map Linear cycle to SprintState based on dates
 */
export function mapCycleToSprintState(cycle: LinearCycle): SprintState {
  if (cycle.completedAt) {
    return 'CLOSED'
  }

  const now = new Date()
  const start = new Date(cycle.startsAt)
  const end = new Date(cycle.endsAt)

  if (now < start) {
    return 'FUTURE'
  }
  if (now > end) {
    return 'CLOSED'
  }

  return 'ACTIVE'
}

/**
 * Map Linear labels to IssueType
 */
export function mapLabelsToIssueType(labels: LinearLabel[]): IssueType {
  if (!labels || labels.length === 0) return 'BACKEND'

  const labelNames = labels.map((l) => l.name.toLowerCase())

  if (labelNames.some((n) => n.includes('frontend') || n.includes('ui') || n.includes('ux') || n.includes('web') || n.includes('client'))) {
    return 'FRONTEND'
  }
  if (labelNames.some((n) => n.includes('backend') || n.includes('api') || n.includes('server') || n.includes('database') || n.includes('db'))) {
    return 'BACKEND'
  }
  if (labelNames.some((n) => n.includes('design') || n.includes('figma') || n.includes('mockup') || n.includes('visual'))) {
    return 'DESIGN'
  }
  if (labelNames.some((n) => n.includes('devops') || n.includes('infra') || n.includes('deploy') || n.includes('ci') || n.includes('cd') || n.includes('ops'))) {
    return 'DEVOPS'
  }

  return 'BACKEND'
}

/**
 * Map Linear user to Developer upsert args
 */
export function mapLinearUser(user: LinearUser): Prisma.DeveloperUpsertArgs {
  return {
    where: { linearUserId: user.id },
    create: {
      linearUserId: user.id,
      name: user.displayName || user.name,
      email: user.email || null,
      avatarUrl: user.avatarUrl || null,
    },
    update: {
      name: user.displayName || user.name,
      email: user.email || null,
      avatarUrl: user.avatarUrl || null,
    },
  }
}

/**
 * Map Linear cycle to Sprint upsert args
 */
export function mapLinearCycle(
  cycle: LinearCycle,
  projectId: string
): Prisma.SprintUpsertArgs {
  const state = mapCycleToSprintState(cycle)
  const name = cycle.name || `Cycle ${cycle.number}`

  return {
    where: { linearCycleId: cycle.id },
    create: {
      linearCycleId: cycle.id,
      name,
      state,
      projectId,
      startDate: new Date(cycle.startsAt),
      endDate: new Date(cycle.endsAt),
      completeDate: cycle.completedAt ? new Date(cycle.completedAt) : null,
    },
    update: {
      name,
      state,
      startDate: new Date(cycle.startsAt),
      endDate: new Date(cycle.endsAt),
      completeDate: cycle.completedAt ? new Date(cycle.completedAt) : null,
    },
  }
}

/**
 * Map Linear issue to Issue data
 * Returns the data object and assignee user ID (if any)
 */
export function mapLinearIssue(
  issue: LinearIssue
): {
  data: Omit<Prisma.IssueCreateInput, 'sprint' | 'developer' | 'epic'>
  assigneeUserId: string | null
  cycleId: string | null
} {
  const status = mapLinearStateToStatus(issue.state.type)
  const issueType = mapLabelsToIssueType(issue.labels.nodes)

  // Linear uses "estimate" for story points
  const points = issue.estimate ?? 0

  // Use completedAt for resolvedAt
  const resolvedAt = issue.completedAt ? new Date(issue.completedAt) : null

  return {
    data: {
      linearIssueId: issue.id,
      title: issue.title,
      points,
      issueType,
      status,
      wasReturned: false,
      resolvedAt: status === 'DONE' ? resolvedAt : null,
    },
    assigneeUserId: issue.assignee?.id ?? null,
    cycleId: issue.cycle?.id ?? null,
  }
}
