import type { FastifyInstance } from 'fastify'
import Redis from 'ioredis'
import { env } from '../config/env.js'
import os from 'node:os'

export default async function healthRoutes(fastify: FastifyInstance) {
  // Basic health check (fast, for load balancers)
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  })

  // Detailed health check (slower, includes all dependencies)
  fastify.get('/health/detailed', async (request, reply) => {
    const checks: Record<string, { status: string; message?: string; latency?: number }> = {}

    // Database check
    const dbStart = Date.now()
    try {
      await fastify.prisma.$queryRaw`SELECT 1`
      checks.database = {
        status: 'healthy',
        latency: Date.now() - dbStart,
      }
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }

    // Redis check
    const redisStart = Date.now()
    const redis = new Redis(env.REDIS_URL)
    try {
      await redis.ping()
      checks.redis = {
        status: 'healthy',
        latency: Date.now() - redisStart,
      }
    } catch (error) {
      checks.redis = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    } finally {
      await redis.quit()
    }

    // Memory check
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const memUsagePercent = (usedMem / totalMem) * 100

    checks.memory = {
      status: memUsagePercent > 90 ? 'warning' : 'healthy',
      message: `${memUsagePercent.toFixed(1)}% used (${Math.round(usedMem / 1024 / 1024 / 1024)}GB / ${Math.round(totalMem / 1024 / 1024 / 1024)}GB)`,
    }

    // Overall status
    const allHealthy = Object.values(checks).every((check) => check.status === 'healthy')
    const anyUnhealthy = Object.values(checks).some((check) => check.status === 'unhealthy')

    const overallStatus = anyUnhealthy ? 'unhealthy' : allHealthy ? 'healthy' : 'degraded'

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || 'unknown',
      environment: env.NODE_ENV,
      checks,
    }

    // Set HTTP status based on health
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503

    return reply.status(statusCode).send(response)
  })

  // Readiness check (for Kubernetes)
  fastify.get('/ready', async (request, reply) => {
    try {
      await fastify.prisma.$queryRaw`SELECT 1`
      return reply.send({ ready: true })
    } catch {
      return reply.status(503).send({ ready: false })
    }
  })

  // Liveness check (for Kubernetes)
  fastify.get('/live', async () => {
    return { alive: true }
  })
}
