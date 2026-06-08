import { api } from '../api'

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface NotificationSetting {
  id: string
  event: string
  emailEnabled: boolean
  slackEnabled: boolean
  inAppEnabled: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

export interface NotificationChannel {
  id: string
  email: string | null
  emailVerified: boolean
  slackWebhookUrl: string | null
  slackChannelId: string | null
  slackConnected: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

export interface UpdateNotificationSettingInput {
  emailEnabled?: boolean
  slackEnabled?: boolean
  inAppEnabled?: boolean
}

export interface UpdateNotificationChannelsInput {
  email?: string | null
  emailVerified?: boolean
  slackWebhookUrl?: string | null
  slackChannelId?: string | null
  slackConnected?: boolean
}

// ─── API FUNCTIONS ───────────────────────────────────────────────────────────

export async function getNotificationSettings() {
  const response = await api.get<{ settings: NotificationSetting[] }>('/notifications/settings')
  return response
}

export async function getNotificationSetting(event: string) {
  const response = await api.get<NotificationSetting>(`/notifications/settings/${event}`)
  return response
}

export async function updateNotificationSetting(
  event: string,
  data: UpdateNotificationSettingInput
) {
  const response = await api.put<NotificationSetting>(`/notifications/settings/${event}`, data)
  return response
}

export async function deleteNotificationSetting(event: string) {
  await api.delete(`/notifications/settings/${event}`)
}

export async function getNotificationChannels() {
  const response = await api.get<NotificationChannel>('/notifications/channels')
  return response
}

export async function updateNotificationChannels(data: UpdateNotificationChannelsInput) {
  const response = await api.put<NotificationChannel>('/notifications/channels', data)
  return response
}
