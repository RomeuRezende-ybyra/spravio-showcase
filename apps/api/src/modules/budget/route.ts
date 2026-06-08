import type { FastifyInstance } from 'fastify'
import { budgetService } from './service.js'
import { SetBudgetInput, SetRateInput, LogHoursInput } from './types.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError } from '../../lib/errors.js'

export default async function budgetRoutes(fastify: FastifyInstance) {
  // GET /projects/:projectId/budget
  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/budget',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const budget = await budgetService.getBudget(request.params.projectId)
        return reply.send({ success: true, data: budget })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // POST /projects/:projectId/budget — set/update budget (Owner/GP only)
  fastify.post<{ Params: { projectId: string } }>(
    '/projects/:projectId/budget',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const input = SetBudgetInput.parse(request.body)
        const budget = await budgetService.setBudget(request.params.projectId, input)
        return reply.status(201).send({ success: true, data: budget })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // PUT /projects/:projectId/developers/:devId/rate — set hourly rate (Owner only)
  fastify.put<{ Params: { projectId: string; devId: string } }>(
    '/projects/:projectId/developers/:devId/rate',
    { preHandler: requireAuth(['OWNER']) },
    async (request, reply) => {
      try {
        const input = SetRateInput.parse(request.body)
        const rate = await budgetService.setRate(request.params.projectId, request.params.devId, input)
        return reply.send({ success: true, data: rate })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // POST /projects/:projectId/sprints/:sprintId/hours — log hours manually
  fastify.post<{ Params: { projectId: string; sprintId: string } }>(
    '/projects/:projectId/sprints/:sprintId/hours',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const input = LogHoursInput.parse(request.body)
        const hours = await budgetService.logHours(
          request.params.projectId,
          request.params.sprintId,
          input,
        )
        return reply.status(201).send({ success: true, data: hours })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // GET /projects/:projectId/budget/rates — get all developer rates
  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/budget/rates',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const rates = await budgetService.getRates(request.params.projectId)
        return reply.send({ success: true, data: rates })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // GET /projects/:projectId/financials — full ProjectFinancials response
  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/financials',
    { preHandler: requireAuth() },
    async (request, reply) => {
      try {
        const financials = await budgetService.calculateFinancials(request.params.projectId)
        return reply.send({ success: true, data: financials })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
