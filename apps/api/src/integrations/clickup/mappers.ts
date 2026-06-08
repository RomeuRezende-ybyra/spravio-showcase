import type { Prisma, SprintState, IssueType, IssueStatus } from '@prisma/client'
import type { ClickUpList, ClickUpTask, ClickUpMember, ClickUpTag } from './types.js'

/**
 * Map ClickUp status to IssueStatus
 */
export function mapClickUpStatus(status: string): IssueStatus {
  const lower = status.toLowerCase()

  if (lower === 'complete' || lower === 'closed' || lower === 'done' || lower === 'resolved') {
    return 'DONE'
  }
  if (lower === 'in progress' || lower === 'doing' || lower === 'active' || lower === 'in review') {
    return 'IN_PROGRESS'
  }
  if (lower === 'review' || lower === 'uat' || lower === 'acceptance') {
    return 'UAT'
  }
  if (lower === 'testing' || lower === 'test' || lower === 'qa') {
    return 'TEST'
  }
  if (lower === 'cancelled' || lower === 'rejected') {
    return 'CANCELLED'
  }

  // Default: open, to do, backlog, etc.
  return 'TODO'
}

/**
 * Map ClickUp list to SprintState
 * Uses list name conventions or status if available
 */
export function mapListToSprintState(list: ClickUpList): SprintState {
  const lower = list.name.toLowerCase()

  // Check name patterns
  if (lower.includes('done') || lower.includes('complete') || lower.includes('finished') || lower.includes('closed')) {
    return 'CLOSED'
  }
  if (lower.includes('backlog') || lower.includes('upcoming') || lower.includes('future') || lower.includes('next')) {
    return 'FUTURE'
  }

  // Check if list has dates to determine if it's active
  if (list.start_date && list.due_date) {
    const now = Date.now()
    const start = parseInt(list.start_date, 10)
    const end = parseInt(list.due_date, 10)

    if (now < start) return 'FUTURE'
    if (now > end) return 'CLOSED'
    return 'ACTIVE'
  }

  return 'ACTIVE'
}

/**
 * Map ClickUp tags to IssueType
 */
export function mapTagsToIssueType(tags: ClickUpTag[]): IssueType {
  if (!tags || tags.length === 0) return 'BACKEND'

  const tagNames = tags.map((t) => t.name.toLowerCase())

  if (tagNames.some((n) => n.includes('frontend') || n.includes('ui') || n.includes('ux') || n.includes('web'))) {
    return 'FRONTEND'
  }
  if (tagNames.some((n) => n.includes('backend') || n.includes('api') || n.includes('server') || n.includes('database'))) {
    return 'BACKEND'
  }
  if (tagNames.some((n) => n.includes('design') || n.includes('figma') || n.includes('mockup'))) {
    return 'DESIGN'
  }
  if (tagNames.some((n) => n.includes('devops') || n.includes('infra') || n.includes('deploy') || n.includes('ci') || n.includes('cd'))) {
    return 'DEVOPS'
  }

  return 'BACKEND'
}

/**
 * Map ClickUp member to Developer upsert args
 */
export function mapClickUpMember(
  member: ClickUpMember
): Prisma.DeveloperUpsertArgs {
  const user = member.user
  return {
    where: { clickupUserId: String(user.id) },
    create: {
      clickupUserId: String(user.id),
      name: user.username || user.initials,
      email: user.email || null,
      avatarUrl: user.profilePicture || null,
    },
    update: {
      name: user.username || user.initials,
      email: user.email || null,
      avatarUrl: user.profilePicture || null,
    },
  }
}

/**
 * Map ClickUp list to Sprint upsert args
 */
export function mapClickUpList(
  list: ClickUpList,
  projectId: string
): Prisma.SprintUpsertArgs {
  const state = mapListToSprintState(list)

  // Parse dates if available (ClickUp uses milliseconds)
  const startDate = list.start_date ? new Date(parseInt(list.start_date, 10)) : null
  const endDate = list.due_date ? new Date(parseInt(list.due_date, 10)) : null

  return {
    where: { clickupSprintId: list.id },
    create: {
      clickupSprintId: list.id,
      name: list.name,
      state,
      projectId,
      startDate,
      endDate,
    },
    update: {
      name: list.name,
      state,
      startDate,
      endDate,
    },
  }
}

/**
 * Map ClickUp task to Issue data
 * Returns the data object and assignee user ID (if any)
 */
export function mapClickUpTask(
  task: ClickUpTask
): {
  data: Omit<Prisma.IssueCreateInput, 'sprint' | 'developer' | 'epic'>
  assigneeUserId: string | null
  listId: string
} {
  const status = mapClickUpStatus(task.status.status)
  const issueType = mapTagsToIssueType(task.tags)

  // ClickUp has native story points support
  const points = task.points ?? 0

  // Use date_done or date_closed for resolvedAt
  const resolvedAt = task.date_done
    ? new Date(parseInt(task.date_done, 10))
    : task.date_closed
      ? new Date(parseInt(task.date_closed, 10))
      : null

  return {
    data: {
      clickupTaskId: task.id,
      title: task.name,
      points,
      issueType,
      status,
      wasReturned: false,
      resolvedAt: status === 'DONE' ? resolvedAt : null,
    },
    assigneeUserId: task.assignees.length > 0 ? String(task.assignees[0]!.id) : null,
    listId: task.list.id,
  }
}
