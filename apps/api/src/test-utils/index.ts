import { vi } from 'vitest'
import type { UserSession } from '@spravio/types'

// ─── PRISMA MOCK ────────────────────────────────────────────────────────────

export function createPrismaMock() {
  return {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    organization: {
      create: vi.fn(),
    },
    organizationUser: {
      create: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        organization: { create: vi.fn() },
        user: { create: vi.fn() },
        organizationUser: { create: vi.fn() },
      }),
    ),
  }
}

// ─── REDIS MOCK ─────────────────────────────────────────────────────────────

export function createRedisMock() {
  const store = new Map<string, string>()
  return {
    get: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    set: vi.fn((key: string, value: string) => {
      store.set(key, value)
      return Promise.resolve('OK')
    }),
    del: vi.fn((key: string) => {
      store.delete(key)
      return Promise.resolve(1)
    }),
    quit: vi.fn(),
  }
}

// ─── USER SESSION FIXTURES ──────────────────────────────────────────────────

export const mockOwnerSession: UserSession = {
  userId: 'user-owner-1',
  email: 'owner@spravio.dev',
  name: 'Alice Owner',
  avatarUrl: null,
  orgId: 'org-1',
  orgRole: 'OWNER',
}

export const mockPMSession: UserSession = {
  userId: 'user-pm-1',
  email: 'pm@spravio.dev',
  name: 'Bob Manager',
  avatarUrl: null,
  orgId: 'org-1',
  orgRole: 'PROJECT_MANAGER',
}

export const mockViewerSession: UserSession = {
  userId: 'user-viewer-1',
  email: 'viewer@spravio.dev',
  name: 'Carol Viewer',
  avatarUrl: null,
  orgId: 'org-1',
  orgRole: 'VIEWER',
}
