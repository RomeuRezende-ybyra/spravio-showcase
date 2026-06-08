'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Loader2, Calendar, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ForecastItem {
  projectId: string
  projectName: string
  projectKey: string | null
  deadline: string | null
  startDate: string | null
  forecast: {
    id: string
    onTimeProbability: number
    predictedEndDate: string | null
    confidence: string
    reasoning: string
    createdAt: string
  } | null
}

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<ForecastItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchForecasts() {
      try {
        const res = await fetch('/api/forecasts')
        const json = await res.json()
        if (json.success) {
          setForecasts(json.data)
        }
      } catch (err) {
        console.error('Failed to fetch forecasts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchForecasts()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Forecast</h1>
          <p className="text-sm text-ink-3">Delivery projections and risk analysis per project</p>
        </div>
        <div className="bg-bg-el border border-rule rounded-sv py-16 text-center">
          <Loader2 className="h-8 w-8 text-ink-3 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-ink-2">Loading forecast data...</p>
        </div>
      </div>
    )
  }

  if (forecasts.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Forecast</h1>
          <p className="text-sm text-ink-3">Delivery projections and risk analysis per project</p>
        </div>
        <div className="bg-bg-el border border-rule rounded-sv py-16 text-center">
          <TrendingUp className="h-12 w-12 text-ink-3 mx-auto mb-3" />
          <p className="text-sm text-ink-2 mb-1">No forecast data yet</p>
          <p className="text-xs text-ink-3">Add projects with budgets and team allocations to generate delivery forecasts.</p>
        </div>
      </div>
    )
  }

  const probColor = (prob: number) => {
    if (prob >= 70) return 'text-good'
    if (prob >= 45) return 'text-warn'
    return 'text-bad'
  }

  const probBg = (prob: number) => {
    if (prob >= 70) return 'bg-good'
    if (prob >= 45) return 'bg-warn'
    return 'bg-bad'
  }

  const confidenceBadge = (conf: string) => {
    if (conf === 'high') return 'success' as const
    if (conf === 'medium') return 'default' as const
    return 'danger' as const
  }

  const daysUntil = (dateStr: string | null) => {
    if (!dateStr) return null
    const diff = new Date(dateStr).getTime() - Date.now()
    return Math.ceil(diff / 86_400_000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Forecast</h1>
        <p className="text-sm text-ink-3">Delivery projections and risk analysis per project</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {forecasts.map((item) => {
          const prob = item.forecast?.onTimeProbability ?? 0
          const deadlineDays = daysUntil(item.deadline)
          const predictedDays = daysUntil(item.forecast?.predictedEndDate ?? null)
          const isLate = deadlineDays !== null && predictedDays !== null && predictedDays > deadlineDays

          return (
            <div key={item.projectId} className="bg-bg-el border border-rule rounded-sv p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-mono text-ink-3">{item.projectKey ?? '—'}</span>
                  <h3 className="text-sm font-semibold text-ink">{item.projectName}</h3>
                </div>
                {item.forecast && (
                  <Badge variant={confidenceBadge(item.forecast.confidence)}>
                    {item.forecast.confidence}
                  </Badge>
                )}
              </div>

              {item.forecast ? (
                <>
                  {/* On-time probability gauge */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-ink-3">On-Time Probability</span>
                      <span className={`font-display text-3xl ${probColor(prob)}`}>{prob}%</span>
                    </div>
                    <div className="h-2 bg-rule rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${probBg(prob)}`}
                        style={{ width: `${prob}%` }}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-2 mb-4">
                    {item.deadline && (
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-ink-3">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Deadline</span>
                        </div>
                        <span className="font-mono text-ink-2">
                          {new Date(item.deadline).toLocaleDateString()}
                          {deadlineDays !== null && (
                            <span className={`ml-1 ${deadlineDays < 30 ? 'text-warn' : 'text-ink-3'}`}>
                              ({deadlineDays}d)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    {item.forecast.predictedEndDate && (
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-ink-3">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>Predicted</span>
                        </div>
                        <span className={`font-mono ${isLate ? 'text-bad' : 'text-good'}`}>
                          {new Date(item.forecast.predictedEndDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Risk indicator */}
                  <div className="flex items-center gap-2 p-2 rounded bg-bg-el-2">
                    {prob >= 70 ? (
                      <CheckCircle2 className="h-4 w-4 text-good flex-shrink-0" />
                    ) : prob >= 45 ? (
                      <Clock className="h-4 w-4 text-warn flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-bad flex-shrink-0" />
                    )}
                    <span className="text-xs text-ink-2">
                      {prob >= 70
                        ? 'On track for delivery'
                        : prob >= 45
                        ? 'At risk — monitor closely'
                        : 'High risk — action needed'}
                    </span>
                  </div>

                  {/* Expand reasoning */}
                  <button
                    onClick={() => setExpandedId(expandedId === item.projectId ? null : item.projectId)}
                    className="mt-3 text-xs text-accent hover:text-accent/80 transition-colors"
                  >
                    {expandedId === item.projectId ? 'Hide analysis' : 'Show analysis'}
                  </button>
                  {expandedId === item.projectId && (
                    <div className="mt-2 p-3 bg-bg-el-2 rounded text-xs text-ink-2 leading-relaxed">
                      {item.forecast.reasoning}
                    </div>
                  )}
                </>
              ) : (
                <div className="py-6 text-center">
                  <TrendingUp className="h-8 w-8 text-ink-3 mx-auto mb-2" />
                  <p className="text-xs text-ink-3">No forecast generated yet</p>
                  <p className="text-xs text-ink-3 mt-1">Requires 3+ completed sprints</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Detailed Table */}
      <div className="bg-bg-el border border-rule rounded-sv overflow-hidden">
        <div className="px-4 py-3 border-b border-rule">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Delivery Timeline Overview</span>
        </div>
        <table className="w-full">
          <thead className="bg-bg-el-2 border-b border-rule">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-mono uppercase tracking-wider text-ink-3">Project</th>
              <th className="px-4 py-2 text-center text-xs font-mono uppercase tracking-wider text-ink-3">On-Time %</th>
              <th className="px-4 py-2 text-center text-xs font-mono uppercase tracking-wider text-ink-3">Confidence</th>
              <th className="px-4 py-2 text-center text-xs font-mono uppercase tracking-wider text-ink-3">Deadline</th>
              <th className="px-4 py-2 text-center text-xs font-mono uppercase tracking-wider text-ink-3">Predicted</th>
              <th className="px-4 py-2 text-center text-xs font-mono uppercase tracking-wider text-ink-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {forecasts.map((item) => {
              const prob = item.forecast?.onTimeProbability ?? 0
              const deadlineDays = daysUntil(item.deadline)
              return (
                <tr key={item.projectId} className="border-b border-rule hover:bg-bg-el-2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm text-ink">{item.projectName}</div>
                    <div className="text-xs text-ink-3">{item.projectKey}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.forecast ? (
                      <span className={`font-mono text-sm font-medium ${probColor(prob)}`}>{prob}%</span>
                    ) : (
                      <span className="text-xs text-ink-3">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.forecast ? (
                      <Badge variant={confidenceBadge(item.forecast.confidence)}>
                        {item.forecast.confidence}
                      </Badge>
                    ) : (
                      <span className="text-xs text-ink-3">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.deadline ? (
                      <div>
                        <div className="text-xs font-mono text-ink-2">{new Date(item.deadline).toLocaleDateString()}</div>
                        {deadlineDays !== null && (
                          <div className={`text-xs ${deadlineDays < 30 ? 'text-warn' : 'text-ink-3'}`}>
                            {deadlineDays}d remaining
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-ink-3">Not set</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.forecast?.predictedEndDate ? (
                      <span className="text-xs font-mono text-ink-2">
                        {new Date(item.forecast.predictedEndDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-3">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.forecast ? (
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        prob >= 70 ? 'bg-good/10 text-good' :
                        prob >= 45 ? 'bg-warn/10 text-warn' : 'bg-bad/10 text-bad'
                      }`}>
                        {prob >= 70 ? 'On Track' : prob >= 45 ? 'At Risk' : 'Critical'}
                      </div>
                    ) : (
                      <span className="text-xs text-ink-3">Pending</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
