import type { Prisma, SprintState, IssueType, IssueStatus } from '@prisma/client'
import type { MondayGroup, MondayItem, MondayUser, MondayColumnValue } from './types.js'

/**
 * Map Monday.com group title to SprintState
 */
export function mapGroupToSprintState(groupTitle: string): SprintState {
  const lower = groupTitle.toLowerCase()

  if (lower.includes('done') || lower.includes('complete') || lower.includes('finished') || lower.includes('closed')) {
    return 'CLOSED'
  }
  if (lower.includes('backlog') || lower.includes('upcoming') || lower.includes('future') || lower.includes('next') || lower.includes('later')) {
    return 'FUTURE'
  }

  return 'ACTIVE'
}

/**
 * Find status column value from item
 */
function findStatusColumn(columnValues: MondayColumnValue[]): string | null {
  const statusColumn = columnValues.find((cv) => cv.type === 'status' || cv.id === 'status')
  return statusColumn?.text ?? null
}

/**
 * Map Monday.com item status to IssueStatus
 */
export function mapItemToStatus(item: MondayItem): IssueStatus {
  const statusText = findStatusColumn(item.column_values)

  if (statusText) {
    const lower = statusText.toLowerCase()

    if (lower.includes('done') || lower.includes('complete') || lower.includes('finished')) {
      return 'DONE'
    }
    if (lower.includes('stuck') || lower.includes('blocked') || lower.includes('cancelled') || lower.includes('canceled')) {
      return 'CANCELLED'
    }
    if (lower.includes('review') || lower.includes('uat') || lower.includes('acceptance')) {
      return 'UAT'
    }
    if (lower.includes('test') || lower.includes('qa') || lower.includes('testing')) {
      return 'TEST'
    }
    if (lower.includes('working') || lower.includes('progress') || lower.includes('doing')) {
      return 'IN_PROGRESS'
    }
  }

  // Fallback: check group title
  const groupTitle = item.group.title.toLowerCase()
  if (groupTitle.includes('done') || groupTitle.includes('complete')) {
    return 'DONE'
  }
  if (groupTitle.includes('progress') || groupTitle.includes('doing')) {
    return 'IN_PROGRESS'
  }

  return 'TODO'
}

/**
 * Get issue type from column values (looking for tags/labels)
 */
export function getIssueTypeFromColumns(columnValues: MondayColumnValue[]): IssueType {
  // Look for a tags/label column
  const tagsColumn = columnValues.find((cv) => cv.type === 'tag' || cv.id === 'tags' || cv.id === 'label')

  if (tagsColumn?.text) {
    const lower = tagsColumn.text.toLowerCase()

    if (lower.includes('frontend') || lower.includes('ui') || lower.includes('ux') || lower.includes('web')) {
      return 'FRONTEND'
    }
    if (lower.includes('backend') || lower.includes('api') || lower.includes('server') || lower.includes('database')) {
      return 'BACKEND'
    }
    if (lower.includes('design') || lower.includes('figma') || lower.includes('mockup')) {
      return 'DESIGN'
    }
    if (lower.includes('devops') || lower.includes('infra') || lower.includes('deploy') || lower.includes('ci')) {
      return 'DEVOPS'
    }
  }

  return 'BACKEND'
}

/**
 * Get story points from column values
 */
export function getPointsFromColumns(columnValues: MondayColumnValue[]): number {
  // Look for common point column names
  const pointsColumn = columnValues.find((cv) => {
    const id = cv.id.toLowerCase()
    const title = cv.title.toLowerCase()
    return (
      id.includes('point') || id.includes('estimate') || id.includes('story') ||
      title.includes('point') || title.includes('estimate') || title.includes('story')
    )
  })

  if (pointsColumn?.text) {
    const parsed = parseFloat(pointsColumn.text)
    if (!isNaN(parsed)) {
      return Math.round(parsed)
    }
  }

  // Also check for numbers type columns with point-like names
  const numbersColumn = columnValues.find((cv) => {
    return cv.type === 'numbers' && (
      cv.id.toLowerCase().includes('point') ||
      cv.title.toLowerCase().includes('point') ||
      cv.id.toLowerCase().includes('estimate') ||
      cv.title.toLowerCase().includes('estimate')
    )
  })

  if (numbersColumn?.text) {
    const parsed = parseFloat(numbersColumn.text)
    if (!isNaN(parsed)) {
      return Math.round(parsed)
    }
  }

  return 0
}

/**
 * Map Monday.com user to Developer upsert args
 */
export function mapMondayUser(user: MondayUser): Prisma.DeveloperUpsertArgs {
  return {
    where: { mondayUserId: user.id },
    create: {
      mondayUserId: user.id,
      name: user.name,
      email: user.email || null,
      avatarUrl: user.photo_thumb || null,
    },
    update: {
      name: user.name,
      email: user.email || null,
      avatarUrl: user.photo_thumb || null,
    },
  }
}

/**
 * Map Monday.com group to Sprint upsert args
 */
export function mapMondayGroup(
  group: MondayGroup,
  projectId: string
): Prisma.SprintUpsertArgs {
  const state = mapGroupToSprintState(group.title)

  return {
    where: { mondayGroupId: group.id },
    create: {
      mondayGroupId: group.id,
      name: group.title,
      state,
      projectId,
      // Monday.com groups don't have dates by default
      startDate: null,
      endDate: null,
    },
    update: {
      name: group.title,
      state,
    },
  }
}

/**
 * Map Monday.com item to Issue data
 */
export function mapMondayItem(
  item: MondayItem
): {
  data: Omit<Prisma.IssueCreateInput, 'sprint' | 'developer' | 'epic'>
  assigneeId: string | null
  groupId: string
} {
  const status = mapItemToStatus(item)
  const issueType = getIssueTypeFromColumns(item.column_values)
  const points = getPointsFromColumns(item.column_values)

  // Get first subscriber as assignee
  const assignee = item.subscribers?.[0]

  return {
    data: {
      mondayItemId: item.id,
      title: item.name,
      points,
      issueType,
      status,
      wasReturned: false,
      resolvedAt: status === 'DONE' ? new Date(item.updated_at) : null,
    },
    assigneeId: assignee?.id ?? null,
    groupId: item.group.id,
  }
}
