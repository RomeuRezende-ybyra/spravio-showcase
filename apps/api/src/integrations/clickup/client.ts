import { env } from '../../config/env.js'

const BASE_URL = 'https://api.clickup.com/api/v2'

export function getClickUpToken(): string {
  if (!env.CLICKUP_API_TOKEN) {
    throw new Error('ClickUp API token not configured (CLICKUP_API_TOKEN)')
  }
  return env.CLICKUP_API_TOKEN
}

export function isClickUpConfigured(): boolean {
  return !!env.CLICKUP_API_TOKEN
}

export async function clickupRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getClickUpToken()

  const url = `${BASE_URL}${path}`

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`ClickUp API error: ${response.status} ${response.statusText} - ${text}`)
  }

  return response.json() as Promise<T>
}
