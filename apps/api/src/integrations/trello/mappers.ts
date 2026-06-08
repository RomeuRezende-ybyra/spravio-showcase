import type { Prisma, SprintState, IssueType, IssueStatus } from '@prisma/client'
import type { TrelloList, TrelloCard, TrelloMember } from './types.js'

/**
 * Map Trello list name to SprintState
 * Convention: lists with "done"/"complete" in name = CLOSED
 *             lists with "backlog"/"todo" in name = FUTURE
 *             everything else = ACTIVE
 */
export function mapListToSprintState(listName: string): SprintState {
  const lower = listName.toLowerCase()
  if (lower.includes('done') || lower.includes('complete') || lower.includes('finished')) {
    return 'CLOSED'
  }
  if (lower.includes('backlog') || lower.includes('todo') || lower.includes('to do') || lower.includes('upcoming')) {
    return 'FUTURE'
  }
  return 'ACTIVE'
}

/**
 * Map Trello label color to IssueType
 * This is configurable - default mapping based on common conventions
 */
export function mapLabelToIssueType(labels: TrelloCard['labels']): IssueType {
  if (!labels || labels.length === 0) return 'BACKEND'

  const labelNames = labels.map((l) => l.name.toLowerCase())
  const labelColors = labels.map((l) => l.color?.toLowerCase() || '')

  // Check by name first
  if (labelNames.some((n) => n.includes('frontend') || n.includes('ui') || n.includes('ux'))) {
    return 'FRONTEND'
  }
  if (labelNames.some((n) => n.includes('backend') || n.includes('api') || n.includes('server'))) {
    return 'BACKEND'
  }
  if (labelNames.some((n) => n.includes('design') || n.includes('figma'))) {
    return 'DESIGN'
  }
  if (labelNames.some((n) => n.includes('devops') || n.includes('infra') || n.includes('deploy'))) {
    return 'DEVOPS'
  }

  // Fallback to color mapping
  if (labelColors.includes('blue') || labelColors.includes('sky')) return 'FRONTEND'
  if (labelColors.includes('green') || labelColors.includes('lime')) return 'BACKEND'
  if (labelColors.includes('purple') || labelColors.includes('pink')) return 'DESIGN'
  if (labelColors.includes('orange') || labelColors.includes('yellow')) return 'DEVOPS'

  return 'BACKEND'
}

/**
 * Map Trello list position to IssueStatus
 * Convention based on common Kanban board structures
 */
export function mapListToIssueStatus(listName: string): IssueStatus {
  const lower = listName.toLowerCase()

  if (lower.includes('done') || lower.includes('complete') || lower.includes('finished')) {
    return 'DONE'
  }
  if (lower.includes('uat') || lower.includes('review') || lower.includes('acceptance')) {
    return 'UAT'
  }
  if (lower.includes('test') || lower.includes('qa') || lower.includes('testing')) {
    return 'TEST'
  }
  if (lower.includes('progress') || lower.includes('doing') || lower.includes('wip') || lower.includes('working')) {
    return 'IN_PROGRESS'
  }
  if (lower.includes('cancel') || lower.includes('archived')) {
    return 'CANCELLED'
  }

  // Default to TODO for backlog/todo lists or unknown
  return 'TODO'
}

/**
 * Map Trello member to Developer upsert args
 */
export function mapTrelloMember(
  member: TrelloMember
): Prisma.DeveloperUpsertArgs {
  return {
    where: { trelloMemberId: member.id },
    create: {
      trelloMemberId: member.id,
      name: member.fullName || member.username,
      email: member.email || null,
      avatarUrl: member.avatarUrl ? `${member.avatarUrl}/50.png` : null,
    },
    update: {
      name: member.fullName || member.username,
      email: member.email || null,
      avatarUrl: member.avatarUrl ? `${member.avatarUrl}/50.png` : null,
    },
  }
}

/**
 * Map Trello list to Sprint upsert args
 */
export function mapTrelloList(
  list: TrelloList,
  projectId: string
): Prisma.SprintUpsertArgs {
  const state = mapListToSprintState(list.name)

  return {
    where: { trelloListId: list.id },
    create: {
      trelloListId: list.id,
      name: list.name,
      state,
      projectId,
      // Trello lists don't have dates - leave null
      startDate: null,
      endDate: null,
    },
    update: {
      name: list.name,
      state,
    },
  }
}

/**
 * Map Trello card to Issue data
 * Returns the data object and assignee member ID (if any)
 */
export function mapTrelloCard(
  card: TrelloCard,
  listName: string
): {
  data: Omit<Prisma.IssueCreateInput, 'sprint' | 'developer' | 'epic'>
  assigneeMemberId: string | null
} {
  const status = mapListToIssueStatus(listName)
  const issueType = mapLabelToIssueType(card.labels)

  // Trello doesn't have native story points
  // Could use a Power-Up custom field or estimate from card position
  const points = 0

  return {
    data: {
      trelloCardId: card.id,
      title: card.name,
      points,
      issueType,
      status,
      wasReturned: false,
      resolvedAt: status === 'DONE' && card.due ? new Date(card.due) : null,
    },
    assigneeMemberId: card.idMembers.length > 0 ? card.idMembers[0]! : null,
  }
}
