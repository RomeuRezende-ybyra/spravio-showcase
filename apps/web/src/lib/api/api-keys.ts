import { api } from '../api'

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string
  name: string
  key: string // Masked, except on creation
  keyPrefix?: string
  scopes: string[]
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
}

export interface CreateApiKeyInput {
  name: string
  scopes: string[]
  expiresInDays?: number
}

export interface UpdateApiKeyInput {
  name?: string
  scopes?: string[]
}

// ─── API FUNCTIONS ───────────────────────────────────────────────────────────

export async function getApiKeys() {
  const response = await api.get<{ apiKeys: ApiKey[] }>('/api-keys')
  return response
}

export async function createApiKey(data: CreateApiKeyInput) {
  const response = await api.post<{ apiKey: ApiKey }>('/api-keys', data)
  return response
}

export async function updateApiKey(id: string, data: UpdateApiKeyInput) {
  const response = await api.put<ApiKey>(`/api-keys/${id}`, data)
  return response
}

export async function deleteApiKey(id: string) {
  await api.delete(`/api-keys/${id}`)
}
