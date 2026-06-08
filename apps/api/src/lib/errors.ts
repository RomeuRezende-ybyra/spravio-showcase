import type { FastifyReply } from 'fastify'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function sendError(reply: FastifyReply, error: unknown): void {
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined && { details: error.details }),
      },
    })
    return
  }

  if (error instanceof ZodError) {
    reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.flatten().fieldErrors,
      },
    })
    return
  }

  const message = error instanceof Error ? error.message : 'Internal server error'
  reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  })
}
