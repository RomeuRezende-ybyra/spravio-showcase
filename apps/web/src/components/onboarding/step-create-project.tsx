'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface StepCreateProjectProps {
  source: 'jira' | 'azure'
  orgId: string
  onBack: () => void
  onComplete: () => void
  onSkip: () => void
}

export function StepCreateProject({ source, orgId, onBack, onComplete, onSkip }: StepCreateProjectProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    sourceKey: '',
    githubRepo: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        source,
        organizationId: orgId,
        githubRepo: formData.githubRepo || null,
      }

      // Only include source keys if provided
      if (formData.sourceKey) {
        if (source === 'jira') {
          payload.jiraProjectKey = formData.sourceKey
        } else {
          payload.azureProjectId = formData.sourceKey
        }
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? 'Failed to create project')
      }

      onComplete()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Create Your First Project</h2>
      <p className="mt-1 text-sm text-gray-500">
        Fill in the details to set up your project. You can also skip this and configure later in Settings.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Project Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="My Project"
          />
        </div>

        <div>
          <label htmlFor="sourceKey" className="block text-sm font-medium text-gray-700">
            {source === 'jira' ? 'Jira Project Key (optional)' : 'Azure Project ID (optional)'}
          </label>
          <input
            type="text"
            id="sourceKey"
            value={formData.sourceKey}
            onChange={(e) => setFormData({ ...formData, sourceKey: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder={source === 'jira' ? 'PROJ' : 'my-project'}
          />
          <p className="mt-1 text-xs text-gray-500">
            {source === 'jira'
              ? 'The key from your Jira project (e.g., PROJ, DEV, TEAM). You can configure this later.'
              : 'The Azure DevOps project name or ID. You can configure this later.'}
          </p>
        </div>

        <div>
          <label htmlFor="githubRepo" className="block text-sm font-medium text-gray-700">
            GitHub Repository (optional)
          </label>
          <input
            type="text"
            id="githubRepo"
            value={formData.githubRepo}
            onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="owner/repo"
          />
          <p className="mt-1 text-xs text-gray-500">
            Format: owner/repo (e.g., acme/my-app)
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="flex justify-between pt-2">
          <Button type="button" variant="ghost" onClick={onBack} disabled={loading}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onSkip} disabled={loading}>
              Skip for now
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
