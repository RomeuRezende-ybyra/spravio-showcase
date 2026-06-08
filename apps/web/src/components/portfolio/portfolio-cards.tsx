'use client'

import Link from 'next/link'
import { ActivityHeat, AvatarStack, HealthPill, SourceIcon } from '@/components/charts'

interface ProjectCard {
  id: string
  key: string
  name: string
  client: string
  clientSector: string
  source: string
  health: 'green' | 'yellow' | 'red'
  healthScore: number
  consumedPct: number
  team: Array<{ name: string; avatar: string; color?: string }>
  prsOpen: number
  activity: number[]
  sprintCompleted: number
  sprintTotalPoints: number
}

interface PortfolioCardsProps {
  projects: ProjectCard[]
}

export function PortfolioCards({ projects }: PortfolioCardsProps) {
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
                  <span className="font-mono text-xs text-ink-3">{project.key}</span>
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

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-1">
                    Budget
                  </div>
                  <div className="flex items-baseline gap-1">
                    <div className="font-display text-2xl text-ink">
                      {project.consumedPct}
                    </div>
                    <div className="text-xs text-ink-3">%</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-1">
                    Sprint
                  </div>
                  <div className="flex items-baseline gap-1">
                    <div className="font-display text-2xl text-ink">
                      {project.sprintCompleted}
                    </div>
                    <div className="text-xs text-ink-3">/{project.sprintTotalPoints}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-1">
                    PRs
                  </div>
                  <div className="font-display text-2xl text-ink">{project.prsOpen}</div>
                </div>

                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-1">
                    Team
                  </div>
                  <div className="flex items-center h-8">
                    <AvatarStack people={project.team} max={3} size={18} />
                  </div>
                </div>
              </div>

              {/* Activity heatmap */}
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-2">
                  Activity (14d)
                </div>
                <ActivityHeat activity={project.activity} cell={8} gap={2} />
              </div>
            </div>
          </Link>
        )
      })}

      {projects.length === 0 && (
        <div className="col-span-full py-12 text-center">
          <p className="text-sm text-ink-3">No projects found</p>
        </div>
      )}
    </div>
  )
}
