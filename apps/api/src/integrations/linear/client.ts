import { env } from '../../config/env.js'

const GRAPHQL_URL = 'https://api.linear.app/graphql'

export function getLinearApiKey(): string {
  if (!env.LINEAR_API_KEY) {
    throw new Error('Linear API key not configured (LINEAR_API_KEY)')
  }
  return env.LINEAR_API_KEY
}

export function isLinearConfigured(): boolean {
  return !!env.LINEAR_API_KEY
}

export async function linearGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const apiKey = getLinearApiKey()

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Linear API error: ${response.status} ${response.statusText} - ${text}`)
  }

  const result = await response.json() as { errors?: Array<{ message: string }> }

  if (result.errors && result.errors.length > 0) {
    throw new Error(`Linear GraphQL error: ${result.errors.map((e) => e.message).join(', ')}`)
  }

  return result as T
}
