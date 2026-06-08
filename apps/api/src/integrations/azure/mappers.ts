import type { Prisma } from '@prisma/client'
import type { AzureIteration, AzureWorkItem, AzureTeamMember } from './types.js'

type IssueType = 'BACKEND' | 'FRONTEND' | 'DESIGN' | 'DEVOPS'
type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'TEST' | 'UAT' | 'DONE' | 'CANCELLED'
type SprintState = 'FUTURE' | 'ACTIVE' | 'CLOSED'

export function mapAzureIteration(raw: AzureIteration, projectId: string): Prisma.SprintUpsertArgs {
  const timeFrame = raw.attributes.timeFrame
  const stateMap: Record<string, SprintState> = {
    past: 'CLOSED',
    current: 'ACTIVE',
    future: 'FUTURE',
  }

  const data = {
    name: raw.name,
    state: stateMap[timeFrame ?? 'current'] ?? 'ACTIVE',
    startDate: raw.attributes.startDate ? new Date(raw.attributes.startDate) : null,
    endDate: raw.attributes.finishDate ? new Date(raw.attributes.finishDate) : null,
    completeDate: timeFrame === 'past' && raw.attributes.finishDate
      ? new Date(raw.attributes.finishDate)
      : null,
    project: { connect: { id: projectId } },
  }

  return {
    where: { azureIterationId: raw.id },
    create: {
      azureIterationId: raw.id,
      ...data,
    },
    update: {
      name: data.name,
      state: data.state,
      startDate: data.startDate,
      endDate: data.endDate,
      completeDate: data.completeDate,
    },
  }
}

function detectIssueType(workItem: AzureWorkItem): IssueType {
  const tags = (workItem.fields['System.Tags'] ?? '').toLowerCase().split(';').map((t) => t.trim())
  const areaPath = (workItem.fields['System.AreaPath'] ?? '').toLowerCase()
  const workItemType = workItem.fields['System.WorkItemType']
  const all = [...tags, areaPath]

  if (all.some((v) => v.includes('frontend') || v.includes('front-end') || v.includes('ui') || v.includes('ux'))) {
    return 'FRONTEND'
  }
  if (all.some((v) => v.includes('design'))) {
    return 'DESIGN'
  }
  if (all.some((v) => v.includes('devops') || v.includes('infra') || v.includes('ci/cd') || v.includes('pipeline'))) {
    return 'DEVOPS'
  }

  // Work item type mapping: Task defaults to BACKEND
  if (workItemType === 'Task' || workItemType === 'Bug') {
    return 'BACKEND'
  }

  // User Story / Story defaults to FRONTEND unless tags indicate otherwise
  if (workItemType === 'User Story' || workItemType === 'Story') {
    return 'FRONTEND'
  }

  return 'BACKEND'
}

function mapAzureStatus(workItem: AzureWorkItem): IssueStatus {
  const state = workItem.fields['System.State'].toLowerCase()

  if (state === 'done' || state === 'closed' || state === 'resolved') return 'DONE'
  if (state === 'removed') return 'CANCELLED'
  if (state.includes('uat') || state.includes('acceptance')) return 'UAT'
  if (state.includes('test') || state.includes('qa') || state.includes('review')) return 'TEST'
  if (state === 'active' || state === 'in progress' || state.includes('committed')) return 'IN_PROGRESS'
  if (state === 'new' || state === 'to do' || state === 'approved') return 'TODO'

  return 'TODO'
}

export function mapAzureWorkItem(raw: AzureWorkItem): {
  data: {
    azureWorkItemId: number
    title: string
    points: number
    issueType: IssueType
    status: IssueStatus
    resolvedAt: Date | null
  }
  assigneeUserId: string | null
  parentId: number | null
} {
  const points = raw.fields['Microsoft.VSTS.Scheduling.StoryPoints']
    ?? raw.fields['Microsoft.VSTS.Scheduling.Effort']
    ?? 0

  const resolvedDate = raw.fields['Microsoft.VSTS.Common.ResolvedDate']
    ?? raw.fields['Microsoft.VSTS.Common.ClosedDate']

  return {
    data: {
      azureWorkItemId: raw.id,
      title: raw.fields['System.Title'],
      points: Math.round(Number(points)),
      issueType: detectIssueType(raw),
      status: mapAzureStatus(raw),
      resolvedAt: resolvedDate ? new Date(resolvedDate) : null,
    },
    assigneeUserId: raw.fields['System.AssignedTo']?.id ?? null,
    parentId: raw.fields['System.Parent'] ?? null,
  }
}

export function mapAzureUser(member: AzureTeamMember): Prisma.DeveloperUpsertArgs {
  const identity = member.identity

  const data = {
    name: identity.displayName,
    email: identity.uniqueName ?? null,
    avatarUrl: identity.imageUrl ?? null,
  }

  return {
    where: { azureUserId: identity.id },
    create: {
      azureUserId: identity.id,
      ...data,
    },
    update: data,
  }
}
