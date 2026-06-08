'use client'

import { Badge } from '@/components/ui/badge'
import { Bell, Mail, MessageSquare, Smartphone, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  getNotificationChannels,
  getNotificationSettings,
  updateNotificationSetting,
  type NotificationChannel,
  type NotificationSetting as ApiNotificationSetting,
} from '@/lib/api/notifications'

type Channel = 'email' | 'slack' | 'inApp'

type NotificationTemplate = {
  event: string
  category: string
  description: string
}

const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // Projects
  { event: 'project.created', category: 'Projects', description: 'When a new project is created' },
  { event: 'project.health.warning', category: 'Projects', description: 'When a project health status becomes "at risk"' },
  { event: 'project.health.critical', category: 'Projects', description: 'When a project health status becomes "critical"' },
  { event: 'project.budget.exceeded', category: 'Projects', description: 'When project budget consumption exceeds 100%' },

  // Sprints
  { event: 'sprint.started', category: 'Sprints', description: 'When a new sprint starts' },
  { event: 'sprint.completed', category: 'Sprints', description: 'When a sprint is completed' },
  { event: 'sprint.burndown.warning', category: 'Sprints', description: 'When sprint is falling behind schedule' },

  // Pull Requests
  { event: 'pr.opened', category: 'Pull Requests', description: 'When a new pull request is opened' },
  { event: 'pr.review.requested', category: 'Pull Requests', description: 'When a PR review is requested from you' },
  { event: 'pr.merged', category: 'Pull Requests', description: 'When a pull request is merged' },
  { event: 'pr.stale', category: 'Pull Requests', description: 'When a PR has been open for more than 7 days' },

  // Team
  { event: 'member.added', category: 'Team', description: 'When a new team member joins' },
  { event: 'member.removed', category: 'Team', description: 'When a team member is removed' },
  { event: 'role.changed', category: 'Team', description: 'When your role or permissions change' },

  // Financial
  { event: 'invoice.due', category: 'Financial', description: 'When an invoice payment is due' },
  { event: 'payment.failed', category: 'Financial', description: 'When a payment fails' },
]

export default function NotificationsSettingsPage() {
  const [channels, setChannels] = useState<NotificationChannel | null>(null)
  const [settings, setSettings] = useState<Map<string, ApiNotificationSetting>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [channelsData, settingsData] = await Promise.all([
        getNotificationChannels(),
        getNotificationSettings(),
      ])

      setChannels(channelsData)

      const settingsMap = new Map<string, ApiNotificationSetting>()
      settingsData.settings.forEach((setting: ApiNotificationSetting) => {
        settingsMap.set(setting.event, setting)
      })
      setSettings(settingsMap)
    } catch (error) {
      console.error('Failed to load notification settings:', error)
      alert('Failed to load notification settings')
    } finally {
      setLoading(false)
    }
  }

  const toggleChannel = async (event: string, channel: 'email' | 'slack' | 'inApp') => {
    const currentSetting = settings.get(event)
    const channelKey = `${channel}Enabled` as 'emailEnabled' | 'slackEnabled' | 'inAppEnabled'
    const newValue = !(currentSetting?.[channelKey] ?? false)

    try {
      const updated = await updateNotificationSetting(event, {
        [channelKey]: newValue,
      })

      setSettings((prev) => {
        const next = new Map(prev)
        next.set(event, updated)
        return next
      })
    } catch (error) {
      console.error('Failed to update notification setting:', error)
      alert('Failed to update notification preference')
    }
  }

  const categories = [...new Set(NOTIFICATION_TEMPLATES.map((s) => s.category))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Notifications</h1>
        <p className="text-sm text-ink-3">Configure how and when you want to be notified</p>
      </div>

      {/* Notification Channels */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Notification Channels
          </span>
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-ink">Email</span>
              {channels?.email && channels.emailVerified && (
                <Badge variant="success" className="text-xs ml-auto">Active</Badge>
              )}
            </div>
            <p className="text-xs text-ink-3">{channels?.email || 'Not configured'}</p>
          </div>

          <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-ink">Slack</span>
              {channels?.slackConnected && (
                <Badge variant="success" className="text-xs ml-auto">Connected</Badge>
              )}
            </div>
            <p className="text-xs text-ink-3">
              {channels?.slackChannelId || 'Not connected'}
            </p>
          </div>

          <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-ink">In-App</span>
              <Badge variant="success" className="text-xs ml-auto">Enabled</Badge>
            </div>
            <p className="text-xs text-ink-3">Dashboard notifications</p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Notification Preferences
          </span>
        </h2>

        {categories.map((category) => (
          <div key={category} className="mb-6 last:mb-0">
            <h3 className="text-sm font-semibold text-ink mb-3">{category}</h3>

            <div className="bg-bg-el-2 border border-rule rounded-sv overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[1fr_100px_100px_100px] gap-4 px-4 py-3 bg-bg-el-3 border-b border-rule">
                <div className="text-xs font-mono uppercase tracking-wider text-ink-3">Event</div>
                <div className="text-xs font-mono uppercase tracking-wider text-ink-3 text-center">Email</div>
                <div className="text-xs font-mono uppercase tracking-wider text-ink-3 text-center">Slack</div>
                <div className="text-xs font-mono uppercase tracking-wider text-ink-3 text-center">In-App</div>
              </div>

              {/* Rows */}
              {NOTIFICATION_TEMPLATES.filter((t) => t.category === category).map(
                (template, rowIndex, array) => {
                  const setting = settings.get(template.event)

                  return (
                    <div
                      key={template.event}
                      className={`grid grid-cols-[1fr_100px_100px_100px] gap-4 items-center px-4 py-3 ${
                        rowIndex !== array.length - 1 ? 'border-b border-rule' : ''
                      }`}
                    >
                      <div>
                        <div className="text-sm text-ink">{template.description}</div>
                        <div className="text-xs text-ink-3 font-mono">{template.event}</div>
                      </div>
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={setting?.emailEnabled ?? false}
                          onChange={() => toggleChannel(template.event, 'email')}
                          className="rounded"
                        />
                      </div>
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={setting?.slackEnabled ?? false}
                          onChange={() => toggleChannel(template.event, 'slack')}
                          className="rounded"
                        />
                      </div>
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={setting?.inAppEnabled ?? false}
                          onChange={() => toggleChannel(template.event, 'inApp')}
                          className="rounded"
                        />
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
