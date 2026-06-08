import { apiClient } from '@/lib/api/client'
import { EmptyState } from '@/components/shared/empty-state'
import { BudgetGauge } from '@/components/charts/budget-gauge'
import { SprintCostChart } from '@/components/charts/sprint-cost-chart'
import { LogHoursForm } from '@/components/budget/log-hours-form'
import { DollarSign, TrendingUp, TrendingDown, Clock, AlertTriangle, User } from 'lucide-react'

function formatCurrency(value: number) {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

export default async function FinancialsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const [financials, developers, sprints] = await Promise.all([
    apiClient.budget.getFinancials(projectId),
    apiClient.developers.listByProject(projectId).catch(() => []),
    apiClient.sprints.listByProject(projectId).catch(() => []),
  ])

  if (!financials.budget) {
    return (
      <EmptyState
        title="No budget configured"
        description="Set a project budget to start tracking financials. Go to the budget setup or ask your project owner to configure one."
      />
    )
  }

  const { budget, cumulativeCost, budgetRemaining, burnRate, projectedTotal, budgetHealth, consumedPercent, sprintCosts, developerCosts } = financials
  const health = budgetHealth ?? 'green'

  return (
    <div className="flex flex-col gap-6">
      {/* KPI strip */}
      <div className="grid grid-cols-5 gap-4">
        {/* Total Budget */}
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Total Budget</span>
          </div>
          <div className="font-display text-3xl text-accent">{formatCurrency(budget.totalBudget)}</div>
          <div className="text-xs text-ink-3 mt-1">{budget.currency}</div>
        </div>

        {/* Spent */}
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-ink-3" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Spent</span>
          </div>
          <div className={`font-display text-3xl ${
            health === 'red' ? 'text-bad' : health === 'yellow' ? 'text-warn' : 'text-good'
          }`}>
            {formatCurrency(cumulativeCost)}
          </div>
          <div className="text-xs text-ink-3 mt-1">{(consumedPercent ?? 0).toFixed(1)}% consumed</div>
        </div>

        {/* Remaining */}
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-ink-3" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Remaining</span>
          </div>
          <div className={`font-display text-3xl ${
            budgetRemaining != null && budgetRemaining < 0 ? 'text-bad' : 'text-good'
          }`}>
            {formatCurrency(budgetRemaining ?? 0)}
          </div>
          <div className="text-xs text-ink-3 mt-1">
            {budgetRemaining != null && budgetRemaining < 0 ? 'over budget' : 'available'}
          </div>
        </div>

        {/* Burn Rate */}
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Burn Rate</span>
          </div>
          <div className="font-display text-3xl text-ink">
            {burnRate != null ? `$${burnRate.toFixed(0)}` : '—'}
          </div>
          <div className="text-xs text-ink-3 mt-1">per day</div>
        </div>

        {/* Projected Total */}
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-ink-3" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Projected</span>
          </div>
          <div className={`font-display text-3xl ${
            projectedTotal != null && projectedTotal > budget.totalBudget ? 'text-bad' : 'text-ink'
          }`}>
            {projectedTotal != null ? formatCurrency(projectedTotal) : '—'}
          </div>
          <div className={`text-xs mt-1 ${
            projectedTotal != null && projectedTotal > budget.totalBudget ? 'text-warn' : 'text-ink-3'
          }`}>
            {projectedTotal != null && projectedTotal > budget.totalBudget ? 'exceeds budget' : 'at completion'}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-[1fr_300px] gap-4">
        <SprintCostChart
          data={sprintCosts.map((s) => ({ sprintName: s.sprintName, cost: s.cost }))}
          budgetCeiling={budget.totalBudget}
          projectedTotal={projectedTotal}
        />
        <BudgetGauge
          totalBudget={budget.totalBudget}
          consumed={cumulativeCost}
          consumedPercent={consumedPercent ?? 0}
          budgetHealth={health}
          currency={budget.currency}
        />
      </div>

      {/* Developer cost breakdown */}
      {developerCosts.length > 0 && (
        <div className="bg-bg-el border border-rule rounded-sv p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink flex items-center gap-2">
            <User className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Cost per Developer</span>
          </h2>

          <div className="bg-bg-el-2 border border-rule rounded-sv overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_100px_100px] gap-2 px-4 py-3 bg-bg-el-3 border-b border-rule">
              {['Developer', 'Rate', 'Hours', 'Total Cost'].map((h) => (
                <div key={h} className="text-xs font-mono uppercase tracking-wider text-ink-3">
                  {h}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {developerCosts.map((dev, index) => (
              <div
                key={dev.developerId}
                className={`grid grid-cols-[1fr_100px_100px_100px] gap-2 items-center px-4 py-3 transition-colors hover:bg-bg-el ${
                  index !== developerCosts.length - 1 ? 'border-b border-rule' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {dev.avatarUrl ? (
                    <img src={dev.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover border border-rule" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-accent/10 flex items-center justify-center text-xs font-mono text-accent border border-accent/20">
                      {dev.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                  <span className="text-sm text-ink">{dev.name}</span>
                </div>
                <span className="text-xs text-ink-2 font-mono">${dev.hourlyRate}/h</span>
                <span className="text-xs text-ink-2 font-mono">{dev.totalHours.toFixed(1)}h</span>
                <span className="text-xs font-medium text-ink font-mono">
                  ${dev.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}

            {/* Total row */}
            <div className="grid grid-cols-[1fr_100px_100px_100px] gap-2 px-4 py-3 bg-bg-el-3 border-t border-rule">
              <span className="text-xs font-semibold text-ink">Total</span>
              <span />
              <span className="text-xs font-semibold text-ink font-mono">
                {developerCosts.reduce((s, d) => s + d.totalHours, 0).toFixed(1)}h
              </span>
              <span className="text-xs font-semibold text-ink font-mono">
                ${cumulativeCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Manual hours input */}
      <LogHoursForm
        projectId={projectId}
        sprints={sprints.map((s) => ({ id: s.id, name: s.name }))}
        developers={developers.map((d) => ({ developerId: d.developerId, name: d.name }))}
      />
    </div>
  )
}
