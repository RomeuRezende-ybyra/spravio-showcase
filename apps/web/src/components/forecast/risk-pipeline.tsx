'use client'

import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

interface RiskPipelineProps {
  risks: Array<{
    project: string
    probability: number // 0-100
    impact: 'low' | 'medium' | 'high'
    value: number
  }>
}

function getImpactColor(impact: 'low' | 'medium' | 'high'): string {
  if (impact === 'high') return 'text-bad'
  if (impact === 'medium') return 'text-warn'
  return 'text-good'
}

function getImpactBadge(impact: 'low' | 'medium' | 'high') {
  if (impact === 'high') return <Badge variant="danger" className="text-xs">High</Badge>
  if (impact === 'medium') return <Badge variant="warning" className="text-xs">Medium</Badge>
  return <Badge variant="success" className="text-xs">Low</Badge>
}

export function RiskPipeline({ risks }: RiskPipelineProps) {
  const sortedRisks = [...risks].sort((a, b) => b.probability - a.probability)

  return (
    <div className="bg-bg-el border border-rule rounded-sv p-5">
      <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warn" />
        <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
          Delivery Risk Pipeline
        </span>
      </h3>

      <div className="space-y-3">
        {sortedRisks.map((risk) => {
          const riskScore = (risk.probability / 100) * (risk.impact === 'high' ? 3 : risk.impact === 'medium' ? 2 : 1)
          const barWidth = (risk.probability / 100) * 100

          return (
            <div key={risk.project} className="bg-bg-el-2 border border-rule rounded-sv p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-ink">{risk.project}</span>
                    {getImpactBadge(risk.impact)}
                  </div>
                  <div className="text-xs text-ink-3">
                    ${(risk.value / 1000).toFixed(0)}K at risk · {risk.probability}% probability
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-display ${
                    riskScore >= 2 ? 'text-bad' : riskScore >= 1 ? 'text-warn' : 'text-good'
                  }`}>
                    {riskScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-ink-3">Risk Score</div>
                </div>
              </div>

              {/* Probability Bar */}
              <div className="relative h-6 bg-bg-el-3 border border-rule rounded overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    risk.probability >= 70 ? 'bg-bad' :
                    risk.probability >= 40 ? 'bg-warn' : 'bg-good'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-mono text-ink mix-blend-difference">
                    {risk.probability}% Delivery Probability
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-bg-el-2 border border-rule rounded-sv p-3 text-center">
          <div className="text-xs text-ink-3 mb-1">Total at Risk</div>
          <div className="text-xl font-display text-bad">
            ${(risks.reduce((acc, r) => acc + r.value, 0) / 1000).toFixed(0)}K
          </div>
        </div>

        <div className="bg-bg-el-2 border border-rule rounded-sv p-3 text-center">
          <div className="text-xs text-ink-3 mb-1">High Risk Projects</div>
          <div className="text-xl font-display text-warn">
            {risks.filter(r => r.probability < 50).length}
          </div>
        </div>

        <div className="bg-bg-el-2 border border-rule rounded-sv p-3 text-center">
          <div className="text-xs text-ink-3 mb-1">Avg Probability</div>
          <div className="text-xl font-display text-ink">
            {Math.round(risks.reduce((acc, r) => acc + r.probability, 0) / risks.length)}%
          </div>
        </div>
      </div>
    </div>
  )
}
