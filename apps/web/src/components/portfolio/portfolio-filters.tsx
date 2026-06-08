'use client'

import { useState } from 'react'
import { Search, Download, RefreshCw } from 'lucide-react'

interface FilterChip {
  id: string
  label: string
  count: number
  color?: 'green' | 'yellow' | 'red'
}

interface PortfolioFiltersProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
  chips: FilterChip[]
  searchValue: string
  onSearchChange: (value: string) => void
  onExport?: () => void
  onSync?: () => void
}

export function PortfolioFilters({
  activeFilter,
  onFilterChange,
  chips,
  searchValue,
  onSearchChange,
  onExport,
  onSync,
}: PortfolioFiltersProps) {
  return (
    <div className="bg-bg-el border-b border-rule px-5 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Filter Chips */}
        <div className="flex items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => onFilterChange(chip.id)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-sv-sm text-sm font-medium transition-colors
                ${
                  activeFilter === chip.id
                    ? 'bg-accent/10 text-ink border border-accent/20'
                    : 'bg-bg-el-2 text-ink-2 border border-rule hover:border-rule-2 hover:text-ink'
                }
              `}
            >
              {chip.color && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    chip.color === 'green'
                      ? 'bg-good'
                      : chip.color === 'yellow'
                      ? 'bg-warn'
                      : 'bg-bad'
                  }`}
                />
              )}
              <span>{chip.label}</span>
              <span className="font-mono text-xs text-ink-3">{chip.count}</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-3" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter projects..."
              className="pl-9 pr-3 py-1.5 bg-bg-el-2 border border-rule rounded-sv text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-rule-2 w-64"
            />
          </div>

          {/* Export */}
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-3 py-1.5 rounded-sv bg-bg-el-2 border border-rule text-sm text-ink-2 hover:border-rule-2 hover:text-ink transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}

          {/* Sync */}
          {onSync && (
            <button
              onClick={onSync}
              className="flex items-center gap-2 px-3 py-1.5 rounded-sv bg-accent hover:bg-accent-deep text-white text-sm transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sync All</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
