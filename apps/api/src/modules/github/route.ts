import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError } from '../../lib/errors.js'
import { githubService } from './service.js'
import { ConnectRepoInput } from './types.js'

export default async function githubRoutes(fastify: FastifyInstance) {
  // GET /github/repos - List repos accessible by the org's GitHub token
  fastify.get(
    '/github/repos',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const { orgId } = request.userSession
        const repos = await githubService.listRepos(orgId)
        return reply.send({ success: true, data: repos })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // POST /projects/:projectId/github/connect - Link repo to project
  fastify.post(
    '/projects/:projectId/github/connect',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const { orgId } = request.userSession
        const { projectId } = request.params as { projectId: string }
        const { repoFullName } = ConnectRepoInput.parse(request.body)

        await githubService.connectRepo(projectId, orgId, repoFullName)
        return reply.send({ success: true, data: { projectId, githubRepo: repoFullName } })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // DELETE /projects/:projectId/github/disconnect - Unlink repo from project
  fastify.delete(
    '/projects/:projectId/github/disconnect',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const { orgId } = request.userSession
        const { projectId } = request.params as { projectId: string }

        await githubService.disconnectRepo(projectId, orgId)
        return reply.send({ success: true, data: { projectId, githubRepo: null } })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
