'use client'

import { TrendingUp, AlertCircle, GitPullRequest, DollarSign, Target } from 'lucide-react'
import { BurnTimeline, RingGauge } from '@/components/charts'

interface KPIData {
  totalProjects: number
  activeBudget: number
  avgBurn: number
  openPRs: number
  avgMargin: number
  avgHealth: number
  burnTimeline?: Array<{ spent: number; budget: number }>
}

interface PortfolioKPIsProps {
  data: KPIData
}

export function PortfolioKPIs({ data }: PortfolioKPIsProps) {
  return (
    <div className="grid grid-cols-6 gap-3">
      {/* Total Projects */}
      <div className="bg-bg-el border border-rule rounded-sv p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Projects
          </span>
          <TrendingUp className="h-3.5 w-3.5 text-ink-3" />
        </div>
        <div className="font-display text-3xl font-normal text-ink tracking-tight">
          {data.totalProjects}
        </div>
        <div className="mt-1 text-xs text-ink-3">Active portfolio</div>
      </div>

      {/* Active Budget */}
      <div className="bg-bg-el border border-rule rounded-sv p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Budget
          </span>
          <DollarSign className="h-3.5 w-3.5 text-ink-3" />
        </div>
        <div className="font-display text-3xl font-normal text-ink tracking-tight">
          ${(data.activeBudget / 1000).toFixed(0)}K
        </div>
        <div className="mt-1 text-xs text-ink-3">Total contracted</div>
      </div>

      {/* Average Burn */}
      <div className="bg-bg-el border border-rule rounded-sv p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Burn Rate
          </span>
          <Target className="h-3.5 w-3.5 text-ink-3" />
        </div>
        <div className="font-display text-3xl font-normal text-ink tracking-tight">
          {data.avgBurn}%
        </div>
        {data.burnTimeline && data.burnTimeline.length > 0 && (
          <div className="mt-2 -mb-1">
            <BurnTimeline data={data.burnTimeline} width={140} height={28} />
          </div>
        )}
      </div>

      {/* Open PRs */}
      <div className="bg-bg-el border border-rule rounded-sv p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Pull Requests
          </span>
          <GitPullRequest className="h-3.5 w-3.5 text-ink-3" />
        </div>
        <div className="font-display text-3xl font-normal text-ink tracking-tight">
          {data.openPRs}
        </div>
        <div className="mt-1 text-xs text-ink-3">Open & pending</div>
      </div>

      {/* Average Margin */}
      <div className="bg-bg-el border border-rule rounded-sv p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Margin
          </span>
          <DollarSign className="h-3.5 w-3.5 text-ink-3" />
        </div>
        <div className="font-display text-3xl font-normal text-accent tracking-tight">
          {data.avgMargin}%
        </div>
        <div className="mt-1 text-xs text-ink-3">Portfolio avg</div>
      </div>

      {/* Health Score */}
      <div className="bg-bg-el border border-rule rounded-sv p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Health
          </span>
          <AlertCircle className="h-3.5 w-3.5 text-ink-3" />
        </div>
        <div className="flex items-center justify-between mt-1">
          <RingGauge value={data.avgHealth} size={56} thickness={6} />
          <div className="text-right">
            <div className="font-display text-2xl font-normal text-ink">
              {data.avgHealth}
            </div>
            <div className="text-xs text-ink-3">Score</div>
          </div>
        </div>
      </div>
    </div>
  )
}
