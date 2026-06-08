import { apiClient } from '@/lib/api/client'
import { Badge } from '@/components/ui/badge'
import { PRStatusBadge } from '@/components/shared/status-badge'
import { GithubPlaceholder } from '@/components/shared/github-placeholder'
import { UnconfiguredProjectState } from '@/components/projects/unconfigured-project-state'
import { Github, GitPullRequest, GitMerge, Clock, AlertCircle } from 'lucide-react'

export default async function PullRequestsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const project = await apiClient.projects.getById(projectId)

  const hasSourceCredentials =
    (project.source === 'jira' && project.jiraProjectKey) ||
    (project.source === 'azure' && project.azureProjectId)

  if (!hasSourceCredentials) {
    return (
      <UnconfiguredProjectState
        source={project.source}
        pageName="Pull Requests"
        pageDescription="Pull requests are tracked alongside your issue tracking system. Configure your Jira or Azure DevOps connection first."
      />
    )
  }

  let prs: Awaited<ReturnType<typeof apiClient.pullRequests.list>> = []
  let stats: Awaited<ReturnType<typeof apiClient.pullRequests.getStats>> | null = null
  let githubConnected = true

  try {
    ;[prs, stats] = await Promise.all([
      apiClient.pullRequests.list(projectId),
      apiClient.pullRequests.getStats(projectId),
    ])
  } catch {
    githubConnected = false
  }

  if (!githubConnected || !stats) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total PRs', icon: GitPullRequest },
            { label: 'Merged', icon: GitMerge },
            { label: 'Open', icon: GitPullRequest },
            { label: 'Stale', icon: AlertCircle },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="bg-bg-el border border-rule rounded-sv p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-ink-3" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink-3">{label}</span>
              </div>
              <div className="font-display text-3xl text-ink-3">—</div>
            </div>
          ))}
        </div>
        <GithubPlaceholder message="Connect a GitHub repository to see pull request data." />
      </div>
    )
  }

  function cycleTimeColor(hours: number | null): string {
    if (hours === null) return 'text-ink-3'
    if (hours < 24) return 'text-good'
    if (hours <= 48) return 'text-warn'
    return 'text-bad'
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitPullRequest className="h-4 w-4 text-ink-3" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Total PRs</span>
          </div>
          <div className="font-display text-3xl text-ink">{stats.totalPRs}</div>
          <div className="text-xs text-ink-3 mt-1">All time</div>
        </div>

        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitMerge className="h-4 w-4 text-good" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Merged</span>
          </div>
          <div className="font-display text-3xl text-good">{stats.mergedPRs}</div>
          <div className="text-xs text-ink-3 mt-1">
            {stats.totalPRs > 0 ? `${Math.round((stats.mergedPRs / stats.totalPRs) * 100)}% merge rate` : '—'}
          </div>
        </div>

        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitPullRequest className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Open</span>
          </div>
          <div className="font-display text-3xl text-accent">{stats.openPRs}</div>
          <div className="text-xs text-ink-3 mt-1">In review</div>
        </div>

        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-warn" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Stale</span>
          </div>
          <div className={`font-display text-3xl ${stats.stalePRs > 0 ? 'text-warn' : 'text-good'}`}>
            {stats.stalePRs}
          </div>
          <div className="text-xs text-ink-3 mt-1">{stats.stalePRs > 0 ? 'Needs attention' : 'All clear'}</div>
        </div>
      </div>

      {/* Avg cycle time */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Avg Cycle Time</span>
          </div>
          <div className={`font-display text-3xl ${cycleTimeColor(stats.avgCycleTimeHours)}`}>
            {Math.round(stats.avgCycleTimeHours)}h
          </div>
          <div className="text-xs text-ink-3 mt-1">Open → merge</div>
        </div>
      </div>

      {/* PR Table */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Pull Requests</span>
          <Badge variant="muted" className="ml-2">{prs.length}</Badge>
        </h2>

        {prs.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Github className="h-12 w-12 text-ink-3 mx-auto mb-3" />
            <p className="text-sm text-ink-3">No pull requests found</p>
          </div>
        ) : (
          <div className="bg-bg-el-2 border border-rule rounded-sv overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[50px_1fr_100px_80px_90px_70px_80px] gap-2 px-4 py-3 bg-bg-el-3 border-b border-rule">
              {['#', 'Title', 'Author', 'Jira', 'Cycle Time', 'Stale', 'Status'].map((h) => (
                <div key={h} className="text-xs font-mono uppercase tracking-wider text-ink-3">
                  {h}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {prs.map((pr, index) => (
              <div
                key={pr.id}
                className={`grid grid-cols-[50px_1fr_100px_80px_90px_70px_80px] gap-2 items-center px-4 py-3 transition-colors hover:bg-bg-el ${
                  index !== prs.length - 1 ? 'border-b border-rule' : ''
                }`}
              >
                <span className="flex items-center gap-1 text-xs text-ink-2 font-mono">
                  <Github className="h-3 w-3" />#{pr.number}
                </span>
                <span className="truncate text-sm text-ink">{pr.title}</span>
                <span className="truncate text-xs text-ink-2 font-mono">{pr.authorLogin}</span>
                <div className="flex flex-wrap gap-0.5">
                  {pr.jiraKeys.slice(0, 2).map((key) => (
                    <Badge key={key} variant="info" className="text-xs px-1.5 py-0.5">{key}</Badge>
                  ))}
                  {pr.jiraKeys.length > 2 && (
                    <Badge variant="muted" className="text-xs px-1.5 py-0.5">+{pr.jiraKeys.length - 2}</Badge>
                  )}
                </div>
                <span className={`text-xs font-mono ${cycleTimeColor(pr.cycleTimeHours)}`}>
                  {pr.cycleTimeHours !== null ? `${pr.cycleTimeHours}h` : '—'}
                </span>
                <span>
                  {pr.staleSeverity === 'CRITICAL' && (
                    <Badge variant="danger" className="text-xs px-1.5 py-0.5">Critical</Badge>
                  )}
                  {pr.staleSeverity === 'WARNING' && (
                    <Badge variant="warning" className="text-xs px-1.5 py-0.5">Stale</Badge>
                  )}
                </span>
                <PRStatusBadge status={pr.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
