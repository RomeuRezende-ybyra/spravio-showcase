import Fastify from 'fastify'
import { randomUUID } from 'node:crypto'
import { env } from './config/env.js'
import sentryPlugin from './plugins/sentry.js'
import corsPlugin from './plugins/cors.js'
import helmetPlugin from './plugins/helmet.js'
import rateLimitPlugin from './plugins/rate-limit.js'
import prismaPlugin from './plugins/prisma.js'
import authPlugin from './plugins/auth.js'
import healthRoutes from './routes/health.js'
import projectRoutes from './modules/projects/route.js'
import sprintRoutes from './modules/sprints/route.js'
import developerRoutes from './modules/developers/route.js'
import overviewRoutes from './modules/overview/route.js'
import pullRequestRoutes from './modules/pullrequests/route.js'
import authRoutes from './modules/auth/route.js'
import assignmentRoutes from './modules/assignments/route.js'
import billingRoutes, { billingWebhookRoute } from './modules/billing/route.js'
import { githubWebhookRoute } from './modules/github-webhook/route.js'
import portalRoutes from './modules/portal/route.js'
import reportRoutes from './modules/report/route.js'
import budgetRoutes from './modules/budget/route.js'
import slackConfigRoutes from './modules/slack-config/route.js'
import teamsConfigRoutes from './modules/teams-config/route.js'
import tempoConfigRoutes from './modules/tempo-config/route.js'
import clockifyConfigRoutes from './modules/clockify-config/route.js'
import forecastRoutes from './modules/forecast/route.js'
import organizationRoutes from './modules/organizations/route.js'
import githubRoutes from './modules/github/route.js'
import userRoutes from './modules/users/route.js'
import notificationsRoutes from './routes/notifications.js'
import securityRoutes from './routes/security.js'
import webhooksRoutes from './routes/webhooks.js'
import apiKeysRoutes from './routes/api-keys.js'

export function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV === 'production'
      ? {
          level: 'info',
          serializers: {
            req(req) {
              // Sanitize headers - NEVER log: authorization, cookie, x-api-key, etc.
              const sanitizedHeaders: Record<string, unknown> = {
                host: req.headers.host,
                'user-agent': req.headers['user-agent'],
                'x-request-id': req.headers['x-request-id'],
              }

              // Log content-type if present (useful for debugging)
              if (req.headers['content-type']) {
                sanitizedHeaders['content-type'] = req.headers['content-type']
              }

              return {
                method: req.method,
                url: req.url,
                headers: sanitizedHeaders,
                remoteAddress: req.ip,
              }
            },
            res(res) {
              return {
                statusCode: res.statusCode,
              }
            },
          },
        }
      : { level: 'debug' },
    // Generate request ID for tracing
    genReqId: (req) => {
      return req.headers['x-request-id']?.toString() || randomUUID()
    },
    // Request logging
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
  })

  // Plugins (sentry first for error capturing)
  app.register(sentryPlugin)
  app.register(corsPlugin)
  app.register(helmetPlugin)
  app.register(rateLimitPlugin)
  app.register(prismaPlugin)
  app.register(authPlugin)

  // Routes
  app.register(healthRoutes)
  app.register(authRoutes)
  app.register(userRoutes)
  app.register(organizationRoutes)
  app.register(githubRoutes)
  app.register(projectRoutes)
  app.register(sprintRoutes)
  app.register(developerRoutes)
  app.register(overviewRoutes)
  app.register(pullRequestRoutes)
  app.register(assignmentRoutes)
  app.register(billingRoutes)
  app.register(billingWebhookRoute) // Encapsulated: has its own raw body parser
  app.register(githubWebhookRoute) // Encapsulated: has its own raw body parser for HMAC
  app.register(portalRoutes)
  app.register(reportRoutes)
  app.register(budgetRoutes)
  app.register(slackConfigRoutes)
  app.register(teamsConfigRoutes)
  app.register(tempoConfigRoutes)
  app.register(clockifyConfigRoutes)
  app.register(forecastRoutes)
  app.register(notificationsRoutes)
  app.register(securityRoutes)
  app.register(webhooksRoutes)
  app.register(apiKeysRoutes)

  return app
}
