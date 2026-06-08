import Redis from 'ioredis'
import { env } from '../config/env.js'
import { safeJsonParse } from '@spravio/utils'

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000)
    return delay
  },
})

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message)
})

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key)
    if (!data) return null
    return safeJsonParse<T>(data)
  },

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    await redis.setex(key, ttlSeconds, JSON.stringify(value))
  },

  async del(key: string): Promise<void> {
    await redis.del(key)
  },

  async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  },
}
