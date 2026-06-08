export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]!
}
