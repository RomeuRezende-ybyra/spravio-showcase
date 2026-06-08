import { createClockifyClient } from './client.js'
import type { ClockifyTimeEntry, ClockifyUser } from './types.js'

/**
 * Fetch time entries for a workspace within a date range.
 * Handles pagination automatically.
 */
export async function getTimeEntries(
  apiKey: string,
  workspaceId: string,
  userId: string,
  start: string, // ISO datetime
  end: string // ISO datetime
): Promise<ClockifyTimeEntry[]> {
  const client = createClockifyClient(apiKey)
  const results: ClockifyTimeEntry[] = []
  let page = 1
  const pageSize = 100

  while (true) {
    const entries = await client.get<ClockifyTimeEntry[]>(
      `/workspaces/${workspaceId}/user/${userId}/time-entries?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&page=${page}&page-size=${pageSize}`
    )
    results.push(...entries)

    if (entries.length < pageSize) break
    page++
  }

  return results
}

/**
 * Fetch all users in a workspace.
 */
export async function getWorkspaceUsers(
  apiKey: string,
  workspaceId: string
): Promise<ClockifyUser[]> {
  const client = createClockifyClient(apiKey)
  return client.get<ClockifyUser[]>(`/workspaces/${workspaceId}/users`)
}

/**
 * Test connection by fetching the current user.
 */
export async function testConnection(apiKey: string): Promise<ClockifyUser> {
  const client = createClockifyClient(apiKey)
  return client.get<ClockifyUser>('/user')
}
