'use client'

import { useState, useEffect } from 'react'
import { LayoutDashboard, Loader2, ChevronDown, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SprintData {
  id: string
  name: string
  state: string
  startDate: string | null
  endDate: string | null
  totalPoints: number
  completedPoints: number
  project: { id: string; name: string; key: string | null }
  totalCards: number
  completedCards: number
  remainingCards: number
  completionPercentage: number
  backendPoints: number
  frontendPoints: number
  burndown: Array<{
    date: string
    baselinePoints: number
    actualPoints: number
    completedPoints: number
  }>
  issuesByStatus: {
    todo: number
    inProgress: number
    test: number
    uat: number
    done: number
    cancelled: number
  }
}

export default function SprintsPage() {
  const [sprints, setSprints] = useState<SprintData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSprint, setSelectedSprint] = useState<string | null>(null)
  const [filterState, setFilterState] = useState<string>('all')

  useEffect(() => {
    async function fetchSprints() {
      try {
        const res = await fetch('/api/sprints')
        const json = await res.json()
        if (json.success) {
          setSprints(json.data)
          // Auto-select first active sprint
          const active = json.data.find((s: SprintData) => s.state === 'ACTIVE')
          if (active) setSelectedSprint(active.id)
          else if (json.data.length > 0) setSelectedSprint(json.data[0].id)
        }
      } catch (err) {
        console.error('Failed to fetch sprints:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSprints()
  }, [])

  const filteredSprints = filterState === 'all'
    ? sprints
    : sprints.filter((s) => s.state === filterState)

  const selected = sprints.find((s) => s.id === selectedSprint)

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Sprints</h1>
          <p className="text-sm text-ink-3">Track sprint progress across all projects</p>
        </div>
        <div className="bg-bg-el border border-rule rounded-sv py-16 text-center">
          <Loader2 className="h-8 w-8 text-ink-3 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-ink-2">Loading sprints...</p>
        </div>
      </div>
    )
  }

  if (sprints.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Sprints</h1>
          <p className="text-sm text-ink-3">Track sprint progress across all projects</p>
        </div>
        <div className="bg-bg-el border border-rule rounded-sv py-16 text-center">
          <LayoutDashboard className="h-12 w-12 text-ink-3 mx-auto mb-3" />
          <p className="text-sm text-ink-2 mb-1">No sprints yet</p>
          <p className="text-xs text-ink-3">Connect a project management tool to sync sprints automatically.</p>
        </div>
      </div>
    )
  }

  const stateIcon = (state: string) => {
    if (state === 'ACTIVE') return <Clock className="h-3.5 w-3.5 text-accent" />
    if (state === 'CLOSED') return <CheckCircle2 className="h-3.5 w-3.5 text-good" />
    return <AlertTriangle className="h-3.5 w-3.5 text-ink-3" />
  }

  const stateColor = (state: string) => {
    if (state === 'ACTIVE') return 'text-accent'
    if (state === 'CLOSED') return 'text-good'
    return 'text-ink-3'
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Sprints</h1>
          <p className="text-sm text-ink-3">Track sprint progress across all projects</p>
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-2 bg-bg-el border border-rule rounded-sv p-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'CLOSED', label: 'Closed' },
            { id: 'FUTURE', label: 'Future' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterState(f.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                filterState === f.id
                  ? 'bg-accent text-white'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[320px_1fr] gap-4">
        {/* Sprint List */}
        <div className="bg-bg-el border border-rule rounded-sv overflow-hidden">
          <div className="px-4 py-3 border-b border-rule">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
              {filteredSprints.length} sprint{filteredSprints.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="divide-y divide-rule max-h-[600px] overflow-y-auto">
            {filteredSprints.map((sprint) => (
              <button
                key={sprint.id}
                onClick={() => setSelectedSprint(sprint.id)}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-bg-el-2 ${
                  selectedSprint === sprint.id ? 'bg-bg-el-2 border-l-2 border-l-accent' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {stateIcon(sprint.state)}
                    <span className="text-sm font-medium text-ink">{sprint.name}</span>
                  </div>
                  <Badge variant={sprint.state === 'ACTIVE' ? 'default' : 'muted'} className="text-xs">
                    {sprint.state}
                  </Badge>
                </div>
                <div className="text-xs text-ink-3 mb-2">
                  {sprint.project.key ?? sprint.project.name}
                </div>
                {sprint.totalPoints > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-rule rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all rounded-full"
                        style={{ width: `${(sprint.completedPoints / sprint.totalPoints) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-ink-2">
                      {sprint.completedPoints}/{sprint.totalPoints}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sprint Detail */}
        {selected ? (
          <div className="space-y-4">
            {/* Sprint Header */}
            <div className="bg-bg-el border border-rule rounded-sv p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{selected.name}</h2>
                  <p className="text-sm text-ink-3">
                    {selected.project.name}
                    {selected.startDate && selected.endDate && (
                      <> &middot; {new Date(selected.startDate).toLocaleDateString()} &ndash; {new Date(selected.endDate).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                <Badge
                  variant={selected.state === 'ACTIVE' ? 'default' : selected.state === 'CLOSED' ? 'success' : 'muted'}
                >
                  {selected.state}
                </Badge>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-1">Completion</div>
                  <div className="font-display text-2xl text-ink">{selected.completionPercentage}%</div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-1">Points</div>
                  <div className="font-display text-2xl text-ink">
                    {selected.completedPoints}<span className="text-sm text-ink-3">/{selected.totalPoints}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-1">Cards</div>
                  <div className="font-display text-2xl text-ink">
                    {selected.completedCards}<span className="text-sm text-ink-3">/{selected.totalCards}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-1">Remaining</div>
                  <div className="font-display text-2xl text-ink">{selected.remainingCards}</div>
                </div>
              </div>
            </div>

            {/* Burndown Chart Area */}
            {selected.burndown.length > 0 && (
              <div className="bg-bg-el border border-rule rounded-sv p-5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-4">Burndown</h3>
                <div className="h-48 flex items-end gap-1">
                  {selected.burndown.map((point, i) => {
                    const maxPts = selected.totalPoints || 1
                    const idealHeight = (point.baselinePoints / maxPts) * 100
                    const actualHeight = (point.actualPoints / maxPts) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${point.date}: Ideal ${point.baselinePoints}, Actual ${point.actualPoints}`}>
                        <div className="w-full flex gap-px" style={{ height: '180px', alignItems: 'flex-end' }}>
                          <div
                            className="flex-1 bg-rule rounded-t-sm opacity-50"
                            style={{ height: `${idealHeight}%` }}
                          />
                          <div
                            className={`flex-1 rounded-t-sm ${point.actualPoints > point.baselinePoints ? 'bg-warn' : 'bg-accent'}`}
                            style={{ height: `${actualHeight}%` }}
                          />
                        </div>
                        {i % 2 === 0 && (
                          <span className="text-[9px] text-ink-3">{point.date.slice(5)}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 flex items-center justify-center gap-6 text-xs text-ink-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-rule opacity-50" />
                    <span>Ideal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-accent" />
                    <span>Actual</span>
                  </div>
                </div>
              </div>
            )}

            {/* Issue Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg-el border border-rule rounded-sv p-5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-4">Issues by Status</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Done', count: selected.issuesByStatus.done, color: 'bg-good' },
                    { label: 'UAT', count: selected.issuesByStatus.uat, color: 'bg-accent' },
                    { label: 'Test', count: selected.issuesByStatus.test, color: 'bg-warn' },
                    { label: 'In Progress', count: selected.issuesByStatus.inProgress, color: 'bg-accent opacity-60' },
                    { label: 'To Do', count: selected.issuesByStatus.todo, color: 'bg-ink-3 opacity-40' },
                    { label: 'Cancelled', count: selected.issuesByStatus.cancelled, color: 'bg-bad opacity-50' },
                  ].filter((s) => s.count > 0).map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                        <span className="text-sm text-ink">{s.label}</span>
                      </div>
                      <span className="text-sm font-mono text-ink-2">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-bg-el border border-rule rounded-sv p-5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-4">Points by Type</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink">Backend</span>
                    <span className="text-sm font-mono text-ink-2">{selected.backendPoints} pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink">Frontend</span>
                    <span className="text-sm font-mono text-ink-2">{selected.frontendPoints} pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink">Other</span>
                    <span className="text-sm font-mono text-ink-2">
                      {selected.totalPoints - selected.backendPoints - selected.frontendPoints} pts
                    </span>
                  </div>
                </div>

                {/* Velocity Comparison */}
                <div className="mt-6 pt-4 border-t border-rule">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-2">Sprint Progress</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-rule rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${selected.completionPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-ink-2">{selected.completionPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-bg-el border border-rule rounded-sv py-16 text-center">
            <ChevronDown className="h-8 w-8 text-ink-3 mx-auto mb-3" />
            <p className="text-sm text-ink-2">Select a sprint to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}
