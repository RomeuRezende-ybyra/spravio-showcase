'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface Sprint {
  id: string
  name: string
}

interface Developer {
  developerId: string
  name: string
}

export function LogHoursForm({
  projectId,
  sprints,
  developers,
}: {
  projectId: string
  sprints: Sprint[]
  developers: Developer[]
}) {
  const [sprintId, setSprintId] = useState(sprints[0]?.id ?? '')
  const [developerId, setDeveloperId] = useState(developers[0]?.developerId ?? '')
  const [hours, setHours] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sprintId || !developerId || !hours) return

    setSaving(true)
    setFeedback(null)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3010'}/projects/${projectId}/sprints/${sprintId}/hours`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            developerId,
            hoursLogged: parseFloat(hours),
            source: 'manual',
          }),
        },
      )
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? 'Failed to log hours')
      }
      setFeedback({ type: 'success', message: 'Hours logged successfully.' })
      setHours('')
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to log hours' })
    } finally {
      setSaving(false)
    }
  }

  if (sprints.length === 0 || developers.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Hours</CardTitle>
        <CardDescription>Manually enter hours worked per developer per sprint.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="sprint" className="block text-xs font-medium text-gray-700 mb-1">
              Sprint
            </label>
            <select
              id="sprint"
              value={sprintId}
              onChange={(e) => setSprintId(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="developer" className="block text-xs font-medium text-gray-700 mb-1">
              Developer
            </label>
            <select
              id="developer"
              value={developerId}
              onChange={(e) => setDeveloperId(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {developers.map((d) => (
                <option key={d.developerId} value={d.developerId}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="hours" className="block text-xs font-medium text-gray-700 mb-1">
              Hours
            </label>
            <input
              id="hours"
              type="number"
              step="0.5"
              min="0"
              placeholder="40"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <Button type="submit" disabled={saving || !hours}>
            {saving ? 'Saving...' : 'Log'}
          </Button>

          {feedback && (
            <span className={`text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {feedback.message}
            </span>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
