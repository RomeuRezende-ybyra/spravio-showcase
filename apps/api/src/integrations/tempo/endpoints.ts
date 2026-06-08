import { createTempoClient } from './client.js'
import type { TempoWorklogsResponse, TempoWorklog } from './types.js'

/**
 * Fetch worklogs for a Jira project within a date range.
 * Handles pagination automatically.
 */
export async function getWorklogs(
  apiToken: string,
  projectKey: string,
  from: string, // YYYY-MM-DD
  to: string // YYYY-MM-DD
): Promise<TempoWorklog[]> {
  const client = createTempoClient(apiToken)
  const results: TempoWorklog[] = []
  let offset = 0
  const limit = 100

  while (true) {
    const response = await client.get<TempoWorklogsResponse>(
      `/worklogs?project=${encodeURIComponent(projectKey)}&from=${from}&to=${to}&offset=${offset}&limit=${limit}`
    )
    results.push(...response.results)

    if (response.results.length < limit) break
    offset += limit
  }

  return results
}

/**
 * Test connection by fetching a small amount of worklogs.
 * Throws if the token is invalid.
 */
export async function testConnection(apiToken: string): Promise<boolean> {
  const client = createTempoClient(apiToken)
  // Fetch today's worklogs with limit 1 to verify token works
  const today = new Date().toISOString().split('T')[0]
  await client.get<TempoWorklogsResponse>(
    `/worklogs?from=${today}&to=${today}&limit=1`
  )
  return true
}
