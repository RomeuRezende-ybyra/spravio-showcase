'use client'

import { useState } from 'react'
import { GitPullRequest, GitMerge, Clock, AlertTriangle, ExternalLink, Github } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Demo PR data (no PullRequest model in DB — rendered client-side)
const DEMO_PRS = [
  {
    id: '1',
    number: 142,
    title: 'feat: implement checkout payment flow',
    status: 'OPEN' as const,
    authorLogin: 'anasilva',
    project: 'E-commerce Platform',
    projectKey: 'ECOM',
    jiraKeys: ['ECOM-34', 'ECOM-35'],
    cycleTimeHours: null,
    isStale: false,
    createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    mergedAt: null,
    additions: 847,
    deletions: 123,
    reviewers: ['carlossouza', 'pedrooliveira'],
  },
  {
    id: '2',
    number: 141,
    title: 'fix: resolve cart total calculation rounding issue',
    status: 'MERGED' as const,
    authorLogin: 'carlossouza',
    project: 'E-commerce Platform',
    projectKey: 'ECOM',
    jiraKeys: ['ECOM-41'],
    cycleTimeHours: 18,
    isStale: false,
    createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    mergedAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),
    additions: 42,
    deletions: 15,
    reviewers: ['anasilva'],
  },
  {
    id: '3',
    number: 89,
    title: 'feat: add push notification service integration',
    status: 'OPEN' as const,
    authorLogin: 'marinacosta',
    project: 'Mobile App',
    projectKey: 'MOB',
    jiraKeys: ['MOB-22', 'MOB-23'],
    cycleTimeHours: null,
    isStale: true,
    createdAt: new Date(Date.now() - 8 * 86_400_000).toISOString(),
    mergedAt: null,
    additions: 1234,
    deletions: 89,
    reviewers: ['luciafernandes', 'anasilva'],
  },
  {
    id: '4',
    number: 88,
    title: 'refactor: migrate dashboard to new analytics SDK',
    status: 'MERGED' as const,
    authorLogin: 'luciafernandes',
    project: 'Mobile App',
    projectKey: 'MOB',
    jiraKeys: ['MOB-19'],
    cycleTimeHours: 24,
    isStale: false,
    createdAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    mergedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    additions: 567,
    deletions: 432,
    reviewers: ['marinacosta'],
  },
  {
    id: '5',
    number: 203,
    title: 'feat: implement rate limiting middleware with Redis',
    status: 'OPEN' as const,
    authorLogin: 'carlossouza',
    project: 'API Gateway',
    projectKey: 'APIGW',
    jiraKeys: ['APIGW-15', 'APIGW-16'],
    cycleTimeHours: null,
    isStale: false,
    createdAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),
    mergedAt: null,
    additions: 634,
    deletions: 28,
    reviewers: ['pedrooliveira', 'marinacosta'],
  },
  {
    id: '6',
    number: 202,
    title: 'fix: health check endpoint timeout under load',
    status: 'MERGED' as const,
    authorLogin: 'pedrooliveira',
    project: 'API Gateway',
    projectKey: 'APIGW',
    jiraKeys: ['APIGW-18'],
    cycleTimeHours: 6,
    isStale: false,
    createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    mergedAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),
    additions: 23,
    deletions: 8,
    reviewers: ['carlossouza'],
  },
  {
    id: '7',
    number: 201,
    title: 'chore: update OpenTelemetry to v2.x with breaking changes',
    status: 'OPEN' as const,
    authorLogin: 'marinacosta',
    project: 'API Gateway',
    projectKey: 'APIGW',
    jiraKeys: ['APIGW-20'],
    cycleTimeHours: null,
    isStale: true,
    createdAt: new Date(Date.now() - 12 * 86_400_000).toISOString(),
    mergedAt: null,
    additions: 2145,
    deletions: 1876,
    reviewers: ['carlossouza', 'pedrooliveira'],
  },
]

export default function PullRequestsPage() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'OPEN' | 'MERGED'>('all')
  const [filterProject, setFilterProject] = useState<string>('all')

  const filtered = DEMO_PRS
    .filter((pr) => filterStatus === 'all' || pr.status === filterStatus)
    .filter((pr) => filterProject === 'all' || pr.projectKey === filterProject)

  const openCount = DEMO_PRS.filter((pr) => pr.status === 'OPEN').length
  const mergedCount = DEMO_PRS.filter((pr) => pr.status === 'MERGED').length
  const staleCount = DEMO_PRS.filter((pr) => pr.isStale).length
  const avgCycleTime = Math.round(
    DEMO_PRS.filter((pr) => pr.cycleTimeHours).reduce((sum, pr) => sum + (pr.cycleTimeHours ?? 0), 0) /
    Math.max(1, DEMO_PRS.filter((pr) => pr.cycleTimeHours).length)
  )

  const projects = [...new Set(DEMO_PRS.map((pr) => pr.projectKey))]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Pull Requests</h1>
          <p className="text-sm text-ink-3">Review and manage pull requests across all projects</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-el border border-rule rounded-sv text-xs text-ink-3">
          <Github className="h-3.5 w-3.5" />
          <span>Demo data</span>
          <Badge variant="muted">Preview</Badge>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-1">Open PRs</div>
          <div className="font-display text-3xl text-accent">{openCount}</div>
        </div>
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-1">Merged (7d)</div>
          <div className="font-display text-3xl text-good">{mergedCount}</div>
        </div>
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-1">Stale</div>
          <div className="font-display text-3xl text-warn">{staleCount}</div>
        </div>
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-1">Avg Cycle Time</div>
          <div className="font-display text-3xl text-ink">{avgCycleTime}h</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-bg-el border border-rule rounded-sv p-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'OPEN', label: 'Open' },
            { id: 'MERGED', label: 'Merged' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id as typeof filterStatus)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                filterStatus === f.id
                  ? 'bg-accent text-white'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-bg-el border border-rule rounded-sv p-1">
          <button
            onClick={() => setFilterProject('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filterProject === 'all' ? 'bg-accent text-white' : 'text-ink-3 hover:text-ink'
            }`}
          >
            All Projects
          </button>
          {projects.map((key) => (
            <button
              key={key}
              onClick={() => setFilterProject(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                filterProject === key ? 'bg-accent text-white' : 'text-ink-3 hover:text-ink'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* PR List */}
      <div className="bg-bg-el border border-rule rounded-sv overflow-hidden">
        <div className="divide-y divide-rule">
          {filtered.map((pr) => (
            <div key={pr.id} className="px-4 py-3 hover:bg-bg-el-2 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="mt-0.5">
                    {pr.status === 'MERGED' ? (
                      <GitMerge className="h-4 w-4 text-good" />
                    ) : pr.isStale ? (
                      <AlertTriangle className="h-4 w-4 text-warn" />
                    ) : (
                      <GitPullRequest className="h-4 w-4 text-accent" />
                    )}
                  </div>

                  <div>
                    {/* Title */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{pr.title}</span>
                      {pr.isStale && <Badge variant="danger" className="text-xs">Stale</Badge>}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-1 text-xs text-ink-3">
                      <span className="font-mono">#{pr.number}</span>
                      <span>{pr.projectKey}</span>
                      <span>by @{pr.authorLogin}</span>
                      <span>{new Date(pr.createdAt).toLocaleDateString()}</span>
                      {pr.cycleTimeHours && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {pr.cycleTimeHours}h cycle
                        </span>
                      )}
                    </div>

                    {/* Jira Keys */}
                    {pr.jiraKeys.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {pr.jiraKeys.map((key) => (
                          <span key={key} className="px-1.5 py-0.5 bg-bg-el-2 border border-rule rounded text-xs font-mono text-ink-2">
                            {key}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                  <div className="text-xs text-ink-3 text-right">
                    <span className="text-good">+{pr.additions}</span>
                    {' '}
                    <span className="text-bad">-{pr.deletions}</span>
                  </div>
                  <Badge variant={pr.status === 'MERGED' ? 'success' : 'default'}>
                    {pr.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <GitPullRequest className="h-8 w-8 text-ink-3 mx-auto mb-2" />
            <p className="text-sm text-ink-3">No pull requests match the current filters</p>
          </div>
        )}
      </div>

      {/* Integration Notice */}
      <div className="bg-bg-el border border-dashed border-rule rounded-sv p-4 flex items-center gap-3">
        <Github className="h-5 w-5 text-ink-3 flex-shrink-0" />
        <div>
          <p className="text-sm text-ink-2">
            This page shows demo data. Connect your GitHub repositories in{' '}
            <span className="text-accent">Settings &gt; Integrations</span>{' '}
            to see real pull request data synced automatically.
          </p>
        </div>
      </div>
    </div>
  )
}
