import { apiClient } from '@/lib/api/client'
import { SlackSettingsForm } from '@/components/slack/slack-settings-form'
import { Settings, Bell, Link2, AlertTriangle } from 'lucide-react'

export default async function SettingsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const [config, project] = await Promise.all([
    apiClient.slack.getConfig(projectId),
    apiClient.projects.getById(projectId),
  ])

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-5 w-5 text-accent" />
          <h1 className="text-lg font-semibold text-ink">Project Settings</h1>
        </div>
        <p className="text-sm text-ink-2">
          Configure integrations, notifications, and project-specific preferences.
        </p>
      </div>

      {/* General Settings */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-ink">General</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Project ID</span>
            <span className="text-sm text-ink font-mono">{project.id}</span>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Name</span>
            <span className="text-sm text-ink">{project.name}</span>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Source</span>
            <span className="text-sm text-ink capitalize">{project.source}</span>
          </div>

          {project.source === 'jira' && project.jiraProjectKey && (
            <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Jira Project</span>
              <span className="text-sm text-ink font-mono">{project.jiraProjectKey}</span>
            </div>
          )}

          {project.source === 'azure' && project.azureProjectId && (
            <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Azure Project</span>
              <span className="text-sm text-ink font-mono">{project.azureProjectId}</span>
            </div>
          )}

          {project.githubRepo && (
            <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-3">GitHub Repo</span>
              <span className="text-sm text-ink font-mono">{project.githubRepo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-ink">Integrations</h2>
        </div>

        <div className="space-y-6">
          {/* Slack Integration */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
                <span className="text-xs font-bold text-accent">SL</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-ink">Slack</h3>
                <p className="text-xs text-ink-3">Get notifications in Slack channels</p>
              </div>
            </div>
            <SlackSettingsForm projectId={projectId} initialConfig={config} />
          </div>

          {/* GitHub Integration */}
          <div className="pt-4 border-t border-rule">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
                <span className="text-xs font-bold text-accent">GH</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-ink">GitHub</h3>
                <p className="text-xs text-ink-3">
                  {project.githubRepo ? (
                    <>Connected to <span className="font-mono">{project.githubRepo}</span></>
                  ) : (
                    'Connect a repository to track pull requests and commits'
                  )}
                </p>
              </div>
            </div>
            {!project.githubRepo && (
              <div className="mt-3 rounded-sv bg-bg-el-2 border border-rule p-3">
                <p className="text-xs text-ink-3">
                  GitHub integration is configured at the organization level. Contact your admin to connect a repository.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-ink">Notifications</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-ink">Sprint completion alerts</p>
              <p className="text-xs text-ink-3">Get notified when sprints are completed</p>
            </div>
            <div className="px-2 py-1 rounded-sv bg-good/10 border border-good/20">
              <span className="text-xs font-medium text-good">Enabled</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-rule">
            <div>
              <p className="text-sm text-ink">Budget threshold warnings</p>
              <p className="text-xs text-ink-3">Alert when budget consumption reaches 80%</p>
            </div>
            <div className="px-2 py-1 rounded-sv bg-good/10 border border-good/20">
              <span className="text-xs font-medium text-good">Enabled</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-rule">
            <div>
              <p className="text-sm text-ink">Stale PR reminders</p>
              <p className="text-xs text-ink-3">Daily digest of pull requests older than 7 days</p>
            </div>
            <div className="px-2 py-1 rounded-sv bg-good/10 border border-good/20">
              <span className="text-xs font-medium text-good">Enabled</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-rule">
            <div>
              <p className="text-sm text-ink">Risk escalations</p>
              <p className="text-xs text-ink-3">Notify when new high-severity risks are identified</p>
            </div>
            <div className="px-2 py-1 rounded-sv bg-good/10 border border-good/20">
              <span className="text-xs font-medium text-good">Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-bg-el border border-bad/20 rounded-sv p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-bad" />
          <h2 className="text-sm font-semibold text-bad">Danger Zone</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 px-4 rounded-sv bg-bg-el-2 border border-rule">
            <div>
              <p className="text-sm font-medium text-ink">Archive project</p>
              <p className="text-xs text-ink-3">
                Hide this project from active views. Can be restored later.
              </p>
            </div>
            <button className="px-3 py-1.5 text-xs font-medium text-warn border border-warn rounded-sv hover:bg-warn/10 transition-colors">
              Archive
            </button>
          </div>

          <div className="flex items-center justify-between py-3 px-4 rounded-sv bg-bg-el-2 border border-bad/20">
            <div>
              <p className="text-sm font-medium text-bad">Delete project</p>
              <p className="text-xs text-ink-3">
                Permanently delete this project and all associated data. This action cannot be undone.
              </p>
            </div>
            <button className="px-3 py-1.5 text-xs font-medium text-bad border border-bad rounded-sv hover:bg-bad/10 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
