import { describe, it, expect } from 'vitest'
import { sleep, safeJsonParse, toISODate } from './index.js'

describe('sleep', () => {
  it('resolves after given ms', async () => {
    const start = Date.now()
    await sleep(50)
    expect(Date.now() - start).toBeGreaterThanOrEqual(40)
  })
})

describe('safeJsonParse', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse<{ a: number }>('{"a":1}')).toEqual({ a: 1 })
  })

  it('returns null for invalid JSON', () => {
    expect(safeJsonParse('not json')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(safeJsonParse('')).toBeNull()
  })
})

describe('toISODate', () => {
  it('returns YYYY-MM-DD format', () => {
    const date = new Date('2026-04-04T15:30:00Z')
    expect(toISODate(date)).toBe('2026-04-04')
  })

  it('handles start of year', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    expect(toISODate(date)).toBe('2026-01-01')
  })
})
