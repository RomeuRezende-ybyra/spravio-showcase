import rateLimit from '@fastify/rate-limit'
import fp from 'fastify-plugin'
import { env } from '../config/env.js'
import Redis from 'ioredis'

export default fp(async (fastify) => {
  // Use Redis for distributed rate limiting in production
  const redis = env.NODE_ENV === 'production'
    ? new Redis(env.REDIS_URL)
    : undefined

  await fastify.register(rateLimit, {
    global: true,
    max: env.NODE_ENV === 'production' ? 100 : 1000, // 100 req/min in prod, 1000 in dev
    timeWindow: '1 minute',
    redis, // Use Redis store in production for distributed rate limiting
    nameSpace: 'spravio-rate-limit:',
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
    }),
    skipOnError: true, // Don't block requests if Redis fails
  })

  fastify.log.info(
    {
      max: env.NODE_ENV === 'production' ? 100 : 1000,
      timeWindow: '1 minute',
      store: redis ? 'Redis (distributed)' : 'Memory (local)',
    },
    'Rate limiting configured'
  )

  // Cleanup Redis connection on shutdown
  fastify.addHook('onClose', async () => {
    if (redis) {
      await redis.quit()
    }
  })
})

// Note: Type declaration for rateLimit config is already provided by @fastify/rate-limit
// No additional declaration needed
