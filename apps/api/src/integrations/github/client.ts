import pLimit from 'p-limit'
import { env } from '../../config/env.js'
import { AppError } from '../../lib/errors.js'

const limit = pLimit(10)

export interface GithubClientOptions {
  token?: string
}

function getAuthHeaders(token?: string): Record<string, string> {
  const effectiveToken = token ?? env.GITHUB_TOKEN

  if (!effectiveToken) {
    throw new AppError(
      'GITHUB_NOT_CONFIGURED',
      'GitHub token is not configured. Set GITHUB_TOKEN or connect via OAuth.',
      503,
    )
  }

  return {
    'Authorization': `Bearer ${effectiveToken}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

const BASE_URL = 'https://api.github.com'

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown, options?: GithubClientOptions): Promise<T> {
  return limit(async () => {
    const url = `${BASE_URL}${path}`
    const headers = getAuthHeaders(options?.token)

    const response = await fetch(url, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })

    // Handle rate limit
    if (response.status === 403) {
      const text = await response.text().catch(() => '')
      if (text.includes('rate limit')) {
        const resetAt = response.headers.get('x-ratelimit-reset')
        const resetDate = resetAt ? new Date(Number(resetAt) * 1000) : null
        throw new AppError(
          'GITHUB_RATE_LIMIT',
          `GitHub rate limit exceeded. Resets at ${resetDate?.toISOString() ?? 'unknown'}`,
          429,
        )
      }
    }

    if (!response.ok) {
      const text = await response.text().catch(() => 'No response body')
      throw new AppError(
        'GITHUB_API_ERROR',
        `GitHub API ${method} ${path} failed: ${response.status} ${response.statusText}`,
        response.status >= 500 ? 502 : response.status,
        { status: response.status, body: text },
      )
    }

    return response.json() as Promise<T>
  })
}

/** Handles GitHub 202 "computing" responses by retrying */
async function requestWithRetry<T>(method: 'GET' | 'POST', path: string, retries = 3, options?: GithubClientOptions): Promise<T | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await limit(async () => {
      const url = `${BASE_URL}${path}`
      const headers = getAuthHeaders(options?.token)

      return fetch(url, { method, headers })
    })

    if (response.status === 200) {
      return response.json() as Promise<T>
    }

    if (response.status === 202) {
      // GitHub is computing stats — wait and retry
      await new Promise((r) => setTimeout(r, 2000))
      continue
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new AppError(
        'GITHUB_API_ERROR',
        `GitHub API ${method} ${path} failed: ${response.status}`,
        response.status >= 500 ? 502 : response.status,
        { status: response.status, body: text },
      )
    }
  }

  return null
}

export const githubClient = {
  get<T>(path: string, options?: GithubClientOptions): Promise<T> {
    return request<T>('GET', path, undefined, options)
  },

  post<T>(path: string, body: unknown, options?: GithubClientOptions): Promise<T> {
    return request<T>('POST', path, body, options)
  },

  getWithRetry<T>(path: string, retries?: number, options?: GithubClientOptions): Promise<T | null> {
    return requestWithRetry<T>('GET', path, retries, options)
  },
}
