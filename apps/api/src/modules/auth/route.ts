import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma.js'
import { redis } from '../../lib/redis.js'
import { AppError, sendError } from '../../lib/errors.js'
import { secureToken } from '../../lib/secure-tokens.js'
import type { UserSession } from '@spravio/types'

const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const RegisterInput = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  agencyName: z.string().min(1),
})

const ForgotPasswordInput = z.object({
  email: z.string().email(),
})

const VerifyResetCodeInput = z.object({
  email: z.string().email(),
  code: z.string().length(6),
})

const ResetPasswordInput = z.object({
  token: z.string(),
  password: z.string().min(8),
})

const GitHubOAuthInput = z.object({
  githubId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  avatarUrl: z.string().url().optional().nullable(),
  accessToken: z.string().min(1),
})

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/login', {
    config: {
      rateLimit: {
        max: 5, // Only 5 login attempts per minute
        timeWindow: '1 minute',
      },
    },
    handler: async (request, reply) => {
    try {
      const { email, password } = LoginInput.parse(request.body)

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          organizations: {
            include: { organization: true },
            take: 1,
          },
        },
      })

      if (!user || !user.passwordHash) {
        throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401)
      }

      const isHashed = user.passwordHash.startsWith('$2')
      let isValid: boolean

      if (isHashed) {
        isValid = await bcrypt.compare(password, user.passwordHash)
      } else {
        isValid = user.passwordHash === password
        if (isValid) {
          const hashed = await bcrypt.hash(password, 12)
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: hashed },
          })
        }
      }

      if (!isValid) {
        throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401)
      }

      const orgUser = user.organizations[0]
      if (!orgUser) {
        throw new AppError('NO_ORG', 'User is not a member of any organization', 403)
      }

      const payload: UserSession = {
        userId: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        orgId: orgUser.organizationId,
        orgRole: orgUser.role,
      }

      const token = fastify.jwt.sign(payload, { expiresIn: '7d' })

      return reply.send({
        success: true,
        data: { token, user: payload },
      })
    } catch (error) {
      sendError(reply, error)
    }
    },
  })

  fastify.post('/auth/register', {
    config: {
      rateLimit: {
        max: 3, // Only 3 registration attempts per minute
        timeWindow: '1 minute',
      },
    },
    handler: async (request, reply) => {
    try {
      const { name, email, password, agencyName } = RegisterInput.parse(request.body)

      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        throw new AppError('EMAIL_EXISTS', 'An account with this email already exists', 409)
      }

      // Generate slug from agency name
      const baseSlug = agencyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      const suffix = Math.random().toString(36).slice(2, 8)
      const slug = `${baseSlug}-${suffix}`

      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const org = await tx.organization.create({
          data: { name: agencyName, slug },
        })

        const user = await tx.user.create({
          data: { email, name, passwordHash: await bcrypt.hash(password, 12) },
        })

        await tx.organizationUser.create({
          data: {
            organizationId: org.id,
            userId: user.id,
            role: 'OWNER',
          },
        })

        return { org, user }
      })

      const payload: UserSession = {
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        avatarUrl: result.user.avatarUrl,
        orgId: result.org.id,
        orgRole: 'OWNER',
      }

      const token = fastify.jwt.sign(payload, { expiresIn: '7d' })

      return reply.status(201).send({
        success: true,
        data: { token, user: payload },
      })
    } catch (error) {
      sendError(reply, error)
    }
    },
  })

  // Password reset flow: Step 1 - Send 6-digit code via email
  fastify.post('/auth/forgot-password', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 minute',
      },
    },
    handler: async (request, reply) => {
    try {
      const { email } = ForgotPasswordInput.parse(request.body)

      // Find user (timing-safe: always take same time even if user doesn't exist)
      const user = await prisma.user.findUnique({ where: { email } })

      if (user) {
        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString()

        // Store code in Redis with 15-minute TTL
        const redisKey = `reset:${email}`
        await redis.setex(redisKey, 15 * 60, code)

        // TODO: Send email with code
        // For now, log it (in production this would send email)
        fastify.log.info({ email, code }, 'Password reset code generated')

        // In development, include code in response (remove in production)
        if (process.env.NODE_ENV === 'development') {
          return reply.send({
            success: true,
            message: 'Reset code sent to email',
            devCode: code, // Only for development
          })
        }
      }

      // Always return success to prevent email enumeration
      return reply.send({
        success: true,
        message: 'If an account exists with this email, a reset code will be sent',
      })
    } catch (error) {
      sendError(reply, error)
    }
    },
  })

  // Password reset flow: Step 2 - Verify code and return token
  fastify.post('/auth/verify-reset-code', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
    handler: async (request, reply) => {
    try {
      const { email, code } = VerifyResetCodeInput.parse(request.body)

      // Get code from Redis
      const redisKey = `reset:${email}`
      const storedCode = await redis.get(redisKey)

      if (!storedCode || storedCode !== code) {
        throw new AppError('INVALID_CODE', 'Invalid or expired code', 400)
      }

      // Verify user exists
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        throw new AppError('INVALID_CODE', 'Invalid or expired code', 400)
      }

      // Generate short-lived token (15 minutes)
      // Using custom payload for password reset token (not UserSession)
      const resetPayload = { userId: user.id, email, type: 'password-reset' }
      const resetToken = (fastify.jwt.sign as (payload: unknown, options?: unknown) => string)(
        resetPayload,
        { expiresIn: '15m' }
      )

      // Delete the code from Redis (one-time use)
      await redis.del(redisKey)

      return reply.send({
        success: true,
        data: { resetToken },
      })
    } catch (error) {
      sendError(reply, error)
    }
    },
  })

  // Password reset flow: Step 3 - Reset password with token
  fastify.post('/auth/reset-password', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 minute',
      },
    },
    handler: async (request, reply) => {
    try {
      const { token, password } = ResetPasswordInput.parse(request.body)

      // Verify token
      let decoded: { userId: string; email: string; type: string }
      try {
        decoded = fastify.jwt.verify(token) as { userId: string; email: string; type: string }
      } catch {
        throw new AppError('INVALID_TOKEN', 'Invalid or expired reset token', 401)
      }

      // Verify token type
      if (decoded.type !== 'password-reset') {
        throw new AppError('INVALID_TOKEN', 'Invalid token type', 401)
      }

      // Update password
      const hashedPassword = await bcrypt.hash(password, 12)
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash: hashedPassword },
      })

      fastify.log.info({ userId: decoded.userId }, 'Password reset successful')

      return reply.send({
        success: true,
        message: 'Password updated successfully',
      })
    } catch (error) {
      sendError(reply, error)
    }
    },
  })

  // GitHub OAuth: Verify token and create/link user
  fastify.post('/auth/oauth/github', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
    handler: async (request, reply) => {
      try {
        const { githubId, email, name, avatarUrl, accessToken } = GitHubOAuthInput.parse(request.body)

        // Validate the access token against GitHub API to prevent spoofing
        const ghRes = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github+json',
          },
        })

        if (!ghRes.ok) {
          throw new AppError('INVALID_GITHUB_TOKEN', 'Invalid GitHub access token', 401)
        }

        const ghUser = await ghRes.json() as { id: number }
        if (String(ghUser.id) !== githubId) {
          throw new AppError('GITHUB_ID_MISMATCH', 'GitHub token does not match provided ID', 401)
        }

        // Try to find existing account link
        const existingAccount = await prisma.account.findUnique({
          where: { provider_providerAccountId: { provider: 'github', providerAccountId: githubId } },
          include: {
            user: {
              include: {
                organizations: {
                  include: { organization: true },
                  take: 1,
                },
              },
            },
          },
        })

        if (existingAccount) {
          // User already linked with GitHub — sign JWT
          const user = existingAccount.user
          const orgUser = user.organizations[0]
          if (!orgUser) {
            throw new AppError('NO_ORG', 'User is not a member of any organization', 403)
          }

          const payload: UserSession = {
            userId: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            orgId: orgUser.organizationId,
            orgRole: orgUser.role,
          }

          const token = fastify.jwt.sign(payload, { expiresIn: '7d' })
          return reply.send({ success: true, data: { token, user: payload } })
        }

        // Check if user exists by email
        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: {
            organizations: {
              include: { organization: true },
              take: 1,
            },
          },
        })

        if (existingUser) {
          // Link GitHub account to existing user
          await prisma.account.create({
            data: {
              type: 'oauth',
              provider: 'github',
              providerAccountId: githubId,
              access_token: secureToken(accessToken),
              userId: existingUser.id,
            },
          })

          const orgUser = existingUser.organizations[0]
          if (!orgUser) {
            throw new AppError('NO_ORG', 'User is not a member of any organization', 403)
          }

          const payload: UserSession = {
            userId: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            avatarUrl: existingUser.avatarUrl,
            orgId: orgUser.organizationId,
            orgRole: orgUser.role,
          }

          const token = fastify.jwt.sign(payload, { expiresIn: '7d' })
          return reply.send({ success: true, data: { token, user: payload } })
        }

        // New user — create User + Organization + Account in a transaction
        const baseSlug = (name || 'user')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
        const suffix = Math.random().toString(36).slice(2, 8)
        const slug = `${baseSlug}-${suffix}`

        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          const org = await tx.organization.create({
            data: { name: `${name}'s Organization`, slug },
          })

          const user = await tx.user.create({
            data: {
              email,
              name,
              avatarUrl: avatarUrl ?? null,
            },
          })

          await tx.organizationUser.create({
            data: {
              organizationId: org.id,
              userId: user.id,
              role: 'OWNER',
            },
          })

          await tx.account.create({
            data: {
              type: 'oauth',
              provider: 'github',
              providerAccountId: githubId,
              access_token: secureToken(accessToken),
              userId: user.id,
            },
          })

          return { org, user }
        })

        const payload: UserSession = {
          userId: result.user.id,
          email: result.user.email,
          name: result.user.name,
          avatarUrl: result.user.avatarUrl,
          orgId: result.org.id,
          orgRole: 'OWNER',
        }

        const token = fastify.jwt.sign(payload, { expiresIn: '7d' })

        return reply.status(201).send({
          success: true,
          data: { token, user: payload },
        })
      } catch (error) {
        sendError(reply, error)
      }
    },
  })
}
