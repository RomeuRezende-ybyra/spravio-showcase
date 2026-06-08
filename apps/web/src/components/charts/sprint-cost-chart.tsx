'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface SprintCostData {
  sprintName: string
  cost: number
}

export function SprintCostChart({
  data,
  budgetCeiling,
  projectedTotal,
}: {
  data: SprintCostData[]
  budgetCeiling: number | null
  projectedTotal: number | null
}) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cost per Sprint</CardTitle>
          <CardDescription>No sprint cost data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cost per Sprint</CardTitle>
            <CardDescription>
              {projectedTotal != null
                ? `Projected total: $${projectedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : 'Spending by sprint'}
            </CardDescription>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="h-2.5 w-2.5 rounded-sm bg-teal-500" />
              Cost
            </div>
            {budgetCeiling != null && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="h-0.5 w-3.5 bg-red-400" />
                Budget
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <XAxis
              dataKey="sprintName"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Cost']}
            />
            <Bar dataKey="cost" fill="#0097A7" radius={[4, 4, 0, 0]} />
            {budgetCeiling != null && (
              <ReferenceLine
                y={budgetCeiling / (data.length || 1)}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: 'Avg Budget', position: 'right', fill: '#ef4444', fontSize: 10 }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
