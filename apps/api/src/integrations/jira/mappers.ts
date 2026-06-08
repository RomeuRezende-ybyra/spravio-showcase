import type { Prisma } from '@prisma/client'
import type { JiraProject, JiraSprint, JiraIssue, JiraUser } from './types.js'

type IssueType = 'BACKEND' | 'FRONTEND' | 'DESIGN' | 'DEVOPS'
type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'TEST' | 'UAT' | 'DONE' | 'CANCELLED'
type SprintState = 'FUTURE' | 'ACTIVE' | 'CLOSED'

export function mapJiraProject(raw: JiraProject, organizationId: string): Prisma.ProjectCreateInput {
  return {
    name: raw.name,
    jiraProjectKey: raw.key,
    organization: { connect: { id: organizationId } },
  }
}

export function mapJiraSprint(raw: JiraSprint, projectId: string): Prisma.SprintUpsertArgs {
  const stateMap: Record<string, SprintState> = {
    future: 'FUTURE',
    active: 'ACTIVE',
    closed: 'CLOSED',
  }

  const data = {
    name: raw.name,
    state: stateMap[raw.state] ?? 'ACTIVE',
    startDate: raw.startDate ? new Date(raw.startDate) : null,
    endDate: raw.endDate ? new Date(raw.endDate) : null,
    completeDate: raw.completeDate ? new Date(raw.completeDate) : null,
    project: { connect: { id: projectId } },
  }

  return {
    where: { jiraSprintId: raw.id },
    create: {
      jiraSprintId: raw.id,
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

function detectIssueType(issue: JiraIssue): IssueType {
  const labels = issue.fields.labels.map((l) => l.toLowerCase())
  const components = issue.fields.components.map((c) => c.name.toLowerCase())
  const all = [...labels, ...components]

  if (all.some((v) => v.includes('frontend') || v.includes('front-end') || v.includes('ui') || v.includes('ux'))) {
    return 'FRONTEND'
  }
  if (all.some((v) => v.includes('design'))) {
    return 'DESIGN'
  }
  if (all.some((v) => v.includes('devops') || v.includes('infra') || v.includes('ci/cd'))) {
    return 'DEVOPS'
  }
  return 'BACKEND'
}

function mapStatusCategory(issue: JiraIssue): IssueStatus {
  const statusName = issue.fields.status.name.toLowerCase()
  const categoryKey = issue.fields.status.statusCategory.key

  if (categoryKey === 'done') return 'DONE'
  if (statusName.includes('uat') || statusName.includes('acceptance')) return 'UAT'
  if (statusName.includes('test') || statusName.includes('review') || statusName.includes('qa')) return 'TEST'
  if (categoryKey === 'indeterminate') return 'IN_PROGRESS'
  if (statusName.includes('cancel')) return 'CANCELLED'
  return 'TODO'
}

export function mapJiraIssue(
  raw: JiraIssue,
  storyPointsFieldId: string | null,
): {
  data: {
    jiraIssueId: string
    jiraIssueKey: string
    title: string
    points: number
    issueType: IssueType
    status: IssueStatus
    resolvedAt: Date | null
  }
  assigneeAccountId: string | null
  epicKey: string | null
} {
  const points = storyPointsFieldId
    ? (raw.fields[storyPointsFieldId] as number | null | undefined) ?? 0
    : 0

  const epicKey = raw.fields.parent?.fields.issuetype.name === 'Epic'
    ? raw.fields.parent.key
    : null

  return {
    data: {
      jiraIssueId: raw.id,
      jiraIssueKey: raw.key,
      title: raw.fields.summary,
      points: Math.round(points),
      issueType: detectIssueType(raw),
      status: mapStatusCategory(raw),
      resolvedAt: raw.fields.resolutiondate ? new Date(raw.fields.resolutiondate) : null,
    },
    assigneeAccountId: raw.fields.assignee?.accountId ?? null,
    epicKey,
  }
}

export function mapJiraUser(raw: JiraUser): Prisma.DeveloperUpsertArgs {
  const data = {
    name: raw.displayName,
    email: raw.emailAddress ?? null,
    avatarUrl: raw.avatarUrls['48x48'] ?? raw.avatarUrls['32x32'] ?? null,
  }

  return {
    where: { jiraAccountId: raw.accountId },
    create: {
      jiraAccountId: raw.accountId,
      ...data,
    },
    update: data,
  }
}
