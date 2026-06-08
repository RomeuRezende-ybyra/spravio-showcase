import type { FastifyInstance } from 'fastify'
import { projectService } from './service.js'
import { CreateProjectInput, UpdateProjectInput } from './types.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { requirePlanLimit } from '../../hooks/requirePlanLimit.js'
import { sendError } from '../../lib/errors.js'

export default async function projectRoutes(fastify: FastifyInstance) {
  // Scoped: OWNER sees all org projects, PM/VIEWER sees assigned only
  fastify.get(
    '/projects/mine',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const { orgRole, orgId, userId } = request.userSession
        const projects = orgRole === 'OWNER'
          ? await projectService.listByOrg(orgId)
          : await projectService.listByAssignment(userId)
        return reply.send({ success: true, data: projects })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  fastify.get('/projects', { preHandler: requireAuth() }, async (request, reply) => {
    try {
      const projects = await projectService.list()
      return reply.send({ success: true, data: projects })
    } catch (error) {
      sendError(reply, error)
    }
  })

  fastify.get<{ Params: { id: string } }>(
    '/projects/:id',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const project = await projectService.getById(request.params.id)
        return reply.send({ success: true, data: project })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  fastify.post('/projects', {
    preHandler: [requireAuth(['OWNER']), requirePlanLimit('projects')],
  }, async (request, reply) => {
    try {
      const input = CreateProjectInput.parse(request.body)
      const project = await projectService.create(input)
      return reply.status(201).send({ success: true, data: project })
    } catch (error) {
      sendError(reply, error)
    }
  })

  fastify.patch<{ Params: { id: string } }>(
    '/projects/:id',
    { preHandler: requireAuth(['OWNER']) },
    async (request, reply) => {
      try {
        const input = UpdateProjectInput.parse(request.body)
        const project = await projectService.update(request.params.id, input)
        return reply.send({ success: true, data: project })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  fastify.delete<{ Params: { id: string } }>(
    '/projects/:id',
    { preHandler: requireAuth(['OWNER']) },
    async (request, reply) => {
      try {
        await projectService.remove(request.params.id)
        return reply.send({ success: true, data: null })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
