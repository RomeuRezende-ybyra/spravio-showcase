import type { TempoWorklog } from './types.js'

/**
 * Aggregate worklogs by author accountId.
 * Returns a map of accountId -> { totalHours, externalIds }
 */
export function aggregateWorklogsByAuthor(
  worklogs: TempoWorklog[]
): Map<string, { totalHours: number; externalIds: string[] }> {
  const result = new Map<string, { totalHours: number; externalIds: string[] }>()

  for (const worklog of worklogs) {
    const accountId = worklog.author.accountId
    const hours = worklog.timeSpentSeconds / 3600

    const existing = result.get(accountId)
    if (existing) {
      existing.totalHours += hours
      existing.externalIds.push(String(worklog.tempoWorklogId))
    } else {
      result.set(accountId, {
        totalHours: hours,
        externalIds: [String(worklog.tempoWorklogId)],
      })
    }
  }

  return result
}

/**
 * Convert seconds to hours with 2 decimal precision.
 */
export function secondsToHours(seconds: number): number {
  return Math.round((seconds / 3600) * 100) / 100
}
