import cors from '@fastify/cors'
import fp from 'fastify-plugin'
import { env } from '../config/env.js'

export default fp(async (fastify) => {
  const allowedOrigins = env.NODE_ENV === 'production'
    ? env.ALLOWED_ORIGINS
    : ['http://localhost:3011', 'http://localhost:3000', 'http://127.0.0.1:3011', 'http://127.0.0.1:3000']

  await fastify.register(cors, {
    origin: allowedOrigins,
    credentials: true,
  })

  fastify.log.info(
    {
      mode: env.NODE_ENV === 'production' ? 'restricted' : 'development',
      origins: allowedOrigins,
    },
    'CORS configured'
  )
})
