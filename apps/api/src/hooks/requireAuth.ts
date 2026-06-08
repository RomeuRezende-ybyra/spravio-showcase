import type { FastifyRequest, FastifyReply } from 'fastify'
import { AppError } from '../lib/errors.js'
import type { OrgRole } from '@spravio/types'

export function requireAuth(allowedRoles?: OrgRole[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401)
    }

    request.userSession = request.user

    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(request.userSession.orgRole)) {
        throw new AppError('FORBIDDEN', 'Insufficient permissions', 403)
      }
    }
  }
}
