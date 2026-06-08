import { env } from '../../config/env.js'

const GRAPHQL_URL = 'https://api.monday.com/v2'

export function getMondayApiToken(): string {
  if (!env.MONDAY_API_TOKEN) {
    throw new Error('Monday.com API token not configured (MONDAY_API_TOKEN)')
  }
  return env.MONDAY_API_TOKEN
}

export function isMondayConfigured(): boolean {
  return !!env.MONDAY_API_TOKEN
}

export async function mondayGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = getMondayApiToken()

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Monday.com API error: ${response.status} ${response.statusText} - ${text}`)
  }

  const result = await response.json() as { errors?: Array<{ message: string }> }

  if (result.errors && result.errors.length > 0) {
    throw new Error(`Monday.com GraphQL error: ${result.errors.map((e) => e.message).join(', ')}`)
  }

  return result as T
}
