'use client'

import { Badge } from '@/components/ui/badge'
import {
  Webhook,
  Plus,
  Play,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  getWebhooks,
  createWebhook,
  deleteWebhook,
  testWebhook,
  type Webhook as ApiWebhook,
} from '@/lib/api/webhooks'

const AVAILABLE_EVENTS = [
  {
    category: 'Projects',
    events: [
      'project.created',
      'project.updated',
      'project.deleted',
      'project.health.warning',
      'project.health.critical',
    ],
  },
  { category: 'Sprints', events: ['sprint.started', 'sprint.completed', 'sprint.burndown.updated'] },
  {
    category: 'Pull Requests',
    events: ['pr.opened', 'pr.merged', 'pr.closed', 'pr.review.requested'],
  },
  { category: 'Team', events: ['member.added', 'member.removed', 'member.role.changed'] },
]

export default function WebhooksSettingsPage() {
  const [webhooks, setWebhooks] = useState<ApiWebhook[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: [] as string[],
    secret: '',
  })

  useEffect(() => {
    loadWebhooks()
  }, [])

  async function loadWebhooks() {
    try {
      const data = await getWebhooks()
      setWebhooks(data.webhooks)
    } catch (error) {
      console.error('Failed to load webhooks:', error)
      alert('Failed to load webhooks')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateWebhook(e: React.FormEvent) {
    e.preventDefault()

    if (!newWebhook.url || newWebhook.events.length === 0) {
      alert('Please provide URL and select at least one event')
      return
    }

    setCreating(true)
    try {
      await createWebhook({
        url: newWebhook.url,
        events: newWebhook.events,
        secret: newWebhook.secret || undefined,
      })

      setNewWebhook({ url: '', events: [], secret: '' })
      await loadWebhooks()
      alert('Webhook created successfully')
    } catch (error) {
      console.error('Failed to create webhook:', error)
      alert('Failed to create webhook')
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteWebhook(id: string) {
    if (!confirm('Are you sure you want to delete this webhook?')) return

    try {
      await deleteWebhook(id)
      setWebhooks((prev) => prev.filter((w) => w.id !== id))
    } catch (error) {
      console.error('Failed to delete webhook:', error)
      alert('Failed to delete webhook')
    }
  }

  async function handleTestWebhook(id: string) {
    try {
      const result = await testWebhook(id)

      if (result.success) {
        alert(
          `Test successful! Status: ${result.statusCode}, Response time: ${result.responseTime}ms`
        )
      } else {
        alert(`Test failed: ${result.errorMessage}`)
      }
    } catch (error) {
      console.error('Failed to test webhook:', error)
      alert('Failed to test webhook')
    }
  }

  function toggleEvent(event: string) {
    setNewWebhook((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }))
  }

  const getRelativeTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never'

    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Webhooks</h1>
          <p className="text-sm text-ink-3">Configure webhook endpoints to receive real-time events</p>
        </div>
        <button className="px-4 py-2 bg-accent text-white rounded-sv hover:bg-accent/90 transition-colors text-sm font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Webhook
        </button>
      </div>

      {/* Active Webhooks */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Webhook className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Active Webhooks ({webhooks.length})
          </span>
        </h2>

        <div className="space-y-3">
          {webhooks.length === 0 ? (
            <div className="text-center py-8 text-ink-3 text-sm">
              No webhooks configured. Create one below.
            </div>
          ) : (
            webhooks.map((webhook) => (
              <div key={webhook.id} className="bg-bg-el-2 border border-rule rounded-sv p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-mono text-ink">{webhook.url}</h3>
                      <Badge
                        variant={webhook.isActive ? 'success' : 'muted'}
                        className="text-xs"
                      >
                        {webhook.isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Disabled
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="text-xs text-ink-3 mb-2">
                      Created {new Date(webhook.createdAt).toLocaleDateString()} · Last
                      delivery {getRelativeTime(webhook.lastDeliveryAt)} · {webhook.totalDeliveries}{' '}
                      total
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {webhook.events.map((event) => (
                        <Badge
                          key={event}
                          variant="muted"
                          className="text-xs px-1.5 py-0.5 font-mono"
                        >
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <div className="text-xs text-ink-3">Success Rate</div>
                      <div
                        className={`text-sm font-bold ${
                          webhook.successRate >= 95
                            ? 'text-good'
                            : webhook.successRate >= 80
                            ? 'text-warn'
                            : 'text-bad'
                        }`}
                      >
                        {webhook.successRate}%
                      </div>
                    </div>
                    <button
                      onClick={() => handleTestWebhook(webhook.id)}
                      className="p-2 hover:bg-bg-el-3 rounded transition-colors"
                      title="Test"
                    >
                      <Play className="h-4 w-4 text-ink-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      className="p-2 hover:bg-bad/10 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-bad" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create New Webhook Form */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Create New Webhook
          </span>
        </h2>

        <form onSubmit={handleCreateWebhook} className="space-y-4">
          <div>
            <label className="text-xs text-ink-3 block mb-1">Endpoint URL</label>
            <input
              type="url"
              value={newWebhook.url}
              onChange={(e) => setNewWebhook((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="https://api.example.com/webhooks/spravio"
              required
              className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink placeholder:text-ink-3 font-mono focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs text-ink-3 block mb-2">
              Events to Subscribe ({newWebhook.events.length} selected)
            </label>
            <div className="space-y-3">
              {AVAILABLE_EVENTS.map((category) => (
                <div key={category.category}>
                  <div className="text-xs font-semibold text-ink mb-2">{category.category}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {category.events.map((event) => (
                      <label
                        key={event}
                        className="flex items-center gap-2 text-sm text-ink cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newWebhook.events.includes(event)}
                          onChange={() => toggleEvent(event)}
                          className="rounded"
                        />
                        <span className="font-mono text-xs">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-ink-3 block mb-1">Secret Key (optional)</label>
            <input
              type="password"
              value={newWebhook.secret}
              onChange={(e) => setNewWebhook((prev) => ({ ...prev, secret: e.target.value }))}
              placeholder="wh_secret_..."
              className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink placeholder:text-ink-3 font-mono focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-ink-3 mt-1">Used to verify webhook signatures (HMAC SHA-256)</p>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2 bg-accent text-white rounded-sv hover:bg-accent/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Webhook
          </button>
        </form>
      </div>

      {/* Recent Deliveries */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Recent Deliveries (Last 24h)
          </span>
        </h2>
        <div className="text-center py-12 text-ink-3">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Recent delivery logs will be available here</p>
        </div>
      </div>
    </div>
  )
}
