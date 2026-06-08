import fp from 'fastify-plugin'
import * as Sentry from '@sentry/node'
import { env } from '../config/env.js'

export default fp(async (fastify) => {
  if (!env.SENTRY_DSN_API || env.NODE_ENV === 'test') return

  Sentry.init({
    dsn: env.SENTRY_DSN_API,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Filter sensitive data before sending to Sentry
    beforeSend(event, _hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        const sanitizedHeaders: Record<string, string> = {}
        for (const [key, value] of Object.entries(event.request.headers)) {
          const lowerKey = key.toLowerCase()
          // Never send: authorization, cookie, api keys, secrets, tokens
          if (
            lowerKey.includes('auth') ||
            lowerKey.includes('token') ||
            lowerKey.includes('key') ||
            lowerKey.includes('secret') ||
            lowerKey.includes('cookie') ||
            lowerKey.includes('password')
          ) {
            sanitizedHeaders[key] = '[REDACTED]'
          } else {
            sanitizedHeaders[key] = value as string
          }
        }
        event.request.headers = sanitizedHeaders
      }

      // Remove sensitive data from request body
      if (event.request?.data) {
        const sanitizedData = sanitizeObject(event.request.data)
        event.request.data = sanitizedData
      }

      // Remove sensitive environment variables
      if (event.contexts?.runtime?.env) {
        const sanitizedEnv: Record<string, string> = {}
        for (const [key, value] of Object.entries(event.contexts.runtime.env)) {
          const lowerKey = key.toLowerCase()
          if (
            lowerKey.includes('secret') ||
            lowerKey.includes('key') ||
            lowerKey.includes('token') ||
            lowerKey.includes('password') ||
            lowerKey.includes('dsn')
          ) {
            sanitizedEnv[key] = '[REDACTED]'
          } else {
            sanitizedEnv[key] = value as string
          }
        }
        event.contexts.runtime.env = sanitizedEnv
      }

      return event
    },
  })

  // Helper to sanitize objects recursively
  function sanitizeObject(obj: unknown): unknown {
    if (typeof obj !== 'object' || obj === null) return obj
    if (Array.isArray(obj)) return obj.map(sanitizeObject)

    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase()
      if (
        lowerKey.includes('password') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('key') ||
        lowerKey.includes('auth')
      ) {
        sanitized[key] = '[REDACTED]'
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value)
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  }

  fastify.setErrorHandler((error, request, reply) => {
    Sentry.captureException(error, {
      contexts: {
        request: {
          method: request.method,
          url: request.url,
        },
      },
    })
    reply.send(error)
  })

  fastify.addHook('onClose', async () => {
    await Sentry.close(2000)
  })

  fastify.decorate('sentry', Sentry)
})

declare module 'fastify' {
  interface FastifyInstance {
    sentry?: typeof Sentry
  }
}
