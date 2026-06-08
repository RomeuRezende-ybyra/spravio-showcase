'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface BurndownData {
  date: string
  baselinePoints: number
  actualPoints: number
}

export function BurndownChart({ data }: { data: BurndownData[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sprint Burndown</CardTitle>
          <CardDescription>No burndown data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sprint Burndown</CardTitle>
            <CardDescription>Story points</CardDescription>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="h-0.5 w-3.5 bg-gray-300" />
              Baseline
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="h-0.5 w-3.5 bg-teal-500" />
              Actual
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="baselinePoints"
              stroke="#cbd5e1"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 4"
              name="Baseline"
            />
            <Line
              type="monotone"
              dataKey="actualPoints"
              stroke="#0097A7"
              strokeWidth={2.5}
              dot={{ fill: '#0097A7', r: 3, strokeWidth: 0 }}
              name="Actual"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
