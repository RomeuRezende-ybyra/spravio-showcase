'use client'

import { Users, AlertCircle } from 'lucide-react'

interface CapacityHeatmapProps {
  data: Array<{
    developer: string
    weeks: number[] // allocation percentages (0-150)
  }>
}

function getLoadColor(percentage: number): string {
  if (percentage <= 60) return 'bg-good/20 text-good border-good/30'
  if (percentage <= 85) return 'bg-accent/20 text-accent border-accent/30'
  if (percentage <= 100) return 'bg-warn/20 text-warn border-warn/30'
  if (percentage <= 120) return 'bg-bad/30 text-bad border-bad/40'
  return 'bg-bad/50 text-bad border-bad/60'
}

function getLoadLabel(percentage: number): string {
  if (percentage <= 60) return 'Free'
  if (percentage <= 85) return 'OK'
  if (percentage <= 100) return 'Loaded'
  if (percentage <= 120) return 'Saturated'
  return 'Over'
}

export function CapacityHeatmap({ data }: CapacityHeatmapProps) {
  const weekCount = data[0]?.weeks.length || 8
  const weeks = Array.from({ length: weekCount }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i * 7)
    return `W${i + 1}`
  })

  return (
    <div className="bg-bg-el border border-rule rounded-sv p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Team Capacity ({weekCount} weeks)
          </span>
        </h3>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-good/20 border border-good/30" />
            <span className="text-ink-3">Free (&lt;60%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-accent/20 border border-accent/30" />
            <span className="text-ink-3">OK (60-85%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-warn/20 border border-warn/30" />
            <span className="text-ink-3">Loaded (85-100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-bad/30 border border-bad/40" />
            <span className="text-ink-3">Saturated (100-120%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-bad/50 border border-bad/60" />
            <span className="text-ink-3">Over (&gt;120%)</span>
          </div>
        </div>
      </div>

      <div className="bg-bg-el-2 border border-rule rounded-sv overflow-hidden">
        {/* Header Row */}
        <div className="grid gap-1 px-4 py-2 bg-bg-el-3 border-b border-rule" style={{ gridTemplateColumns: `180px repeat(${weekCount}, 1fr)` }}>
          <div className="text-xs font-mono uppercase tracking-wider text-ink-3">Developer</div>
          {weeks.map((week) => (
            <div key={week} className="text-xs font-mono uppercase tracking-wider text-ink-3 text-center">
              {week}
            </div>
          ))}
        </div>

        {/* Developer Rows */}
        {data.map((dev, rowIndex) => (
          <div
            key={dev.developer}
            className={`grid gap-1 px-4 py-2 ${
              rowIndex !== data.length - 1 ? 'border-b border-rule' : ''
            }`}
            style={{ gridTemplateColumns: `180px repeat(${weekCount}, 1fr)` }}
          >
            <div className="text-sm text-ink flex items-center">{dev.developer}</div>
            {dev.weeks.map((percentage, weekIndex) => (
              <div
                key={weekIndex}
                className={`flex items-center justify-center rounded text-xs font-mono border ${getLoadColor(percentage)}`}
                style={{ minHeight: '32px' }}
              >
                <span className="font-medium">{percentage}%</span>
                {percentage > 100 && (
                  <AlertCircle className="h-3 w-3 ml-1" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-5 gap-3">
        <div className="bg-bg-el-2 border border-rule rounded-sv p-3 text-center">
          <div className="text-xs text-ink-3 mb-1">Avg Utilization</div>
          <div className="text-lg font-display text-ink">
            {Math.round(
              data.reduce((acc, dev) => {
                const avg = dev.weeks.reduce((sum, w) => sum + w, 0) / dev.weeks.length
                return acc + avg
              }, 0) / data.length
            )}%
          </div>
        </div>

        <div className="bg-bg-el-2 border border-rule rounded-sv p-3 text-center">
          <div className="text-xs text-ink-3 mb-1">Overallocated</div>
          <div className="text-lg font-display text-bad">
            {data.reduce((acc, dev) => {
              return acc + dev.weeks.filter(w => w > 100).length
            }, 0)}
          </div>
        </div>

        <div className="bg-bg-el-2 border border-rule rounded-sv p-3 text-center">
          <div className="text-xs text-ink-3 mb-1">Available Capacity</div>
          <div className="text-lg font-display text-good">
            {data.reduce((acc, dev) => {
              return acc + dev.weeks.filter(w => w <= 60).length
            }, 0)}
          </div>
        </div>

        <div className="bg-bg-el-2 border border-rule rounded-sv p-3 text-center">
          <div className="text-xs text-ink-3 mb-1">At Risk</div>
          <div className="text-lg font-display text-warn">
            {data.reduce((acc, dev) => {
              return acc + dev.weeks.filter(w => w > 85 && w <= 100).length
            }, 0)}
          </div>
        </div>

        <div className="bg-bg-el-2 border border-rule rounded-sv p-3 text-center">
          <div className="text-xs text-ink-3 mb-1">Total Developers</div>
          <div className="text-lg font-display text-ink">{data.length}</div>
        </div>
      </div>
    </div>
  )
}
