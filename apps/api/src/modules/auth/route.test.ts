import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import bcrypt from 'bcryptjs'

// ─── MOCK PRISMA (vi.hoisted runs before imports) ───────────────────────────

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  organization: { create: vi.fn() },
  organizationUser: { create: vi.fn() },
  $transaction: vi.fn(),
}))

vi.mock('../../lib/prisma.js', () => ({
  prisma: mockPrisma,
}))

import authRoutes from './route.js'

// ─── HELPERS ────────────────────────────────────────────────────────────────

let app: FastifyInstance

beforeAll(async () => {
  app = Fastify()
  app.register(fastifyJwt, { secret: 'test-secret' })
  app.register(authRoutes)
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── LOGIN TESTS ────────────────────────────────────────────────────────────

describe('POST /auth/login', () => {
  const hashedPassword = bcrypt.hashSync('correct-password', 12)

  it('returns 401 for non-existent user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'nobody@test.com', password: 'whatever' },
    })

    expect(res.statusCode).toBe(401)
    expect(res.json().error.code).toBe('INVALID_CREDENTIALS')
  })

  it('returns 401 for wrong password (bcrypt)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'test@spravio.dev',
      name: 'Test',
      avatarUrl: null,
      passwordHash: hashedPassword,
      organizations: [{ role: 'OWNER', organizationId: 'org1', organization: { id: 'org1' } }],
    })

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'test@spravio.dev', password: 'wrong-password' },
    })

    expect(res.statusCode).toBe(401)
  })

  it('returns token for correct password (bcrypt)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'test@spravio.dev',
      name: 'Test',
      avatarUrl: null,
      passwordHash: hashedPassword,
      organizations: [{ role: 'OWNER', organizationId: 'org1', organization: { id: 'org1' } }],
    })

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'test@spravio.dev', password: 'correct-password' },
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.success).toBe(true)
    expect(body.data.token).toBeDefined()
    expect(body.data.user.email).toBe('test@spravio.dev')
  })

  it('re-hashes plaintext password on successful login', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'test@spravio.dev',
      name: 'Test',
      avatarUrl: null,
      passwordHash: 'plaintext-pass',
      organizations: [{ role: 'OWNER', organizationId: 'org1', organization: { id: 'org1' } }],
    })
    mockPrisma.user.update.mockResolvedValue({})

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'test@spravio.dev', password: 'plaintext-pass' },
    })

    expect(res.statusCode).toBe(200)

    // Verify re-hash was triggered
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { passwordHash: expect.stringMatching(/^\$2[ab]\$/) },
    })
  })

  it('returns 400 for invalid input', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'not-an-email', password: '' },
    })

    expect(res.statusCode).toBe(400)
  })
})

// ─── REGISTER TESTS ─────────────────────────────────────────────────────────

describe('POST /auth/register', () => {
  it('creates user with bcrypt-hashed password', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const mockOrg = { id: 'org-new', name: 'Test Agency', slug: 'test-agency-abc123' }
    const mockUser = {
      id: 'u-new',
      email: 'new@test.com',
      name: 'New User',
      avatarUrl: null,
      passwordHash: '$2b$12$hash',
    }

    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      const tx = {
        organization: { create: vi.fn().mockResolvedValue(mockOrg) },
        user: { create: vi.fn().mockResolvedValue(mockUser) },
        organizationUser: { create: vi.fn().mockResolvedValue({}) },
      }
      return fn(tx as unknown as typeof mockPrisma)
    })

    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'New User',
        email: 'new@test.com',
        password: 'securepass123',
        agencyName: 'Test Agency',
      },
    })

    expect(res.statusCode).toBe(201)
    const body = res.json()
    expect(body.success).toBe(true)
    expect(body.data.token).toBeDefined()
  })

  it('rejects duplicate email', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' })

    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Dup User',
        email: 'existing@test.com',
        password: 'securepass123',
        agencyName: 'Some Agency',
      },
    })

    expect(res.statusCode).toBe(409)
    expect(res.json().error.code).toBe('EMAIL_EXISTS')
  })

  it('rejects password shorter than 8 characters', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Short Pass',
        email: 'short@test.com',
        password: '1234567',
        agencyName: 'Agency',
      },
    })

    expect(res.statusCode).toBe(400)
  })
})
