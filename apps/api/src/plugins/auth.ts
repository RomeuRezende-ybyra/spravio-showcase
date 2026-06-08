import fp from 'fastify-plugin'
import fjwt from '@fastify/jwt'
import { env } from '../config/env.js'
import type { UserSession } from '@spravio/types'

declare module 'fastify' {
  interface FastifyRequest {
    userSession: UserSession
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: UserSession
    user: UserSession
  }
}

export default fp(async (fastify) => {
  fastify.register(fjwt, {
    secret: env.JWT_SECRET,
  })
})
