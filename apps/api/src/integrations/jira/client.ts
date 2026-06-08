import pLimit from 'p-limit'
import { env } from '../../config/env.js'
import { AppError } from '../../lib/errors.js'

const limit = pLimit(10)

function getAuthHeaders(): Record<string, string> {
  if (!env.JIRA_BASE_URL || !env.JIRA_EMAIL || !env.JIRA_API_TOKEN) {
    throw new AppError(
      'JIRA_NOT_CONFIGURED',
      'Jira credentials are not configured. Set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN.',
      503,
    )
  }

  const token = Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`).toString('base64')

  return {
    'Authorization': `Basic ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
}

function buildUrl(path: string): string {
  const base = env.JIRA_BASE_URL!.replace(/\/+$/, '')
  return `${base}${path}`
}

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  return limit(async () => {
    const url = buildUrl(path)
    const headers = getAuthHeaders()

    const response = await fetch(url, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => 'No response body')
      throw new AppError(
        'JIRA_API_ERROR',
        `Jira API ${method} ${path} failed: ${response.status} ${response.statusText}`,
        response.status >= 500 ? 502 : response.status,
        { status: response.status, body: text },
      )
    }

    return response.json() as Promise<T>
  })
}

export const jiraClient = {
  get<T>(path: string): Promise<T> {
    return request<T>('GET', path)
  },

  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>('POST', path, body)
  },
}
