import { azureClient } from './client.js'
import { cache } from '../../lib/redis.js'
import type {
  AzureIteration,
  AzureWorkItem,
  AzureTeamMember,
  AzurePullRequest,
  AzureRepository,
  AzureIterationWorkItems,
  AzureListResponse,
  AzureWiqlResponse,
} from './types.js'

const CACHE_TTL = 300 // 5 minutes

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = await cache.get<T>(key)
  if (hit !== null) return hit

  const data = await fn()
  await cache.set(key, data, CACHE_TTL)
  return data
}

export async function getIterations(project: string): Promise<AzureIteration[]> {
  return cached(`azure:iterations:${project}`, async () => {
    const res = await azureClient.get<AzureListResponse<AzureIteration>>(
      `/${encodeURIComponent(project)}/_apis/work/teamsettings/iterations`,
    )
    return res.value
  })
}

export async function getIterationWorkItems(
  project: string,
  iterationId: string,
): Promise<AzureIterationWorkItems> {
  return cached(`azure:iteration-workitems:${project}:${iterationId}`, () =>
    azureClient.get<AzureIterationWorkItems>(
      `/${encodeURIComponent(project)}/_apis/work/teamsettings/iterations/${encodeURIComponent(iterationId)}/workitems`,
    ),
  )
}

export async function getWorkItems(project: string, ids: number[]): Promise<AzureWorkItem[]> {
  if (ids.length === 0) return []

  // Azure DevOps limits to 200 IDs per request
  const allItems: AzureWorkItem[] = []
  const batchSize = 200

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    const cacheKey = `azure:workitems:${project}:${batch.join(',')}`

    const items = await cached(cacheKey, () =>
      azureClient.get<AzureListResponse<AzureWorkItem>>(
        `/${encodeURIComponent(project)}/_apis/wit/workitems?ids=${batch.join(',')}&$expand=all`,
      ),
    )

    allItems.push(...items.value)
  }

  return allItems
}

export async function queryWorkItems(project: string, wiql: string): Promise<number[]> {
  const cacheKey = `azure:wiql:${Buffer.from(wiql).toString('base64').slice(0, 64)}`
  return cached(cacheKey, async () => {
    const res = await azureClient.post<AzureWiqlResponse>(
      `/${encodeURIComponent(project)}/_apis/wit/wiql`,
      { query: wiql },
    )
    return res.workItems.map((wi) => wi.id)
  })
}

export async function getTeamMembers(project: string): Promise<AzureTeamMember[]> {
  return cached(`azure:team:${project}`, async () => {
    const res = await azureClient.get<AzureListResponse<AzureTeamMember>>(
      `/_apis/projects/${encodeURIComponent(project)}/teams/${encodeURIComponent(project + ' Team')}/members`,
    )
    return res.value
  })
}

export async function getRepositories(project: string): Promise<AzureRepository[]> {
  return cached(`azure:repos:${project}`, async () => {
    const res = await azureClient.get<AzureListResponse<AzureRepository>>(
      `/${encodeURIComponent(project)}/_apis/git/repositories`,
    )
    return res.value
  })
}

export async function getPullRequests(
  project: string,
  repositoryId: string,
  status?: 'active' | 'completed' | 'abandoned' | 'all',
): Promise<AzurePullRequest[]> {
  const statusParam = status ? `&searchCriteria.status=${status}` : ''
  return cached(`azure:prs:${project}:${repositoryId}:${status ?? 'all'}`, async () => {
    const res = await azureClient.get<AzureListResponse<AzurePullRequest>>(
      `/${encodeURIComponent(project)}/_apis/git/repositories/${encodeURIComponent(repositoryId)}/pullrequests?$top=200${statusParam}`,
    )
    return res.value
  })
}

export async function discoverPointsField(_project: string): Promise<string> {
  // Azure DevOps uses standard fields for story points:
  // 'Microsoft.VSTS.Scheduling.StoryPoints' for User Stories
  // 'Microsoft.VSTS.Scheduling.Effort' for Tasks/Bugs
  // No discovery needed unlike Jira
  return 'Microsoft.VSTS.Scheduling.StoryPoints'
}
