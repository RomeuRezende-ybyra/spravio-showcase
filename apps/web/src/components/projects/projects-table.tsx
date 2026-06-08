'use client'

import { useRouter } from 'next/navigation'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import {
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  ExternalLink,
  Archive,
  Trash2,
} from 'lucide-react'
import {
  HealthPill,
  SourceIcon,
  BudgetMeter,
  AvatarStack,
} from '@/components/charts'

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
}

interface ProjectsTableProps {
  projects: Project[]
  onSort: (key: string) => void
  sortKey: string
  sortDir: 'asc' | 'desc'
}

export function ProjectsTable({
  projects,
  onSort,
  sortKey,
  sortDir,
}: ProjectsTableProps) {
  const router = useRouter()
  const parentRef = useRef<HTMLDivElement>(null)

  // Virtualization for performance with large lists
  const rowVirtualizer = useVirtualizer({
    count: projects.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // Row height in pixels
    overscan: 5,
  })

  const handleRowClick = (projectId: string) => {
    router.push(`/projects/${projectId}/overview`)
  }

  const SortHeader = ({
    k,
    label,
    className = '',
  }: {
    k: string
    label: string
    className?: string
  }) => {
    const isActive = sortKey === k
    return (
      <th
        onClick={() => onSort(k)}
        className={`px-3 py-2 text-left text-xs font-mono uppercase tracking-wider text-ink-3 cursor-pointer hover:text-ink-2 transition-colors ${className}`}
      >
        <div className="flex items-center gap-1.5">
          {label}
          {isActive && (
            <span className="text-accent">
              {sortDir === 'asc' ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </th>
    )
  }

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
    <div className="bg-bg-el border border-rule rounded-sv overflow-hidden">
      {/* Fixed header */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-el-2 border-b border-rule">
            <tr>
              <th className="w-12 px-3 py-2">
                <input
                  type="checkbox"
                  className="rounded border-rule bg-bg-el-2 text-accent focus:ring-accent focus:ring-offset-0"
                  aria-label="Select all"
                />
              </th>
              <SortHeader k="key" label="Key" className="w-24" />
              <SortHeader k="name" label="Project" className="min-w-[200px]" />
              <SortHeader k="client" label="Client" className="min-w-[140px]" />
              <SortHeader k="status" label="Status" className="w-28" />
              <SortHeader k="healthScore" label="Health" className="w-32" />
              <SortHeader
                k="consumedPct"
                label="Budget"
                className="min-w-[180px]"
              />
              <SortHeader k="team" label="Team" className="w-32" />
              <SortHeader k="prsOpen" label="PRs" className="w-20" />
              <SortHeader
                k="lastActivity"
                label="Last Activity"
                className="w-28"
              />
              <th className="w-12 px-3 py-2"></th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Virtualized body */}
      <div ref={parentRef} className="overflow-auto" style={{ height: '600px' }}>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const project = projects[virtualRow.index]
            if (!project) return null

            const healthColor =
              project.health === 'green'
                ? 'bg-good'
                : project.health === 'yellow'
                ? 'bg-warn'
                : 'bg-bad'

            return (
              <div
                key={project.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <table className="w-full">
                  <tbody>
                    <tr
                      onClick={() => handleRowClick(project.id)}
                      className="border-b border-rule hover:bg-bg-el-2 cursor-pointer transition-colors group"
                    >
                      {/* Checkbox */}
                      <td className="w-12 px-3 py-3 relative">
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${healthColor}`}
                        />
                        <input
                          type="checkbox"
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-rule bg-bg-el text-accent focus:ring-accent focus:ring-offset-0"
                          aria-label={`Select ${project.name}`}
                        />
                      </td>

                      {/* Key */}
                      <td className="w-24 px-3 py-3">
                        <div className="flex items-center gap-2">
                          <SourceIcon source={project.source} size={10} />
                          <span className="font-mono text-xs text-ink-2">
                            {project.key}
                          </span>
                        </div>
                      </td>

                      {/* Project Name */}
                      <td className="min-w-[200px] px-3 py-3">
                        <div className="font-medium text-sm text-ink group-hover:text-accent transition-colors">
                          {project.name}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="min-w-[140px] px-3 py-3">
                        <div className="text-sm text-ink-2">
                          {project.client}
                        </div>
                        <div className="text-xs text-ink-3">
                          {project.clientSector}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="w-28 px-3 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-sv-sm text-xs font-medium border ${
                            statusColors[project.status]
                          }`}
                        >
                          {statusLabels[project.status]}
                        </span>
                      </td>

                      {/* Health */}
                      <td className="w-32 px-3 py-3">
                        <HealthPill
                          status={project.health}
                          score={project.healthScore}
                          compact
                        />
                      </td>

                      {/* Budget */}
                      <td className="min-w-[180px] px-3 py-3">
                        <div className="space-y-1">
                          <BudgetMeter pct={project.consumedPct} height={6} />
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-ink-3">
                              ${(project.budgetConsumed / 1000).toFixed(0)}K /{' '}
                              ${(project.budgetTotal / 1000).toFixed(0)}K
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
                        </div>
                      </td>

                      {/* Team */}
                      <td className="w-32 px-3 py-3">
                        <AvatarStack people={project.team} max={4} size={20} />
                      </td>

                      {/* PRs */}
                      <td className="w-20 px-3 py-3">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-sm text-ink">
                            {project.prsOpen}
                          </span>
                          {project.prsStale > 0 && (
                            <span className="font-mono text-xs text-warn">
                              ({project.prsStale})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Last Activity */}
                      <td className="w-28 px-3 py-3">
                        <span className="text-xs text-ink-3">
                          {project.lastActivity}
                        </span>
                      </td>

                      {/* Actions Menu */}
                      <td className="w-12 px-3 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // TODO: Open actions menu
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-sv-sm hover:bg-bg-el-3"
                          aria-label="Project actions"
                        >
                          <MoreHorizontal className="h-4 w-4 text-ink-3" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-ink-3">No projects found</p>
          <p className="text-xs text-ink-3 mt-1">
            Try adjusting your filters or create a new project
          </p>
        </div>
      )}
    </div>
  )
}
