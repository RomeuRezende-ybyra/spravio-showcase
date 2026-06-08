import type { ClockifyTimeEntry } from './types.js'

/**
 * Parse ISO 8601 duration (PT1H30M) to hours.
 */
export function parseDurationToHours(duration: string): number {
  // Duration format: PT1H30M15S or PT2H or PT30M etc.
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  return hours + minutes / 60 + seconds / 3600
}

/**
 * Aggregate time entries by userId.
 * Returns a map of userId -> { totalHours, externalIds }
 */
export function aggregateEntriesByUser(
  entries: ClockifyTimeEntry[]
): Map<string, { totalHours: number; externalIds: string[] }> {
  const result = new Map<string, { totalHours: number; externalIds: string[] }>()

  for (const entry of entries) {
    const userId = entry.userId
    const hours = parseDurationToHours(entry.timeInterval.duration)

    const existing = result.get(userId)
    if (existing) {
      existing.totalHours += hours
      existing.externalIds.push(entry.id)
    } else {
      result.set(userId, {
        totalHours: hours,
        externalIds: [entry.id],
      })
    }
  }

  return result
}
