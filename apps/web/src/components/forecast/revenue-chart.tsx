'use client'

import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'

interface RevenueChartProps {
  data: Array<{
    month: string
    contracted: number
    pipeline: number
    forecast: number
  }>
  horizon: '3m' | '6m' | '12m'
}

export function RevenueChart({ data, horizon }: RevenueChartProps) {
  return (
    <div className="bg-bg-el border border-rule rounded-sv p-5">
      <h3 className="text-sm font-semibold text-ink mb-4">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Revenue Forecast</span>
      </h3>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0 0)" opacity={0.3} />
          <XAxis
            dataKey="month"
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
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />
          <Bar
            dataKey="contracted"
            fill="oklch(0.73 0.17 155)"
            name="Contracted"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="pipeline"
            fill="oklch(0.75 0.15 85)"
            name="Pipeline (weighted)"
            radius={[4, 4, 0, 0]}
            opacity={0.6}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="oklch(0.65 0.25 250)"
            strokeWidth={3}
            dot={{ fill: 'oklch(0.65 0.25 250)', r: 5 }}
            name="Forecast"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Breakdown Table */}
      <div className="mt-6 bg-bg-el-2 border border-rule rounded-sv overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_100px_100px] gap-2 px-4 py-2 bg-bg-el-3 border-b border-rule">
          {['Month', 'Contracted', 'Pipeline', 'Forecast'].map((h) => (
            <div key={h} className="text-xs font-mono uppercase tracking-wider text-ink-3">
              {h}
            </div>
          ))}
        </div>
        {data.map((row, index) => (
          <div
            key={row.month}
            className={`grid grid-cols-[1fr_100px_100px_100px] gap-2 px-4 py-2 ${
              index !== data.length - 1 ? 'border-b border-rule' : ''
            }`}
          >
            <span className="text-sm text-ink">{row.month}</span>
            <span className="text-xs font-mono text-good">
              {row.contracted > 0 ? `$${(row.contracted / 1000).toFixed(0)}K` : '—'}
            </span>
            <span className="text-xs font-mono text-warn">
              ${(row.pipeline / 1000).toFixed(0)}K
            </span>
            <span className="text-xs font-mono text-accent font-medium">
              ${(row.forecast / 1000).toFixed(0)}K
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
