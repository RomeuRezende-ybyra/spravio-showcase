'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface BurnByProjectChartProps {
  data: Array<{
    projectName: string
    consumed: number
    budget: number
    health: 'green' | 'yellow' | 'red'
  }>
}

const HEALTH_COLORS = {
  green: 'oklch(0.73 0.17 155)',  // --good
  yellow: 'oklch(0.75 0.15 85)',  // --warn
  red: 'oklch(0.65 0.22 25)',     // --bad
}

export function BurnByProjectChart({ data }: BurnByProjectChartProps) {
  const chartData = data.map((item) => ({
    name: item.projectName,
    consumed: item.consumed,
    budget: item.budget,
    health: item.health,
    remaining: Math.max(0, item.budget - item.consumed),
  }))

  return (
    <div className="bg-bg-el border border-rule rounded-sv p-5">
      <h3 className="text-sm font-semibold text-ink mb-4">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Budget Consumption by Project</span>
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0 0)" opacity={0.3} />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: 'oklch(0.5 0.01 286)', fontSize: 11 }}
            stroke="oklch(0.85 0 0)"
          />
          <YAxis
            tick={{ fill: 'oklch(0.5 0.01 286)', fontSize: 11 }}
            stroke="oklch(0.85 0 0)"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.98 0 0)',
              border: '1px solid oklch(0.85 0 0)',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            formatter={(value) => {
              const num = typeof value === 'number' ? value : 0
              return `$${(num / 1000).toFixed(1)}K`
            }}
          />
          <Bar dataKey="consumed" stackId="a" radius={[0, 0, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={HEALTH_COLORS[entry.health]} />
            ))}
          </Bar>
          <Bar dataKey="remaining" stackId="a" fill="oklch(0.9 0 0)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: HEALTH_COLORS.green }} />
          <span className="text-xs text-ink-3">On budget</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: HEALTH_COLORS.yellow }} />
          <span className="text-xs text-ink-3">Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: HEALTH_COLORS.red }} />
          <span className="text-xs text-ink-3">Over budget</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-bg-el-2 border border-rule" />
          <span className="text-xs text-ink-3">Remaining</span>
        </div>
      </div>
    </div>
  )
}
