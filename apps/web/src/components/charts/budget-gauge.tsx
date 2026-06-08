'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const HEALTH_COLORS = {
  green: { bg: 'bg-green-500', text: 'text-green-600', label: 'On Track' },
  yellow: { bg: 'bg-amber-500', text: 'text-amber-600', label: 'Warning' },
  red: { bg: 'bg-red-500', text: 'text-red-600', label: 'Over Budget' },
} as const

export function BudgetGauge({
  totalBudget,
  consumed,
  consumedPercent,
  budgetHealth,
  currency,
}: {
  totalBudget: number
  consumed: number
  consumedPercent: number
  budgetHealth: 'green' | 'yellow' | 'red'
  currency: string
}) {
  const clampedPercent = Math.min(100, consumedPercent)
  const colors = HEALTH_COLORS[budgetHealth]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Budget</CardTitle>
        <CardDescription>
          {currency} {consumed.toLocaleString(undefined, { maximumFractionDigits: 0 })} of{' '}
          {currency} {totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Progress bar */}
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${colors.bg}`}
              style={{ width: `${clampedPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold ${colors.text}`}>
              {consumedPercent.toFixed(1)}%
            </span>
            <span className={`text-xs font-medium ${colors.text}`}>
              {colors.label}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
