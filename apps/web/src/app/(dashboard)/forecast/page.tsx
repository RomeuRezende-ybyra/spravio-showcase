'use client'

import { TrendingUp } from 'lucide-react'

export default function ForecastPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Forecast</h1>
        <p className="text-sm text-ink-3">Revenue projections, capacity planning, and risk analysis</p>
      </div>

      {/* Empty State */}
      <div className="bg-bg-el border border-rule rounded-sv py-16 text-center">
        <TrendingUp className="h-12 w-12 text-ink-3 mx-auto mb-3" />
        <p className="text-sm text-ink-2 mb-1">No forecast data yet</p>
        <p className="text-xs text-ink-3">Add projects with budgets and team allocations to generate revenue forecasts.</p>
      </div>
    </div>
  )
}
