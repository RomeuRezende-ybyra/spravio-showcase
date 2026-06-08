import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../hooks/requireAuth.js'
import { sendError } from '../lib/errors.js'
import { hash, compare } from 'bcryptjs'

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function createAuditLog(
  userId: string,
  event: string,
  ipAddress?: string,
  userAgent?: string,
  details?: string
) {
  await prisma.auditLog.create({
    data: {
      userId,
      event,
      ipAddress,
      userAgent,
      details,
    },
  })
}

function parseUserAgent(userAgent?: string): string {
  if (!userAgent) return 'Unknown Device'

  // Simple parsing - in production, use a library like ua-parser-js
  if (userAgent.includes('iPhone')) return 'Safari on iPhone'
  if (userAgent.includes('iPad')) return 'Safari on iPad'
  if (userAgent.includes('Android')) return 'Chrome on Android'
  if (userAgent.includes('Mac')) return 'Chrome on macOS'
  if (userAgent.includes('Windows')) return 'Chrome on Windows'
  if (userAgent.includes('Linux')) return 'Chrome on Linux'

  return 'Unknown Device'
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────

export default async function securityRoutes(fastify: FastifyInstance) {
  // GET /security/sessions - List active sessions
  fastify.get('/security/sessions', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession
        const currentIp = request.ip
        const currentUserAgent = request.headers['user-agent']

        const sessions = await prisma.session.findMany({
          where: {
            userId,
            expires: {
              gte: new Date(),
            },
          },
          orderBy: {
            lastActive: 'desc',
          },
        })

        // Mark current session based on IP and user agent
        const sessionsWithFlag = sessions.map((session) => ({
          ...session,
          isCurrent:
            session.ipAddress === currentIp && session.userAgent === currentUserAgent,
        }))

        return reply.send({ sessions: sessionsWithFlag })
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // DELETE /security/sessions/:sessionId - Revoke specific session
  fastify.delete<{ Params: { sessionId: string } }>(
    '/security/sessions/:sessionId',
    {
      preHandler: requireAuth(),
      handler: async (request, reply) => {
        try {
          const { userId } = request.userSession
          const { sessionId } = request.params

          // Delete the session
          await prisma.session.deleteMany({
            where: {
              id: sessionId,
              userId, // Ensure user can only delete their own sessions
            },
          })

          // Create audit log
          await createAuditLog(
            userId,
            'session_revoked',
            request.ip,
            request.headers['user-agent'],
            `Session ${sessionId} was revoked`
          )

          return reply.status(204).send()
        } catch (error) {
          return sendError(reply, error)
        }
      },
    }
  )

  // DELETE /security/sessions - Revoke all sessions except current
  fastify.delete('/security/sessions', {
    preHandler: requireAuth(),
    handler: async (request, reply) => {
      try {
        const { userId } = request.userSession
        const currentIp = request.ip
        const currentUserAgent = request.headers['user-agent']

        // Find all sessions except the one matching current IP and user agent
        const allSessions = await prisma.session.findMany({
          where: {
            userId,
            expires: {
              gte: new Date(),
            },
          },
        })

        // Filter out current session
        const sessionsToRevoke = allSessions.filter(
          (session) =>
            session.ipAddress !== currentIp || session.userAgent !== currentUserAgent
        )

        // Delete those sessions
        if (sessionsToRevoke.length > 0) {
          await prisma.session.deleteMany({
            where: {
              id: {
                in: sessionsToRevoke.map((s) => s.id),
              },
            },
          })
        }

        // Create audit log
        await createAuditLog(
          userId,
          'all_sessions_revoked',
          request.ip,
          request.headers['user-agent'],
          `${sessionsToRevoke.length} session(s) were revoked`
        )

        return reply.send({ revokedCount: sessionsToRevoke.length })
      } catch (error) {
        return sendError(reply, error)
      }
    },
  })

  // GET /security/audit-log - Get audit log entries
  fastify.get<{ Querystring: { limit?: string; offset?: string } }>(
    '/security/audit-log',
    {
      preHandler: requireAuth(),
      handler: async (request, reply) => {
        try {
          const { userId } = request.userSession
          const limit = parseInt(request.query.limit || '50')
          const offset = parseInt(request.query.offset || '0')

          const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
              where: { userId },
              orderBy: { createdAt: 'desc' },
              take: limit,
              skip: offset,
            }),
            prisma.auditLog.count({
              where: { userId },
            }),
          ])

          return reply.send({
            logs,
            pagination: {
              total,
              limit,
              offset,
            },
          })
        } catch (error) {
          return sendError(reply, error)
        }
      },
    }
  )

  // POST /security/password - Change password
  fastify.post<{ Body: z.infer<typeof changePasswordSchema> }>(
    '/security/password',
    {
      preHandler: requireAuth(),
      handler: async (request, reply) => {
        try {
          const { userId } = request.userSession
          const data = changePasswordSchema.parse(request.body)

          // Get user with password
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, passwordHash: true },
          })

          if (!user || !user.passwordHash) {
            return reply.status(400).send({
              error: 'Password authentication not available for this account',
            })
          }

          // Verify current password
          const isValid = await compare(data.currentPassword, user.passwordHash)
          if (!isValid) {
            return reply.status(400).send({
              error: 'Current password is incorrect',
            })
          }

          // Hash new password
          const newPasswordHash = await hash(data.newPassword, 10)

          // Update password
          await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
          })

          // Create audit log
          await createAuditLog(
            userId,
            'password_changed',
            request.ip,
            request.headers['user-agent'],
            'Password was changed successfully'
          )

          return reply.send({ success: true })
        } catch (error) {
          return sendError(reply, error)
        }
      },
    }
  )
}
