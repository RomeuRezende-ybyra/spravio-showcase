import type { FastifyInstance } from 'fastify'
import { pullRequestService } from './service.js'
import { syncQueue } from '../../jobs/queue.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError } from '../../lib/errors.js'
import { AppError } from '../../lib/errors.js'
import { prisma } from '../../lib/prisma.js'
import type { SyncGithubPayload } from '../../jobs/syncGithub.job.js'

export default async function pullRequestRoutes(fastify: FastifyInstance) {
  // GET /projects/:projectId/pullrequests
  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/pullrequests',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const prs = await pullRequestService.listByProject(request.params.projectId)
        return reply.send({ success: true, data: prs })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // GET /projects/:projectId/pullrequests/stats
  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/pullrequests/stats',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const stats = await pullRequestService.getStats(request.params.projectId)
        return reply.send({ success: true, data: stats })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // POST /projects/:projectId/sync/github
  fastify.post<{ Params: { projectId: string } }>(
    '/projects/:projectId/sync/github',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const project = await prisma.project.findUnique({
          where: { id: request.params.projectId },
        })

        if (!project) {
          throw new AppError('PROJECT_NOT_FOUND', 'Project not found', 404)
        }

        if (!project.githubRepo) {
          throw new AppError('GITHUB_NOT_CONNECTED', 'GitHub repository not configured', 400)
        }

        await syncQueue.add('sync-github', {
          projectId: project.id,
          githubRepo: project.githubRepo,
        } satisfies SyncGithubPayload)

        return reply.send({ success: true, data: { message: 'GitHub sync job enqueued' } })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
