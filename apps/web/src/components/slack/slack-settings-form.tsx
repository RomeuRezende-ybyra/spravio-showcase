'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface SlackConfig {
  id: string
  projectId: string
  webhookUrl: string | null
  channelId: string | null
  alertTypes: string[]
  isActive: boolean
}

const ALERT_OPTIONS = [
  { value: 'stale_pr', label: 'Stale PRs', description: 'Alert when pull requests are open > 24h (warning) or > 72h (critical)' },
  { value: 'budget', label: 'Budget', description: 'Alert when project budget consumption exceeds 80%' },
  { value: 'sprint_health', label: 'Sprint Health', description: 'Alert when sprint completion < 40% with < 3 days remaining' },
  { value: 'done_without_code', label: 'Done Without Code', description: 'Alert when cards are marked DONE with no linked PRs' },
] as const

export function SlackSettingsForm({
  projectId,
  initialConfig,
}: {
  projectId: string
  initialConfig: SlackConfig | null
}) {
  const [webhookUrl, setWebhookUrl] = useState(initialConfig?.webhookUrl ?? '')
  const [channelId, setChannelId] = useState(initialConfig?.channelId ?? '')
  const [alertTypes, setAlertTypes] = useState<string[]>(initialConfig?.alertTypes ?? [])
  const [isActive, setIsActive] = useState(initialConfig?.isActive ?? true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function toggleAlertType(value: string) {
    setAlertTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value],
    )
  }

  async function handleSave() {
    setSaving(true)
    setFeedback(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3010'}/projects/${projectId}/slack-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          webhookUrl: webhookUrl || null,
          channelId: channelId || null,
          alertTypes,
          isActive,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? 'Failed to save')
      }
      setFeedback({ type: 'success', message: 'Slack configuration saved.' })
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    setFeedback(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3010'}/projects/${projectId}/slack-config/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? 'Test failed')
      }
      setFeedback({ type: 'success', message: 'Test message sent to Slack!' })
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Test failed' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slack Notifications</CardTitle>
        <CardDescription>Configure Slack alerts for this project.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Enable toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            role="switch"
            aria-checked={isActive}
            tabIndex={0}
            onClick={() => setIsActive(!isActive)}
            onKeyDown={(e) => e.key === ' ' && setIsActive(!isActive)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${isActive ? 'bg-teal-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ${isActive ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">Enable Slack notifications</span>
        </label>

        {/* Webhook URL */}
        <div>
          <label htmlFor="webhookUrl" className="block text-xs font-medium text-gray-700 mb-1">
            Webhook URL
          </label>
          <input
            id="webhookUrl"
            type="url"
            placeholder="https://hooks.slack.com/services/T.../B.../xxx"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <p className="mt-1 text-[11px] text-gray-400">Incoming webhook URL from your Slack app.</p>
        </div>

        {/* Channel ID */}
        <div>
          <label htmlFor="channelId" className="block text-xs font-medium text-gray-700 mb-1">
            Channel ID <span className="text-gray-400 font-normal">(optional, for bot token mode)</span>
          </label>
          <input
            id="channelId"
            type="text"
            placeholder="#spravio-alerts or C01ABCDEFGH"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <p className="mt-1 text-[11px] text-gray-400">Used when SLACK_BOT_TOKEN is configured on the server.</p>
        </div>

        {/* Alert types */}
        <div>
          <span className="block text-xs font-medium text-gray-700 mb-2">Alert Types</span>
          <div className="space-y-2">
            {ALERT_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-start gap-3 cursor-pointer rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={alertTypes.includes(opt.value)}
                  onChange={() => toggleAlertType(opt.value)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                  <p className="text-[11px] text-gray-400">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`rounded-lg px-3 py-2 text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {feedback.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" onClick={handleTest} disabled={testing}>
            {testing ? 'Sending...' : 'Send Test'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
