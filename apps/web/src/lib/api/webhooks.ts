import { api } from '../api'

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface Webhook {
  id: string
  url: string
  events: string[]
  isActive: boolean
  successRate: number
  lastDeliveryAt: string | null
  createdAt: string
  totalDeliveries: number
}

export interface WebhookDelivery {
  id: string
  event: string
  payload: Record<string, unknown>
  statusCode: number | null
  success: boolean
  errorMessage: string | null
  responseTime: number | null
  createdAt: string
  webhookId: string
}

export interface CreateWebhookInput {
  url: string
  events: string[]
  secret?: string
}

export interface UpdateWebhookInput {
  url?: string
  events?: string[]
  secret?: string | null
  isActive?: boolean
}

export interface TestWebhookResult {
  success: boolean
  statusCode: number | null
  errorMessage: string | null
  responseTime: number | null
}

// ─── API FUNCTIONS ───────────────────────────────────────────────────────────

export async function getWebhooks() {
  const response = await api.get<{ webhooks: Webhook[] }>('/webhooks')
  return response
}

export async function getWebhook(id: string) {
  const response = await api.get<Webhook>(`/webhooks/${id}`)
  return response
}

export async function createWebhook(data: CreateWebhookInput) {
  const response = await api.post<Webhook>('/webhooks', data)
  return response
}

export async function updateWebhook(id: string, data: UpdateWebhookInput) {
  const response = await api.put<Webhook>(`/webhooks/${id}`, data)
  return response
}

export async function deleteWebhook(id: string) {
  await api.delete(`/webhooks/${id}`)
}

export async function testWebhook(id: string) {
  const response = await api.post<TestWebhookResult>(`/webhooks/${id}/test`)
  return response
}

export async function getWebhookDeliveries(id: string, limit = 50, offset = 0) {
  const response = await api.get<{
    deliveries: WebhookDelivery[]
    pagination: { total: number; limit: number; offset: number }
  }>(`/webhooks/${id}/deliveries?limit=${limit}&offset=${offset}`)
  return response
}
