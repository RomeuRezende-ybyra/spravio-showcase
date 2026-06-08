import type { FastifyInstance } from 'fastify'
import { overviewService } from '../overview/service.js'
import { buildReportHtml } from './html.js'
import { requireAuth } from '../../hooks/requireAuth.js'
import { sendError } from '../../lib/errors.js'

export default async function reportRoutes(fastify: FastifyInstance) {
  // GET /projects/:projectId/report.pdf — returns HTML report (print to PDF)
  // Viewer role cannot export
  fastify.get<{ Params: { projectId: string } }>(
    '/projects/:projectId/report.pdf',
    { preHandler: requireAuth(['OWNER', 'PROJECT_MANAGER']) },
    async (request, reply) => {
      try {
        const overview = await overviewService.getOverview(request.params.projectId)
        const html = buildReportHtml(overview)

        return reply
          .header('Content-Type', 'text/html; charset=utf-8')
          .header('Content-Disposition', `inline; filename="${overview.project.name}-report.html"`)
          .send(html)
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
