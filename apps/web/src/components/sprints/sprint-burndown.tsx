'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SprintBurndownProps {
  data: Array<{
    day: string
    ideal: number
    actual: number
  }>
}

export function SprintBurndown({ data }: SprintBurndownProps) {
  return (
    <div className="bg-bg-el border border-rule rounded-sv p-5">
      <h3 className="text-sm font-semibold text-ink mb-4">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Sprint Burndown</span>
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0 0)" opacity={0.3} />
          <XAxis
            dataKey="day"
            tick={{ fill: 'oklch(0.5 0.01 286)', fontSize: 11 }}
            stroke="oklch(0.85 0 0)"
            tickFormatter={(value) => {
              const date = new Date(value)
              return `${date.getMonth() + 1}/${date.getDate()}`
            }}
          />
          <YAxis
            tick={{ fill: 'oklch(0.5 0.01 286)', fontSize: 11 }}
            stroke="oklch(0.85 0 0)"
            label={{ value: 'Points', angle: -90, position: 'insideLeft', fill: 'oklch(0.5 0.01 286)', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.98 0 0)',
              border: '1px solid oklch(0.85 0 0)',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            labelFormatter={(value) => {
              const date = new Date(value as string)
              return date.toLocaleDateString()
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="oklch(0.7 0.01 286)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Ideal"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="oklch(0.65 0.25 250)"
            strokeWidth={3}
            dot={{ fill: 'oklch(0.65 0.25 250)', r: 4 }}
            name="Actual"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
