import { api } from '../api'

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface UserSession {
  id: string
  sessionToken: string
  expires: string
  ipAddress: string | null
  userAgent: string | null
  device: string | null
  location: string | null
  lastActive: string
  createdAt: string
  userId: string
  isCurrent: boolean
}

export interface AuditLogEntry {
  id: string
  event: string
  ipAddress: string | null
  userAgent: string | null
  details: string | null
  createdAt: string
  userId: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

// ─── API FUNCTIONS ───────────────────────────────────────────────────────────

export async function getSessions() {
  const response = await api.get<{ sessions: UserSession[] }>('/security/sessions')
  return response
}

export async function revokeSession(sessionId: string) {
  await api.delete(`/security/sessions/${sessionId}`)
}

export async function revokeAllSessions() {
  const response = await api.delete<{ revokedCount: number }>('/security/sessions')
  return response
}

export async function getAuditLog(limit = 50, offset = 0) {
  const response = await api.get<{
    logs: AuditLogEntry[]
    pagination: { total: number; limit: number; offset: number }
  }>(`/security/audit-log?limit=${limit}&offset=${offset}`)
  return response
}

export async function changePassword(data: ChangePasswordInput) {
  const response = await api.post<{ success: boolean }>('/security/password', data)
  return response
}
