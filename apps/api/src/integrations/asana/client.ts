import { env } from '../../config/env.js'

const BASE_URL = 'https://app.asana.com/api/1.0'

export function getAsanaToken(): string {
  if (!env.ASANA_TOKEN) {
    throw new Error('Asana token not configured (ASANA_TOKEN)')
  }
  return env.ASANA_TOKEN
}

export function isAsanaConfigured(): boolean {
  return !!env.ASANA_TOKEN
}

export async function asanaRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAsanaToken()

  const url = `${BASE_URL}${path}`

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Asana API error: ${response.status} ${response.statusText} - ${text}`)
  }

  return response.json() as Promise<T>
}
