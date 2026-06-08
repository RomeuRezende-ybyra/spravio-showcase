'use client'

import { Search, SlidersHorizontal, Plus } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface FilterOption {
  id: string
  label: string
  count: number
}

interface ProjectsFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  statusOptions: FilterOption[]
  healthOptions: FilterOption[]
  onNewProject?: () => void
}

export function ProjectsFilters({
  searchValue,
  onSearchChange,
  statusOptions,
  healthOptions,
  onNewProject,
}: ProjectsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedStatus = searchParams.get('status') || 'all'
  const selectedHealth = searchParams.get('health') || 'all'

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="bg-bg-el border-b border-rule px-5 py-3 space-y-3">
      {/* Top row: Search + New Project */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects, clients, keys..."
            className="w-full pl-10 pr-3 py-2 bg-bg-el-2 border border-rule rounded-sv text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-rule-2"
          />
        </div>

        {/* New Project Button */}
        {onNewProject && (
          <button
            onClick={onNewProject}
            className="flex items-center gap-2 px-4 py-2 rounded-sv bg-accent hover:bg-accent-deep text-white text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        )}
      </div>

      {/* Bottom row: Filter chips */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Status filters */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-ink-3" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Status:</span>
          <div className="flex items-center gap-1.5">
            {statusOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => updateFilter('status', option.id)}
                className={`px-3 py-1 rounded-sv-sm text-xs font-medium transition-colors ${
                  selectedStatus === option.id
                    ? 'bg-accent/10 text-ink border border-accent/20'
                    : 'bg-bg-el-2 text-ink-2 border border-rule hover:border-rule-2 hover:text-ink'
                }`}
              >
                {option.label}
                <span className="ml-1.5 font-mono text-ink-3">{option.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Health filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Health:</span>
          <div className="flex items-center gap-1.5">
            {healthOptions.map((option) => {
              const healthColor =
                option.id === 'green'
                  ? 'bg-good'
                  : option.id === 'yellow'
                  ? 'bg-warn'
                  : option.id === 'red'
                  ? 'bg-bad'
                  : 'bg-ink-3'

              return (
                <button
                  key={option.id}
                  onClick={() => updateFilter('health', option.id)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-sv-sm text-xs font-medium transition-colors ${
                    selectedHealth === option.id
                      ? 'bg-accent/10 text-ink border border-accent/20'
                      : 'bg-bg-el-2 text-ink-2 border border-rule hover:border-rule-2 hover:text-ink'
                  }`}
                >
                  {option.id !== 'all' && (
                    <span className={`w-2 h-2 rounded-full ${healthColor}`} />
                  )}
                  {option.label}
                  <span className="ml-1 font-mono text-ink-3">{option.count}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
