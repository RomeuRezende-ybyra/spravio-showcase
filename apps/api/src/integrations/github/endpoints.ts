import { githubClient } from './client.js'
import type { GithubClientOptions } from './client.js'
import { cache } from '../../lib/redis.js'
import type {
  GithubPullRequest,
  GithubCommit,
  GithubReview,
  GithubContributorStats,
} from './types.js'

const CACHE_TTL = 300 // 5 minutes

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = await cache.get<T>(key)
  if (hit !== null) return hit

  const data = await fn()
  await cache.set(key, data, CACHE_TTL)
  return data
}

export async function getPullRequests(
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'all',
  options?: GithubClientOptions,
): Promise<GithubPullRequest[]> {
  return cached(`github:prs:${owner}/${repo}:${state}`, async () => {
    const allPRs: GithubPullRequest[] = []
    let page = 1

    while (true) {
      const batch = await githubClient.get<GithubPullRequest[]>(
        `/repos/${owner}/${repo}/pulls?state=${state}&per_page=100&page=${page}&sort=updated&direction=desc`,
        options,
      )
      allPRs.push(...batch)

      if (batch.length < 100) break
      page++
    }

    return allPRs
  })
}

export async function getCommits(
  owner: string,
  repo: string,
  author?: string,
  since?: Date,
  options?: GithubClientOptions,
): Promise<GithubCommit[]> {
  const authorParam = author ? `&author=${encodeURIComponent(author)}` : ''
  const sinceParam = since ? `&since=${since.toISOString()}` : ''
  const cacheKey = `github:commits:${owner}/${repo}:${author ?? 'all'}`

  return cached(cacheKey, async () => {
    const allCommits: GithubCommit[] = []
    let page = 1

    while (true) {
      const batch = await githubClient.get<GithubCommit[]>(
        `/repos/${owner}/${repo}/commits?per_page=100&page=${page}${authorParam}${sinceParam}`,
        options,
      )
      allCommits.push(...batch)

      if (batch.length < 100) break
      page++
    }

    return allCommits
  })
}

export async function getPRReviews(
  owner: string,
  repo: string,
  prNumber: number,
  options?: GithubClientOptions,
): Promise<GithubReview[]> {
  return cached(`github:reviews:${owner}/${repo}:${prNumber}`, () =>
    githubClient.get<GithubReview[]>(
      `/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
      options,
    ),
  )
}

export async function getContributorStats(
  owner: string,
  repo: string,
  options?: GithubClientOptions,
): Promise<GithubContributorStats[]> {
  return cached(`github:stats:${owner}/${repo}`, async () => {
    const data = await githubClient.getWithRetry<GithubContributorStats[]>(
      `/repos/${owner}/${repo}/stats/contributors`,
      3,
      options,
    )
    return data ?? []
  })
}
