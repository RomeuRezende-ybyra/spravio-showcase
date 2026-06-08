'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Topbar } from '@/components/layout/topbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { apiClient } from '@/lib/api/client'

interface OrganizationSettings {
  jiraBaseUrl: string | null
  jiraEmail: string | null
  jiraApiToken: string | null
  jiraCloudId: string | null
  azureOrganization: string | null
  azurePersonalAccessToken: string | null
  githubOrg: string | null
  githubToken: string | null
}

interface GitHubStatus {
  connected: boolean
  githubOrg: string | null
}

interface Project {
  id: string
  name: string
  source: string
  jiraProjectKey: string | null
  azureProjectId: string | null
  githubRepo: string | null
}

export default function IntegrationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [settings, setSettings] = useState<OrganizationSettings>({
    jiraBaseUrl: null,
    jiraEmail: null,
    jiraApiToken: null,
    jiraCloudId: null,
    azureOrganization: null,
    azurePersonalAccessToken: null,
    githubOrg: null,
    githubToken: null,
  })

  const [githubStatus, setGithubStatus] = useState<GitHubStatus>({ connected: false, githubOrg: null })
  const [disconnecting, setDisconnecting] = useState(false)

  const [projects, setProjects] = useState<Project[]>([])
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [projectEdits, setProjectEdits] = useState<Record<string, Partial<Project>>>({})

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const github = searchParams.get('github')
    if (github === 'connected') {
      showToast('success', 'GitHub connected', 'Your GitHub organization has been connected successfully.')
    } else if (github === 'error') {
      const message = searchParams.get('message') ?? 'Unknown error'
      showToast('error', 'GitHub connection failed', message)
    }
  }, [searchParams, showToast])

  const loadData = async () => {
    try {
      setLoading(true)
      const [settingsRes, projectsRes, ghStatusRes] = await Promise.all([
        fetch('/api/organizations/settings'),
        apiClient.projects.listMine(),
        fetch('/api/organizations/github/status'),
      ])

      if (settingsRes.ok) {
        const { data } = await settingsRes.json()
        if (data) {
          setSettings(data)
        }
      }

      if (ghStatusRes.ok) {
        const { data } = await ghStatusRes.json()
        if (data) {
          setGithubStatus(data)
        }
      }

      setProjects(projectsRes)
    } catch (err) {
      showToast('error', 'Failed to load data', err instanceof Error ? err.message : undefined)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)

      const res = await fetch('/api/organizations/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? 'Failed to save settings')
      }

      showToast('success', 'Settings saved', 'Organization settings updated successfully.')
    } catch (err) {
      showToast('error', 'Failed to save settings', err instanceof Error ? err.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  const handleGitHubConnect = () => {
    window.location.href = '/api/github/connect'
  }

  const handleGitHubDisconnect = async () => {
    try {
      setDisconnecting(true)

      const res = await fetch('/api/organizations/github/disconnect', {
        method: 'DELETE',
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? 'Failed to disconnect')
      }

      setGithubStatus({ connected: false, githubOrg: null })
      showToast('success', 'GitHub disconnected', 'GitHub integration has been removed.')
    } catch (err) {
      showToast('error', 'Failed to disconnect', err instanceof Error ? err.message : undefined)
    } finally {
      setDisconnecting(false)
    }
  }

  const handleUpdateProject = async (projectId: string) => {
    try {
      setSaving(true)

      const updates = projectEdits[projectId]
      if (!updates) return

      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? 'Failed to update project')
      }

      // Update local state
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
      )
      setEditingProject(null)
      setProjectEdits((prev) => {
        const newEdits = { ...prev }
        delete newEdits[projectId]
        return newEdits
      })

      showToast('success', 'Project updated', 'Project configuration saved successfully.')
      router.refresh()
    } catch (err) {
      showToast('error', 'Failed to update project', err instanceof Error ? err.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  const handleProjectFieldChange = (projectId: string, field: string, value: string) => {
    setProjectEdits((prev) => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [field]: value || null,
      },
    }))
  }

  if (loading) {
    return (
      <>
        <Topbar title="Integrations" subtitle="Configure your integrations" />
        <main className="flex-1 overflow-y-auto p-7">
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Topbar title="Integrations" subtitle="Configure Jira, Azure DevOps, and GitHub" />
      <main className="flex-1 overflow-y-auto p-7">
        <div className="max-w-4xl space-y-6">
          {/* GitHub Connection */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">GitHub</h2>
            <p className="text-sm text-gray-500 mb-4">
              Connect your GitHub organization to sync repositories, pull requests, and developer metrics.
            </p>

            {githubStatus.connected ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Connected</p>
                    <p className="text-xs text-green-700">
                      Organization: {githubStatus.githubOrg ?? 'Unknown'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGitHubDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              </div>
            ) : (
              <Button onClick={handleGitHubConnect}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                  <path d="M12 .3C5.4.3 0 5.7 0 12.3c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.8.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.7 18.6.3 12 .3z" />
                </svg>
                Connect with GitHub
              </Button>
            )}
          </Card>

          {/* Organization Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Organization Settings
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Configure credentials for your entire organization. These will be used to sync data from your tools.
            </p>

            <div className="space-y-6">
              {/* Jira */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Jira Cloud</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Base URL
                    </label>
                    <input
                      type="url"
                      value={settings.jiraBaseUrl ?? ''}
                      onChange={(e) =>
                        setSettings({ ...settings, jiraBaseUrl: e.target.value || null })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="https://your-domain.atlassian.net"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.jiraEmail ?? ''}
                      onChange={(e) =>
                        setSettings({ ...settings, jiraEmail: e.target.value || null })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      API Token
                    </label>
                    <input
                      type="password"
                      value={settings.jiraApiToken ?? ''}
                      onChange={(e) =>
                        setSettings({ ...settings, jiraApiToken: e.target.value || null })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="••••••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Cloud ID (optional)
                    </label>
                    <input
                      type="text"
                      value={settings.jiraCloudId ?? ''}
                      onChange={(e) =>
                        setSettings({ ...settings, jiraCloudId: e.target.value || null })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx"
                    />
                  </div>
                </div>
              </div>

              {/* Azure DevOps */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Azure DevOps</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={settings.azureOrganization ?? ''}
                      onChange={(e) =>
                        setSettings({ ...settings, azureOrganization: e.target.value || null })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="your-org-name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Personal Access Token
                    </label>
                    <input
                      type="password"
                      value={settings.azurePersonalAccessToken ?? ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          azurePersonalAccessToken: e.target.value || null,
                        })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </Card>

          {/* Projects Configuration */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Project Configuration
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Configure individual project connections. Click on a field to edit.
            </p>

            {projects.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No projects yet. Create a project to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => {
                  const isEditing = editingProject === project.id
                  const edits = projectEdits[project.id] || {}

                  return (
                    <div
                      key={project.id}
                      className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {project.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Source: {project.source === 'jira' ? 'Jira' : 'Azure DevOps'}
                          </p>
                        </div>
                        {!isEditing ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingProject(project.id)}
                          >
                            Edit
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingProject(null)
                                setProjectEdits((prev) => {
                                  const newEdits = { ...prev }
                                  delete newEdits[project.id]
                                  return newEdits
                                })
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateProject(project.id)}
                              disabled={saving}
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {project.source === 'jira' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Jira Project Key
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={
                                  edits.jiraProjectKey !== undefined
                                    ? edits.jiraProjectKey ?? ''
                                    : project.jiraProjectKey ?? ''
                                }
                                onChange={(e) =>
                                  handleProjectFieldChange(
                                    project.id,
                                    'jiraProjectKey',
                                    e.target.value
                                  )
                                }
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                placeholder="PROJ"
                              />
                            ) : (
                              <p className="text-sm text-gray-900">
                                {project.jiraProjectKey || (
                                  <span className="text-gray-400">Not configured</span>
                                )}
                              </p>
                            )}
                          </div>
                        )}

                        {project.source === 'azure' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Azure Project ID
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={
                                  edits.azureProjectId !== undefined
                                    ? edits.azureProjectId ?? ''
                                    : project.azureProjectId ?? ''
                                }
                                onChange={(e) =>
                                  handleProjectFieldChange(
                                    project.id,
                                    'azureProjectId',
                                    e.target.value
                                  )
                                }
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                placeholder="my-project"
                              />
                            ) : (
                              <p className="text-sm text-gray-900">
                                {project.azureProjectId || (
                                  <span className="text-gray-400">Not configured</span>
                                )}
                              </p>
                            )}
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            GitHub Repository
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={
                                edits.githubRepo !== undefined
                                  ? edits.githubRepo ?? ''
                                  : project.githubRepo ?? ''
                              }
                              onChange={(e) =>
                                handleProjectFieldChange(
                                  project.id,
                                  'githubRepo',
                                  e.target.value
                                )
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                              placeholder="owner/repo"
                            />
                          ) : (
                            <p className="text-sm text-gray-900">
                              {project.githubRepo || (
                                <span className="text-gray-400">Not configured</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </main>
    </>
  )
}
