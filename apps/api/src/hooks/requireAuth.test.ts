import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requireAuth } from './requireAuth.js'
import { AppError } from '../lib/errors.js'

function createMockRequest(session?: Record<string, unknown>, shouldFail = false) {
  return {
    jwtVerify: shouldFail
      ? vi.fn().mockRejectedValue(new Error('Invalid token'))
      : vi.fn().mockResolvedValue(undefined),
    user: session ?? {},
    userSession: undefined as unknown,
  }
}

function createMockReply() {
  return {} as never
}

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets userSession on valid token', async () => {
    const session = { userId: 'u1', orgRole: 'OWNER' }
    const request = createMockRequest(session)
    const handler = requireAuth()

    await handler(request as never, createMockReply())

    expect(request.jwtVerify).toHaveBeenCalled()
    expect(request.userSession).toEqual(session)
  })

  it('throws 401 on invalid token', async () => {
    const request = createMockRequest(undefined, true)
    const handler = requireAuth()

    await expect(handler(request as never, createMockReply())).rejects.toThrow(AppError)
    await expect(handler(request as never, createMockReply())).rejects.toMatchObject({
      statusCode: 401,
      code: 'UNAUTHORIZED',
    })
  })

  it('allows any role when no roles specified', async () => {
    const session = { userId: 'u1', orgRole: 'VIEWER' }
    const request = createMockRequest(session)
    const handler = requireAuth()

    await handler(request as never, createMockReply())

    expect(request.userSession).toEqual(session)
  })

  it('allows matching role', async () => {
    const session = { userId: 'u1', orgRole: 'OWNER' }
    const request = createMockRequest(session)
    const handler = requireAuth(['OWNER', 'PROJECT_MANAGER'])

    await handler(request as never, createMockReply())

    expect(request.userSession).toEqual(session)
  })

  it('throws 403 on insufficient role', async () => {
    const session = { userId: 'u1', orgRole: 'VIEWER' }
    const request = createMockRequest(session)
    const handler = requireAuth(['OWNER'])

    await expect(handler(request as never, createMockReply())).rejects.toThrow(AppError)
    await expect(handler(request as never, createMockReply())).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    })
  })
})
