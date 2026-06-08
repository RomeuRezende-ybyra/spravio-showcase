'use client'

import Link from 'next/link'
import {
  HealthPill,
  SourceIcon,
  BudgetMeter,
  AvatarStack,
  ActivityHeat,
} from '@/components/charts'
import { Clock, GitPullRequest, AlertCircle } from 'lucide-react'

interface Project {
  id: string
  key: string
  name: string
  client: string
  clientSector: string
  source: string
  status: 'active' | 'paused' | 'done' | 'discovery'
  health: 'green' | 'yellow' | 'red'
  healthScore: number
  consumedPct: number
  budgetTotal: number
  budgetConsumed: number
  team: Array<{ name: string; avatar: string; color?: string }>
  prsOpen: number
  prsStale: number
  lastActivity: string
  activity?: number[]
}

interface ProjectsCardsProps {
  projects: Project[]
}

export function ProjectsCards({ projects }: ProjectsCardsProps) {
  const statusLabels = {
    active: 'Active',
    paused: 'Paused',
    done: 'Done',
    discovery: 'Discovery',
  }

  const statusColors = {
    active: 'bg-good/10 text-good border-good/20',
    paused: 'bg-warn/10 text-warn border-warn/20',
    done: 'bg-ink-3/10 text-ink-3 border-ink-3/20',
    discovery: 'bg-accent/10 text-accent border-accent/20',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => {
        const accentColor =
          project.health === 'green'
            ? 'var(--good)'
            : project.health === 'yellow'
            ? 'var(--warn)'
            : 'var(--bad)'

        return (
          <Link
            key={project.id}
            href={`/projects/${project.id}/overview`}
            className="block bg-bg-el border border-rule rounded-sv hover:border-rule-2 transition-colors group"
          >
            {/* Accent top bar */}
            <div
              className="h-1 rounded-t-sv"
              style={{ background: accentColor }}
            />

            {/* Card content */}
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <SourceIcon source={project.source} size={10} />
                  <span className="font-mono text-xs text-ink-3">
                    {project.key}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-sv-sm text-xs font-medium border ${
                      statusColors[project.status]
                    }`}
                  >
                    {statusLabels[project.status]}
                  </span>
                </div>
                <HealthPill
                  status={project.health}
                  score={project.healthScore}
                  compact
                />
              </div>

              {/* Title */}
              <h3 className="font-semibold text-base text-ink mb-1 group-hover:text-accent transition-colors truncate">
                {project.name}
              </h3>
              <p className="text-xs text-ink-3 mb-4">
                {project.client} · {project.clientSector}
              </p>

              {/* Budget section */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono uppercase tracking-wider text-ink-3">
                    Budget
                  </span>
                  <span
                    className={`font-mono ${
                      project.consumedPct > 90
                        ? 'text-bad'
                        : project.consumedPct > 75
                        ? 'text-warn'
                        : 'text-ink-3'
                    }`}
                  >
                    {project.consumedPct}%
                  </span>
                </div>
                <BudgetMeter pct={project.consumedPct} height={8} />
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-ink-3">
                    ${(project.budgetConsumed / 1000).toFixed(0)}K consumed
                  </span>
                  <span className="text-ink-3">
                    ${(project.budgetTotal / 1000).toFixed(0)}K total
                  </span>
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-bg-el-2 rounded-sv-sm p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <GitPullRequest className="h-3 w-3 text-ink-3" />
                    <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
                      PRs
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <div className="font-display text-xl text-ink">
                      {project.prsOpen}
                    </div>
                    {project.prsStale > 0 && (
                      <div className="flex items-center gap-0.5 text-warn">
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-xs">{project.prsStale}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-bg-el-2 rounded-sv-sm p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="h-3 w-3 text-ink-3" />
                    <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
                      Active
                    </span>
                  </div>
                  <div className="font-display text-xl text-ink truncate">
                    {project.lastActivity}
                  </div>
                </div>

                <div className="bg-bg-el-2 rounded-sv-sm p-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-1">
                    Team
                  </div>
                  <div className="flex items-center h-6">
                    <AvatarStack people={project.team} max={3} size={18} />
                  </div>
                </div>
              </div>

              {/* Activity heatmap */}
              {project.activity && project.activity.length > 0 && (
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-2">
                    Activity (14d)
                  </div>
                  <ActivityHeat activity={project.activity} cell={8} gap={2} />
                </div>
              )}
            </div>
          </Link>
        )
      })}

      {projects.length === 0 && (
        <div className="col-span-full py-12 text-center">
          <p className="text-sm text-ink-3">No projects found</p>
          <p className="text-xs text-ink-3 mt-1">
            Try adjusting your filters or create a new project
          </p>
        </div>
      )}
    </div>
  )
}
