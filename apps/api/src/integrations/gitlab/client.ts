import pLimit from 'p-limit'
import { env } from '../../config/env.js'
import { AppError } from '../../lib/errors.js'

const limit = pLimit(10)

function getBaseUrl(): string {
  return env.GITLAB_URL || 'https://gitlab.com'
}

function getAuthHeaders(): Record<string, string> {
  if (!env.GITLAB_TOKEN) {
    throw new AppError('GITLAB_NOT_CONFIGURED', 'GitLab token not configured. Set GITLAB_TOKEN.', 503)
  }
  return { 'PRIVATE-TOKEN': env.GITLAB_TOKEN }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  return limit(async () => {
    const url = `${getBaseUrl()}/api/v4${path}`
    const response = await fetch(url, {
      method,
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after')
      throw new AppError(
        'GITLAB_RATE_LIMIT',
        `GitLab rate limit exceeded. Retry after ${retryAfter ?? 'unknown'} seconds.`,
        429
      )
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new AppError(
        'GITLAB_API_ERROR',
        `GitLab API ${method} ${path} failed: ${response.status} ${response.statusText}`,
        response.status >= 500 ? 502 : response.status,
        { status: response.status, body: text }
      )
    }

    return response.json() as Promise<T>
  })
}

export const gitlabClient = {
  get<T>(path: string): Promise<T> {
    return request<T>('GET', path)
  },

  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>('POST', path, body)
  },
}
