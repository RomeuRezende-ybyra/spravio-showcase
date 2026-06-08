import type { Prisma, SprintState, IssueType, IssueStatus } from '@prisma/client'
import type { AsanaSection, AsanaTask, AsanaUser, AsanaTag } from './types.js'

/**
 * Map Asana section name to SprintState
 */
export function mapSectionToSprintState(sectionName: string): SprintState {
  const lower = sectionName.toLowerCase()

  if (lower.includes('done') || lower.includes('complete') || lower.includes('finished') || lower.includes('closed')) {
    return 'CLOSED'
  }
  if (lower.includes('backlog') || lower.includes('upcoming') || lower.includes('future') || lower.includes('next') || lower.includes('later')) {
    return 'FUTURE'
  }

  return 'ACTIVE'
}

/**
 * Map Asana task completion to IssueStatus
 */
export function mapTaskToStatus(task: AsanaTask, sectionName: string): IssueStatus {
  if (task.completed) {
    return 'DONE'
  }

  const lower = sectionName.toLowerCase()

  if (lower.includes('done') || lower.includes('complete')) {
    return 'DONE'
  }
  if (lower.includes('review') || lower.includes('uat') || lower.includes('acceptance')) {
    return 'UAT'
  }
  if (lower.includes('test') || lower.includes('qa') || lower.includes('testing')) {
    return 'TEST'
  }
  if (lower.includes('progress') || lower.includes('doing') || lower.includes('wip') || lower.includes('working') || lower.includes('in development')) {
    return 'IN_PROGRESS'
  }

  return 'TODO'
}

/**
 * Map Asana tags to IssueType
 */
export function mapTagsToIssueType(tags: AsanaTag[]): IssueType {
  if (!tags || tags.length === 0) return 'BACKEND'

  const tagNames = tags.map((t) => t.name.toLowerCase())

  if (tagNames.some((n) => n.includes('frontend') || n.includes('ui') || n.includes('ux') || n.includes('web') || n.includes('client'))) {
    return 'FRONTEND'
  }
  if (tagNames.some((n) => n.includes('backend') || n.includes('api') || n.includes('server') || n.includes('database') || n.includes('db'))) {
    return 'BACKEND'
  }
  if (tagNames.some((n) => n.includes('design') || n.includes('figma') || n.includes('mockup') || n.includes('visual'))) {
    return 'DESIGN'
  }
  if (tagNames.some((n) => n.includes('devops') || n.includes('infra') || n.includes('deploy') || n.includes('ci') || n.includes('cd') || n.includes('ops'))) {
    return 'DEVOPS'
  }

  return 'BACKEND'
}

/**
 * Get story points from custom fields
 */
export function getPointsFromCustomFields(task: AsanaTask): number {
  // Look for common story point field names
  const pointsField = task.custom_fields?.find((cf) => {
    const name = cf.name.toLowerCase()
    return name.includes('point') || name.includes('estimate') || name.includes('story')
  })

  if (pointsField?.number_value != null) {
    return Math.round(pointsField.number_value)
  }

  return 0
}

/**
 * Map Asana user to Developer upsert args
 */
export function mapAsanaUser(user: AsanaUser): Prisma.DeveloperUpsertArgs {
  return {
    where: { asanaUserId: user.gid },
    create: {
      asanaUserId: user.gid,
      name: user.name,
      email: user.email || null,
      avatarUrl: user.photo?.image_60x60 || null,
    },
    update: {
      name: user.name,
      email: user.email || null,
      avatarUrl: user.photo?.image_60x60 || null,
    },
  }
}

/**
 * Map Asana section to Sprint upsert args
 */
export function mapAsanaSection(
  section: AsanaSection,
  projectId: string
): Prisma.SprintUpsertArgs {
  const state = mapSectionToSprintState(section.name)

  return {
    where: { asanaSectionId: section.gid },
    create: {
      asanaSectionId: section.gid,
      name: section.name,
      state,
      projectId,
      // Asana sections don't have dates
      startDate: null,
      endDate: null,
    },
    update: {
      name: section.name,
      state,
    },
  }
}

/**
 * Map Asana task to Issue data
 */
export function mapAsanaTask(
  task: AsanaTask,
  sectionName: string
): {
  data: Omit<Prisma.IssueCreateInput, 'sprint' | 'developer' | 'epic'>
  assigneeGid: string | null
  sectionGid: string | null
} {
  const status = mapTaskToStatus(task, sectionName)
  const issueType = mapTagsToIssueType(task.tags)
  const points = getPointsFromCustomFields(task)

  // Find the section GID from memberships
  const membership = task.memberships?.find((m) => m.section)
  const sectionGid = membership?.section?.gid ?? null

  return {
    data: {
      asanaTaskId: task.gid,
      title: task.name,
      points,
      issueType,
      status,
      wasReturned: false,
      resolvedAt: task.completed && task.completed_at ? new Date(task.completed_at) : null,
    },
    assigneeGid: task.assignee?.gid ?? null,
    sectionGid,
  }
}
