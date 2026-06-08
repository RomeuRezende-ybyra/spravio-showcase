'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'
import {
  Sparkline,
  BudgetMeter,
  HealthPill,
  AvatarStack,
  BurndownMini,
  SourceIcon,
  Trend,
} from '@/components/charts'

interface Developer {
  name: string
  avatar: string
  color?: string
}

interface ProjectRow {
  id: string
  key: string
  name: string
  client: string
  clientSector: string
  source: string
  health: 'green' | 'yellow' | 'red'
  healthScore: number
  sprintNum: number
  sprintDay: number
  sprintLength: number
  sprintCompleted: number
  sprintTotalPoints: number
  burndown: {
    ideal: number[]
    actual: number[]
  }
  velocityPoints: number
  velocitySpark: number[]
  velocityTrend: 'up' | 'down' | 'stable'
  consumedPct: number
  team: Developer[]
  prsOpen: number
  prsStale: number
  onTimeProb: number
  lastSync: string
}

interface PortfolioTableProps {
  projects: ProjectRow[]
  onSort?: (key: string) => void
  sortKey?: string
  sortDir?: 'asc' | 'desc'
}

export function PortfolioTable({
  projects,
  onSort,
  sortKey = 'healthScore',
  sortDir = 'asc',
}: PortfolioTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const SortHeader = ({
    k,
    label,
    align = 'left',
  }: {
    k: string
    label: string
    align?: 'left' | 'right' | 'center'
  }) => (
    <th
      onClick={() => onSort?.(k)}
      className={`px-3 py-2 text-xs font-mono uppercase tracking-wider text-ink-3 cursor-pointer hover:text-ink-2 transition-colors ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      }`}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        <span>{label}</span>
        {sortKey === k && (
          <span className="font-sans text-ink-2">{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  )

  return (
    <div className="bg-bg-el border border-rule rounded-sv overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-el-2 border-b border-rule">
            <tr>
              <th className="w-4"></th>
              <SortHeader k="key" label="Key" />
              <SortHeader k="name" label="Project / Client" />
              <SortHeader k="healthScore" label="Health" />
              <th className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-ink-3 text-left">
                Sprint
              </th>
              <th className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-ink-3 text-left">
                Burndown
              </th>
              <SortHeader k="velocityPoints" label="Velocity" align="right" />
              <SortHeader k="consumedPct" label="Budget" align="right" />
              <th className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-ink-3 text-left">
                Team
              </th>
              <SortHeader k="prsStale" label="PRs" align="right" />
              <SortHeader k="onTimeProb" label="Forecast" align="right" />
              <th className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-ink-3 text-right">
                Sync
              </th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project.id}
                onClick={() => setExpanded(expanded === project.id ? null : project.id)}
                className={`
                  group relative border-b border-rule hover:bg-bg-el-2 cursor-pointer transition-colors
                  ${expanded === project.id ? 'bg-bg-el-2' : ''}
                `}
              >
                {/* Health Indicator Bar */}
                <td className="relative">
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      project.health === 'green'
                        ? 'bg-good'
                        : project.health === 'yellow'
                        ? 'bg-warn'
                        : 'bg-bad'
                    }`}
                  />
                </td>

                {/* Key */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <SourceIcon source={project.source} size={10} />
                    <span className="font-mono text-xs text-ink-2">{project.key}</span>
                  </div>
                </td>

                {/* Project / Client */}
                <td className="px-3 py-3">
                  <div>
                    <Link
                      href={`/projects/${project.id}/overview`}
                      className="font-medium text-sm text-ink hover:text-accent transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {project.name}
                    </Link>
                    <div className="text-xs text-ink-3">
                      {project.client} · <span className="text-ink-3">{project.clientSector}</span>
                    </div>
                  </div>
                </td>

                {/* Health */}
                <td className="px-3 py-3">
                  <HealthPill status={project.health} score={project.healthScore} compact />
                </td>

                {/* Sprint */}
                <td className="px-3 py-3">
                  <div className="space-y-1">
                    <div className="text-xs text-ink-3">
                      S{project.sprintNum} · day {project.sprintDay}/{project.sprintLength}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-rule rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all"
                          style={{
                            width: `${(project.sprintCompleted / project.sprintTotalPoints) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono text-ink-2 whitespace-nowrap">
                        {project.sprintCompleted}/{project.sprintTotalPoints} pts
                      </span>
                    </div>
                  </div>
                </td>

                {/* Burndown */}
                <td className="px-3 py-3">
                  <BurndownMini burndown={project.burndown} width={80} height={22} />
                </td>

                {/* Velocity */}
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Sparkline
                      data={project.velocitySpark}
                      width={50}
                      height={18}
                      stroke="var(--ink-2)"
                    />
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm text-ink">{project.velocityPoints}</span>
                      <Trend direction={project.velocityTrend} />
                    </div>
                  </div>
                </td>

                {/* Budget */}
                <td className="px-3 py-3">
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-right text-ink-2">
                      {project.consumedPct}%
                    </div>
                    <BudgetMeter pct={project.consumedPct} height={6} />
                  </div>
                </td>

                {/* Team */}
                <td className="px-3 py-3">
                  <AvatarStack people={project.team} max={4} size={20} />
                </td>

                {/* PRs */}
                <td className="px-3 py-3 text-right">
                  <div className="space-y-1">
                    <div className="font-mono text-sm text-ink">{project.prsOpen}</div>
                    {project.prsStale > 0 && (
                      <div className="text-xs text-warn">+{project.prsStale} stale</div>
                    )}
                  </div>
                </td>

                {/* Forecast */}
                <td className="px-3 py-3 text-right">
                  <div
                    className={`font-mono text-sm ${
                      project.onTimeProb >= 70
                        ? 'text-good'
                        : project.onTimeProb >= 45
                        ? 'text-warn'
                        : 'text-bad'
                    }`}
                  >
                    {project.onTimeProb}%
                  </div>
                </td>

                {/* Sync */}
                <td className="px-3 py-3 text-right">
                  <div className="text-xs text-ink-3">{project.lastSync}</div>
                </td>

                {/* Expand Icon */}
                <td className="px-2 py-3">
                  {expanded === project.id ? (
                    <ChevronDown className="h-4 w-4 text-ink-3" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-ink-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {projects.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-ink-3">No projects found</p>
        </div>
      )}
    </div>
  )
}
