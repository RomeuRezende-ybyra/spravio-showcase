'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface ProgressPieProps {
  data: Array<{ name: string; value: number; color: string }>
  centerLabel: string
  title: string
  subtitle: string
  unit?: string
}

export function ProgressPie({ data, centerLabel, title, subtitle, unit = '%' }: ProgressPieProps) {
  const hasData = data.some((d) => d.value > 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <>
            <div className="relative h-24">
              <ResponsiveContainer width="100%" height={96}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={44}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-sm font-bold font-mono text-gray-900">{centerLabel}</span>
              </div>
            </div>
            <div className="mt-2 flex flex-col gap-1">
              {data.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-[10px] text-gray-500">{d.name}</span>
                  </div>
                  <span className="text-[10px] font-bold font-mono" style={{ color: d.color }}>
                    {d.value}{unit}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="py-6 text-center text-sm text-gray-400">No data</p>
        )}
      </CardContent>
    </Card>
  )
}
