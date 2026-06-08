import { jiraClient } from './client.js'
import { cache } from '../../lib/redis.js'
import type {
  JiraProject,
  JiraBoard,
  JiraSprint,
  JiraIssue,
  JiraUser,
  JiraField,
  JiraPaginatedResponse,
  JiraSearchResponse,
} from './types.js'

const CACHE_TTL = 300 // 5 minutes

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = await cache.get<T>(key)
  if (hit !== null) return hit

  const data = await fn()
  await cache.set(key, data, CACHE_TTL)
  return data
}

export async function getProjects(): Promise<JiraProject[]> {
  return cached('jira:projects', () =>
    jiraClient.get<JiraProject[]>('/rest/api/3/project'),
  )
}

export async function getBoard(projectKeyOrId: string): Promise<JiraBoard | null> {
  return cached(`jira:board:${projectKeyOrId}`, async () => {
    const res = await jiraClient.get<JiraPaginatedResponse<JiraBoard>>(
      `/rest/agile/1.0/board?projectKeyOrId=${encodeURIComponent(projectKeyOrId)}`,
    )
    return res.values[0] ?? null
  })
}

export async function getSprints(
  boardId: number,
  state?: 'future' | 'active' | 'closed',
): Promise<JiraSprint[]> {
  const stateParam = state ? `&state=${state}` : ''
  return cached(`jira:sprints:${boardId}:${state ?? 'all'}`, async () => {
    const allSprints: JiraSprint[] = []
    let startAt = 0
    let isLast = false

    while (!isLast) {
      const res = await jiraClient.get<JiraPaginatedResponse<JiraSprint>>(
        `/rest/agile/1.0/board/${boardId}/sprint?startAt=${startAt}&maxResults=50${stateParam}`,
      )
      allSprints.push(...res.values)
      isLast = res.isLast
      startAt += res.maxResults
    }

    return allSprints
  })
}

export async function getSprintIssues(sprintId: number): Promise<JiraIssue[]> {
  return cached(`jira:sprint-issues:${sprintId}`, async () => {
    const allIssues: JiraIssue[] = []
    let startAt = 0
    let total = Infinity

    while (startAt < total) {
      const res = await jiraClient.get<JiraSearchResponse>(
        `/rest/agile/1.0/sprint/${sprintId}/issue?startAt=${startAt}&maxResults=100&fields=summary,status,issuetype,assignee,labels,components,sprint,parent,resolution,resolutiondate,created,updated`,
      )
      allIssues.push(...res.issues)
      total = res.total
      startAt += res.maxResults
    }

    return allIssues
  })
}

export async function searchIssues(jql: string, maxResults = 100): Promise<JiraIssue[]> {
  const cacheKey = `jira:search:${Buffer.from(jql).toString('base64').slice(0, 64)}`
  return cached(cacheKey, async () => {
    const allIssues: JiraIssue[] = []
    let startAt = 0
    let total = Infinity

    while (startAt < total && allIssues.length < maxResults) {
      const batchSize = Math.min(100, maxResults - allIssues.length)
      const res = await jiraClient.post<JiraSearchResponse>('/rest/api/3/search', {
        jql,
        startAt,
        maxResults: batchSize,
        fields: [
          'summary', 'status', 'issuetype', 'assignee', 'labels',
          'components', 'sprint', 'parent', 'resolution', 'resolutiondate',
          'created', 'updated',
        ],
      })
      allIssues.push(...res.issues)
      total = res.total
      startAt += res.maxResults
    }

    return allIssues
  })
}

export async function getUsers(projectKey: string): Promise<JiraUser[]> {
  return cached(`jira:users:${projectKey}`, () =>
    jiraClient.get<JiraUser[]>(
      `/rest/api/3/user/assignable/search?project=${encodeURIComponent(projectKey)}&maxResults=200`,
    ),
  )
}

export async function getBacklog(boardId: number): Promise<JiraIssue[]> {
  return cached(`jira:backlog:${boardId}`, async () => {
    const allIssues: JiraIssue[] = []
    let startAt = 0
    let total = Infinity

    while (startAt < total) {
      const res = await jiraClient.get<JiraSearchResponse>(
        `/rest/agile/1.0/board/${boardId}/backlog?startAt=${startAt}&maxResults=100&fields=summary,status,issuetype,assignee,labels,components,sprint,parent,resolution,resolutiondate,created,updated`,
      )
      allIssues.push(...res.issues)
      total = res.total
      startAt += res.maxResults
    }

    return allIssues
  })
}

export async function discoverStoryPointsField(): Promise<string | null> {
  return cached('jira:story-points-field', async () => {
    const fields = await jiraClient.get<JiraField[]>('/rest/api/3/field')

    // Common names for the story points field
    const storyPointsField = fields.find((f) =>
      f.name.toLowerCase() === 'story points'
      || f.name.toLowerCase() === 'story point estimate'
      || f.schema?.custom === 'com.atlassian.jira.plugin.system.customfieldtypes:float',
    )

    return storyPointsField?.id ?? null
  })
}
