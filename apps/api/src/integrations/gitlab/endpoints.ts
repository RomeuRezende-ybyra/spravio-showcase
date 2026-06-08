import { cache } from '../../lib/redis.js'
import { gitlabClient } from './client.js'
import type { GitLabMergeRequest, GitLabCommit, GitLabMember } from './types.js'

const CACHE_TTL = 300

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = await cache.get<T>(key)
  if (hit !== null) return hit

  const data = await fn()
  await cache.set(key, data, CACHE_TTL)
  return data
}

export async function getMergeRequests(
  projectPath: string,
  state: 'opened' | 'merged' | 'closed' | 'all' = 'all'
): Promise<GitLabMergeRequest[]> {
  const encoded = encodeURIComponent(projectPath)
  return cached(`gitlab:mrs:${projectPath}:${state}`, async () => {
    const results: GitLabMergeRequest[] = []
    let page = 1

    while (true) {
      const batch = await gitlabClient.get<GitLabMergeRequest[]>(
        `/projects/${encoded}/merge_requests?state=${state}&per_page=100&page=${page}`
      )
      results.push(...batch)
      if (batch.length < 100) break
      page++
    }

    return results
  })
}

export async function getCommits(projectPath: string, since?: Date): Promise<GitLabCommit[]> {
  const encoded = encodeURIComponent(projectPath)
  const sinceParam = since ? `&since=${since.toISOString()}` : ''

  return cached(`gitlab:commits:${projectPath}:${since?.toISOString() ?? 'all'}`, async () => {
    const results: GitLabCommit[] = []
    let page = 1

    while (true) {
      const batch = await gitlabClient.get<GitLabCommit[]>(
        `/projects/${encoded}/repository/commits?per_page=100&page=${page}${sinceParam}`
      )
      results.push(...batch)
      if (batch.length < 100) break
      page++
    }

    return results
  })
}

export async function getProjectMembers(projectPath: string): Promise<GitLabMember[]> {
  const encoded = encodeURIComponent(projectPath)
  return cached(`gitlab:members:${projectPath}`, async () => {
    const results: GitLabMember[] = []
    let page = 1

    while (true) {
      const batch = await gitlabClient.get<GitLabMember[]>(
        `/projects/${encoded}/members/all?per_page=100&page=${page}`
      )
      results.push(...batch)
      if (batch.length < 100) break
      page++
    }

    return results
  })
}
