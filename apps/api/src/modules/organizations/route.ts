import type { FastifyInstance } from 'fastify'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { organizationService } from './service.js'
import { UpdateOrganizationSettingsInput } from './types.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError, AppError } from '../../lib/errors.js'
import { secureToken, readToken } from '../../lib/secure-tokens.js'
import { prisma } from '../../lib/prisma.js'
import { env } from '../../config/env.js'

const GitHubConnectInput = z.object({
  accessToken: z.string().min(1),
})

export default async function organizationRoutes(fastify: FastifyInstance) {
  // GET /api/organizations/members - List org members (for dropdowns)
  fastify.get(
    '/organizations/members',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const { orgId } = request.userSession
        const members = await prisma.organizationUser.findMany({
          where: { organizationId: orgId },
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
          orderBy: { user: { name: 'asc' } },
        })
        const data = members.map((m) => ({
          id: m.user.id,
          name: m.user.name ?? m.user.email,
          email: m.user.email,
          avatarUrl: m.user.avatarUrl,
          role: m.role,
        }))
        return reply.send({ success: true, data })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // GET /api/organizations/settings - Get organization settings
  fastify.get(
    '/organizations/settings',
    { preHandler: requireAuth(['OWNER']) },
    async (request, reply) => {
      try {
        const { orgId } = request.userSession
        const settings = await organizationService.getSettings(orgId)
        return reply.send({ success: true, data: settings })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // PUT /api/organizations/settings - Update organization settings
  fastify.put(
    '/organizations/settings',
    { preHandler: requireAuth(['OWNER']) },
    async (request, reply) => {
      try {
        const { orgId } = request.userSession
        const input = UpdateOrganizationSettingsInput.parse(request.body)
        const settings = await organizationService.updateSettings(orgId, input)
        return reply.send({ success: true, data: settings })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // POST /organizations/github/connect - Store OAuth token for org
  fastify.post(
    '/organizations/github/connect',
    { preHandler: requireAuth(['OWNER']) },
    async (request, reply) => {
      try {
        const { orgId } = request.userSession
        const { accessToken } = GitHubConnectInput.parse(request.body)

        // Validate token against GitHub API
        const ghRes = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github+json',
          },
        })

        if (!ghRes.ok) {
          throw new AppError('INVALID_GITHUB_TOKEN', 'Invalid GitHub access token', 400)
        }

        // Get org info if available
        const orgsRes = await fetch('https://api.github.com/user/orgs', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github+json',
          },
        })

        let githubOrg: string | null = null
        if (orgsRes.ok) {
          const orgs = await orgsRes.json() as Array<{ login: string }>
          const firstOrg = orgs[0]
          if (firstOrg) {
            githubOrg = firstOrg.login
          }
        }

        // If no org found, use personal account login
        if (!githubOrg) {
          const ghUser = await ghRes.json() as { login: string }
          githubOrg = ghUser.login
        }

        // Store encrypted token
        await prisma.organizationSettings.upsert({
          where: { organizationId: orgId },
          create: {
            organizationId: orgId,
            githubToken: secureToken(accessToken),
            githubOrg,
          },
          update: {
            githubToken: secureToken(accessToken),
            githubOrg,
          },
        })

        // Auto-register webhook for the org (best-effort)
        try {
          const webhookSecret = randomBytes(32).toString('hex')
          const webhookUrl = `${env.ALLOWED_ORIGINS[0]?.replace(/:\d+$/, ':' + env.PORT) ?? 'https://api.spravio.io'}/webhooks/github`

          // Try org-level hook first, fall back to per-repo later
          if (githubOrg) {
            const hookRes = await fetch(`https://api.github.com/orgs/${githubOrg}/hooks`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
              },
              body: JSON.stringify({
                name: 'web',
                active: true,
                events: ['push', 'pull_request'],
                config: {
                  url: webhookUrl,
                  content_type: 'json',
                  secret: webhookSecret,
                },
              }),
            })

            let githubWebhookId: number | null = null
            if (hookRes.ok) {
              const hookData = await hookRes.json() as { id: number }
              githubWebhookId = hookData.id
            }

            await prisma.gitHubWebhookConfig.upsert({
              where: { organizationId: orgId },
              create: {
                organizationId: orgId,
                webhookSecret: secureToken(webhookSecret)!,
                githubWebhookId,
                events: ['push', 'pull_request'],
                isActive: hookRes.ok,
              },
              update: {
                webhookSecret: secureToken(webhookSecret)!,
                githubWebhookId,
                events: ['push', 'pull_request'],
                isActive: hookRes.ok,
              },
            })
          }
        } catch (webhookErr) {
          // Non-blocking — log and continue
          fastify.log.warn({ err: webhookErr }, 'Failed to register GitHub webhook')
        }

        return reply.send({
          success: true,
          data: { githubOrg, connected: true },
        })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // GET /organizations/github/status - Check connection status
  fastify.get(
    '/organizations/github/status',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const { orgId } = request.userSession

        const settings = await prisma.organizationSettings.findUnique({
          where: { organizationId: orgId },
          select: { githubToken: true, githubOrg: true },
        })

        if (!settings?.githubToken) {
          return reply.send({
            success: true,
            data: { connected: false, githubOrg: null },
          })
        }

        // Verify token is still valid
        const token = readToken(settings.githubToken)
        if (!token) {
          return reply.send({
            success: true,
            data: { connected: false, githubOrg: settings.githubOrg },
          })
        }

        const ghRes = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
          },
        })

        return reply.send({
          success: true,
          data: {
            connected: ghRes.ok,
            githubOrg: settings.githubOrg,
          },
        })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // DELETE /organizations/github/disconnect - Remove GitHub connection
  fastify.delete(
    '/organizations/github/disconnect',
    { preHandler: requireAuth(['OWNER']) },
    async (request, reply) => {
      try {
        const { orgId } = request.userSession

        await prisma.organizationSettings.update({
          where: { organizationId: orgId },
          data: {
            githubToken: null,
            githubOrg: null,
          },
        })

        return reply.send({ success: true, data: { connected: false } })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
