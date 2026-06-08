import type { FastifyRequest, FastifyReply } from 'fastify'
import { AppError } from '../lib/errors.js'

/**
 * Rate limiting middleware que limita por user ID (após autenticação)
 * Usa em combinação com rate limiting global para proteção em camadas
 *
 * @param maxRequests - Número máximo de requisições permitidas
 * @param timeWindowMinutes - Janela de tempo em minutos
 */
export function rateLimitByUser(maxRequests: number, timeWindowMinutes: number) {
  // Map para rastrear requisições por user ID
  const userRequestCounts = new Map<string, { count: number; resetAt: number }>()

  // Limpar contadores expirados a cada minuto
  setInterval(() => {
    const now = Date.now()
    for (const [userId, data] of userRequestCounts.entries()) {
      if (now > data.resetAt) {
        userRequestCounts.delete(userId)
      }
    }
  }, 60000) // 1 minuto

  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Só aplica rate limiting se usuário está autenticado
    if (!request.user?.userId) {
      return
    }

    const userId = request.user.userId
    const now = Date.now()
    const timeWindowMs = timeWindowMinutes * 60 * 1000

    const userData = userRequestCounts.get(userId)

    if (!userData || now > userData.resetAt) {
      // Primeira requisição ou janela expirou
      userRequestCounts.set(userId, {
        count: 1,
        resetAt: now + timeWindowMs,
      })
      return
    }

    // Incrementar contador
    userData.count++

    if (userData.count > maxRequests) {
      const retryAfter = Math.ceil((userData.resetAt - now) / 1000)
      reply.header('Retry-After', retryAfter.toString())
      throw new AppError(
        'RATE_LIMIT_EXCEEDED',
        `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        429
      )
    }
  }
}
