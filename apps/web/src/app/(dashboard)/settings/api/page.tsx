'use client'

import { Badge } from '@/components/ui/badge'
import { Key, Plus, Copy, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  getApiKeys,
  createApiKey,
  deleteApiKey,
  type ApiKey as ApiApiKey,
} from '@/lib/api/api-keys'

const AVAILABLE_SCOPES = [
  { id: 'read:projects', label: 'Read Projects', description: 'View project data' },
  { id: 'write:projects', label: 'Write Projects', description: 'Create and update projects' },
  { id: 'read:sprints', label: 'Read Sprints', description: 'View sprint data' },
  { id: 'read:developers', label: 'Read Developers', description: 'View developer metrics' },
  { id: 'read:prs', label: 'Read Pull Requests', description: 'View PR data' },
]

export default function APIKeysSettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState({
    name: '',
    scopes: [] as string[],
    expiresInDays: 365,
  })
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)

  useEffect(() => {
    loadApiKeys()
  }, [])

  async function loadApiKeys() {
    try {
      const data = await getApiKeys()
      setApiKeys(data.apiKeys)
    } catch (error) {
      console.error('Failed to load API keys:', error)
      alert('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateApiKey(e: React.FormEvent) {
    e.preventDefault()

    if (!newKey.name || newKey.scopes.length === 0) {
      alert('Please provide a name and select at least one scope')
      return
    }

    setCreating(true)
    try {
      const result = await createApiKey({
        name: newKey.name,
        scopes: newKey.scopes,
        expiresInDays: newKey.expiresInDays,
      })

      // Store the newly created full key to show once
      setNewlyCreatedKey(result.apiKey.key)

      setNewKey({ name: '', scopes: [], expiresInDays: 365 })
      await loadApiKeys()
    } catch (error) {
      console.error('Failed to create API key:', error)
      alert('Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteApiKey(id: string) {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.'))
      return

    try {
      await deleteApiKey(id)
      setApiKeys((prev) => prev.filter((k) => k.id !== id))
    } catch (error) {
      console.error('Failed to delete API key:', error)
      alert('Failed to delete API key')
    }
  }

  function toggleScope(scopeId: string) {
    setNewKey((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scopeId)
        ? prev.scopes.filter((s) => s !== scopeId)
        : [...prev.scopes, scopeId],
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard')
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
          <h1 className="text-2xl font-bold text-ink">API Keys</h1>
          <p className="text-sm text-ink-3">Manage API keys for programmatic access</p>
        </div>
      </div>

      {/* Newly Created Key Alert */}
      {newlyCreatedKey && (
        <div className="bg-good/10 border border-good/20 rounded-sv p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-good mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-good mb-2">
                API Key Created Successfully!
              </p>
              <p className="text-xs text-ink-3 mb-3">
                Copy this key now. For security reasons, it won't be shown again.
              </p>
              <div className="bg-bg-el-3 border border-rule rounded p-2 font-mono text-xs text-ink mb-2 break-all">
                {newlyCreatedKey}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey)}
                  className="px-3 py-1.5 bg-good text-white rounded-sv hover:bg-good/90 transition-colors text-xs font-medium flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy Key
                </button>
                <button
                  onClick={() => setNewlyCreatedKey(null)}
                  className="px-3 py-1.5 bg-bg-el-2 border border-rule rounded-sv hover:bg-bg-el-3 transition-colors text-xs font-medium"
                >
                  I've saved it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Key className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Active API Keys ({apiKeys.length})
          </span>
        </h2>

        <div className="space-y-3">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-ink-3 text-sm">
              No API keys yet. Create one below.
            </div>
          ) : (
            apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="bg-bg-el-2 border border-rule rounded-sv p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-ink">{apiKey.name}</h3>
                      <div className="flex items-center gap-1 flex-wrap">
                        {apiKey.scopes.map((scope) => (
                          <Badge key={scope} variant="muted" className="text-xs px-1.5 py-0.5">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-ink-3">
                      Created {new Date(apiKey.createdAt).toLocaleDateString()} · Last used{' '}
                      {getRelativeTime(apiKey.lastUsedAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(apiKey.key)}
                      className="p-2 hover:bg-bg-el-3 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4 text-ink-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                      className="p-2 hover:bg-bad/10 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-bad" />
                    </button>
                  </div>
                </div>

                <div className="bg-bg-el-3 border border-rule rounded p-2 font-mono text-xs text-ink">
                  {apiKey.key}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create New Key Form */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Create New API Key
          </span>
        </h2>

        <form onSubmit={handleCreateApiKey} className="space-y-4">
          <div>
            <label className="text-xs text-ink-3 block mb-1">Key Name</label>
            <input
              type="text"
              value={newKey.name}
              onChange={(e) => setNewKey((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Production API, Development, CI/CD"
              required
              className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs text-ink-3 block mb-2">
              Scopes ({newKey.scopes.length} selected)
            </label>
            <div className="space-y-2">
              {AVAILABLE_SCOPES.map((scope) => (
                <label
                  key={scope.id}
                  className="flex items-start gap-2 text-sm text-ink cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={newKey.scopes.includes(scope.id)}
                    onChange={() => toggleScope(scope.id)}
                    className="rounded mt-0.5"
                  />
                  <div>
                    <div className="font-medium">{scope.label}</div>
                    <div className="text-xs text-ink-3">{scope.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-ink-3 block mb-1">Expiration (days)</label>
            <input
              type="number"
              value={newKey.expiresInDays}
              onChange={(e) =>
                setNewKey((prev) => ({ ...prev, expiresInDays: parseInt(e.target.value) }))
              }
              min={1}
              max={365}
              className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-ink-3 mt-1">Key will expire after {newKey.expiresInDays} days</p>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2 bg-accent text-white rounded-sv hover:bg-accent/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
            Generate API Key
          </button>
        </form>
      </div>

      {/* Warning */}
      <div className="bg-warn/10 border border-warn/20 rounded-sv p-4">
        <div className="flex items-start gap-2">
          <Key className="h-4 w-4 text-warn mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warn mb-1">Keep your API keys secure</p>
            <p className="text-xs text-ink-3">
              API keys provide full access to your account. Never share them publicly or commit them to version control.
              Rotate keys regularly and revoke unused keys immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
