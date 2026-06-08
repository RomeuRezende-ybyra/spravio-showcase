/**
 * Demo mode utilities
 * PRODUCTION: Always returns false (no mock data)
 * DEVELOPMENT: Returns true (shows mock data for demos)
 */

// HARDCODED: Set to false for production VPS
const IS_PRODUCTION_VPS = true

export function isDemoMode(): boolean {
  if (IS_PRODUCTION_VPS) {
    return false
  }
  
  // In development, check environment variable
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return true
  }
  
  return false
}

export function getMockDataOrEmpty<T>(generateFn: () => T[]): T[] {
  if (isDemoMode()) {
    return generateFn()
  }
  return []
}
