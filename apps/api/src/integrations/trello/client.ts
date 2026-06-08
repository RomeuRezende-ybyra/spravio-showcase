import { env } from '../../config/env.js'

const BASE_URL = 'https://api.trello.com/1'

export function getTrelloCredentials(): { apiKey: string; token: string } {
  if (!env.TRELLO_API_KEY || !env.TRELLO_TOKEN) {
    throw new Error('Trello credentials not configured (TRELLO_API_KEY, TRELLO_TOKEN)')
  }
  return { apiKey: env.TRELLO_API_KEY, token: env.TRELLO_TOKEN }
}

export function isTrelloConfigured(): boolean {
  return !!(env.TRELLO_API_KEY && env.TRELLO_TOKEN)
}

export async function trelloRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { apiKey, token } = getTrelloCredentials()

  // Add auth query params
  const separator = path.includes('?') ? '&' : '?'
  const url = `${BASE_URL}${path}${separator}key=${apiKey}&token=${token}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Trello API error: ${response.status} ${response.statusText} - ${text}`)
  }

  return response.json() as Promise<T>
}
