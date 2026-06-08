import { describe, it, expect } from 'vitest'
import {
  OrgRoleSchema,
  IssueStatusSchema,
  UserSessionSchema,
  ProjectSourceSchema,
  PlanIdSchema,
  SlackConfigInputSchema,
  ApiErrorSchema,
} from './index.js'

describe('OrgRoleSchema', () => {
  it('accepts valid roles', () => {
    expect(OrgRoleSchema.parse('OWNER')).toBe('OWNER')
    expect(OrgRoleSchema.parse('PROJECT_MANAGER')).toBe('PROJECT_MANAGER')
    expect(OrgRoleSchema.parse('VIEWER')).toBe('VIEWER')
  })

  it('rejects invalid role', () => {
    expect(() => OrgRoleSchema.parse('ADMIN')).toThrow()
  })
})

describe('IssueStatusSchema', () => {
  it('accepts all valid statuses', () => {
    const statuses = ['TODO', 'IN_PROGRESS', 'TEST', 'UAT', 'DONE', 'CANCELLED']
    for (const s of statuses) {
      expect(IssueStatusSchema.parse(s)).toBe(s)
    }
  })
})

describe('ProjectSourceSchema', () => {
  it('accepts all PM sources', () => {
    const sources = ['jira', 'azure', 'trello', 'clickup', 'linear', 'asana', 'monday']
    for (const s of sources) {
      expect(ProjectSourceSchema.parse(s)).toBe(s)
    }
  })

  it('rejects unknown source', () => {
    expect(() => ProjectSourceSchema.parse('notion')).toThrow()
  })
})

describe('UserSessionSchema', () => {
  it('validates a complete session', () => {
    const session = {
      userId: 'usr-1',
      email: 'test@spravio.dev',
      name: 'Test',
      avatarUrl: null,
      orgId: 'org-1',
      orgRole: 'OWNER',
    }
    expect(UserSessionSchema.parse(session)).toEqual(session)
  })

  it('rejects invalid email', () => {
    expect(() =>
      UserSessionSchema.parse({
        userId: 'usr-1',
        email: 'not-an-email',
        name: 'Test',
        avatarUrl: null,
        orgId: 'org-1',
        orgRole: 'OWNER',
      }),
    ).toThrow()
  })

  it('rejects missing orgRole', () => {
    expect(() =>
      UserSessionSchema.parse({
        userId: 'usr-1',
        email: 'test@spravio.dev',
        name: 'Test',
        avatarUrl: null,
        orgId: 'org-1',
      }),
    ).toThrow()
  })
})

describe('PlanIdSchema', () => {
  it('accepts all plan IDs', () => {
    expect(PlanIdSchema.parse('starter')).toBe('starter')
    expect(PlanIdSchema.parse('growth')).toBe('growth')
    expect(PlanIdSchema.parse('scale')).toBe('scale')
  })
})

describe('SlackConfigInputSchema', () => {
  it('accepts partial input', () => {
    const result = SlackConfigInputSchema.parse({ isActive: false })
    expect(result).toEqual({ isActive: false })
  })

  it('accepts full input', () => {
    const input = {
      webhookUrl: 'https://hooks.slack.com/test',
      channelId: 'C123',
      alertTypes: ['stale_pr', 'budget'],
      isActive: true,
    }
    expect(SlackConfigInputSchema.parse(input)).toEqual(input)
  })

  it('rejects invalid alert type', () => {
    expect(() =>
      SlackConfigInputSchema.parse({ alertTypes: ['invalid_type'] }),
    ).toThrow()
  })
})

describe('ApiErrorSchema', () => {
  it('validates error response shape', () => {
    const err = {
      success: false as const,
      error: { code: 'NOT_FOUND', message: 'Resource not found' },
    }
    expect(ApiErrorSchema.parse(err)).toEqual(err)
  })
})
