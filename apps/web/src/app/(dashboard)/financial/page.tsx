'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { BurnByProjectChart } from '@/components/financial/burn-by-project-chart'
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, FileText, Loader2 } from 'lucide-react'

type Period = 'ytd' | 'quarter' | 'month'
type Tab = 'overview' | 'projects' | 'invoices'

interface FinancialData {
  totalRevenue: number
  totalConsumed: number
  totalBilled: number
  overdue: number
  burnByProject: Array<{
    projectName: string
    consumed: number
    budget: number
    health: 'green' | 'yellow' | 'red'
  }>
  projects: Array<{
    id: string
    name: string
    client: string
    budget: number
    consumed: number
    billed: number
    margin: number
    health: 'green' | 'yellow' | 'red'
    currency: string
  }>
}

export default function FinancialPage() {
  const [period, setPeriod] = useState<Period>('ytd')
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFinancial() {
      try {
        const res = await fetch('/api/financial')
        const json = await res.json()
        if (json.success) {
          setData(json.data)
        }
      } catch (err) {
        console.error('Failed to fetch financial data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFinancial()
  }, [])

  const summary = data ?? {
    totalRevenue: 0,
    totalConsumed: 0,
    totalBilled: 0,
    overdue: 0,
    burnByProject: [],
    projects: [],
  }
  const projects = summary.projects

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Financials</h1>
          <p className="text-sm text-ink-3">Organization-wide financial overview and tracking</p>
        </div>
        <div className="bg-bg-el border border-rule rounded-sv py-16 text-center">
          <Loader2 className="h-8 w-8 text-ink-3 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-ink-2">Loading financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Financials</h1>
          <p className="text-sm text-ink-3">Organization-wide financial overview and tracking</p>
        </div>

        {/* Period Toggle */}
        <div className="flex items-center gap-2 bg-bg-el border border-rule rounded-sv p-1">
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              period === 'month'
                ? 'bg-accent text-white'
                : 'text-ink-3 hover:text-ink'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setPeriod('quarter')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              period === 'quarter'
                ? 'bg-accent text-white'
                : 'text-ink-3 hover:text-ink'
            }`}
          >
            Quarter
          </button>
          <button
            onClick={() => setPeriod('ytd')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              period === 'ytd'
                ? 'bg-accent text-white'
                : 'text-ink-3 hover:text-ink'
            }`}
          >
            YTD
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-rule">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            activeTab === 'overview'
              ? 'text-accent'
              : 'text-ink-3 hover:text-ink'
          }`}
        >
          Overview
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            activeTab === 'projects'
              ? 'text-accent'
              : 'text-ink-3 hover:text-ink'
          }`}
        >
          By Project
          {activeTab === 'projects' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            activeTab === 'invoices'
              ? 'text-accent'
              : 'text-ink-3 hover:text-ink'
          }`}
        >
          Invoices
          {activeTab === 'invoices' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-bg-el border border-rule rounded-sv p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-accent" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Total Revenue</span>
              </div>
              <div className="font-display text-3xl text-accent">
                ${(summary.totalRevenue / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-ink-3 mt-1">Total contracted budget</div>
            </div>

            <div className="bg-bg-el border border-rule rounded-sv p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-warn" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Consumed</span>
              </div>
              <div className="font-display text-3xl text-warn">
                ${(summary.totalConsumed / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-ink-3 mt-1">
                {summary.totalRevenue > 0
                  ? `${Math.round((summary.totalConsumed / summary.totalRevenue) * 100)}% of budget`
                  : '—'}
              </div>
            </div>

            <div className="bg-bg-el border border-rule rounded-sv p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-good" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Billed</span>
              </div>
              <div className="font-display text-3xl text-good">
                ${(summary.totalBilled / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-ink-3 mt-1">
                {summary.totalConsumed > 0
                  ? `${Math.round(((summary.totalBilled - summary.totalConsumed) / summary.totalConsumed) * 100)}% margin`
                  : '—'}
              </div>
            </div>

            <div className="bg-bg-el border border-rule rounded-sv p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-bad" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Remaining</span>
              </div>
              <div className="font-display text-3xl text-ink">
                ${((summary.totalRevenue - summary.totalConsumed) / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-ink-3 mt-1">Budget remaining</div>
            </div>
          </div>

          {/* Burn Chart */}
          <BurnByProjectChart data={summary.burnByProject} />

          {/* Margin Overview */}
          {projects.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg-el border border-rule rounded-sv p-5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-4">Top Margins</h3>
                <div className="space-y-3">
                  {projects
                    .filter((p) => p.margin > 0)
                    .sort((a, b) => b.margin - a.margin)
                    .map((p) => (
                      <div key={p.id} className="flex items-center justify-between">
                        <span className="text-sm text-ink">{p.name}</span>
                        <span className="text-sm font-mono text-good">+${(p.margin / 1000).toFixed(1)}K</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="bg-bg-el border border-rule rounded-sv p-5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-4">Budget Health</h3>
                <div className="space-y-3">
                  {projects.map((p) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          p.health === 'green' ? 'bg-good' :
                          p.health === 'yellow' ? 'bg-warn' : 'bg-bad'
                        }`} />
                        <span className="text-sm text-ink">{p.name}</span>
                      </div>
                      <span className="text-xs font-mono text-ink-2">
                        {p.budget > 0 ? `${Math.round((p.consumed / p.budget) * 100)}%` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* By Project Tab */}
      {activeTab === 'projects' && (
        <div className="bg-bg-el border border-rule rounded-sv p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Financial Performance by Project</span>
            <Badge variant="muted">{projects.length} projects</Badge>
          </h2>

          {projects.length === 0 ? (
            <div className="py-12 text-center">
              <DollarSign className="h-12 w-12 text-ink-3 mx-auto mb-3" />
              <p className="text-sm text-ink-2">No project financial data available</p>
            </div>
          ) : (
            <div className="bg-bg-el-2 border border-rule rounded-sv overflow-hidden">
              <div className="grid grid-cols-[1fr_100px_100px_100px_100px_80px_80px] gap-2 px-4 py-3 bg-bg-el-3 border-b border-rule">
                {['Project', 'Client', 'Budget', 'Consumed', 'Billed', 'Margin', 'Health'].map((h) => (
                  <div key={h} className="text-xs font-mono uppercase tracking-wider text-ink-3">{h}</div>
                ))}
              </div>
              {projects.map((project, index: number) => (
                <div
                  key={project.id}
                  className={`grid grid-cols-[1fr_100px_100px_100px_100px_80px_80px] gap-2 items-center px-4 py-3 transition-colors hover:bg-bg-el ${
                    index !== projects.length - 1 ? 'border-b border-rule' : ''
                  }`}
                >
                  <span className="text-sm text-ink">{project.name}</span>
                  <span className="text-xs text-ink-2">{project.client}</span>
                  <span className="text-xs text-ink-2 font-mono">${(project.budget / 1000).toFixed(0)}K</span>
                  <span className="text-xs text-ink-2 font-mono">${(project.consumed / 1000).toFixed(0)}K</span>
                  <span className="text-xs text-ink-2 font-mono">${(project.billed / 1000).toFixed(0)}K</span>
                  <span className={`text-xs font-medium font-mono ${project.margin >= 0 ? 'text-good' : 'text-bad'}`}>
                    {project.margin >= 0 ? '+' : ''}${(project.margin / 1000).toFixed(0)}K
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    project.health === 'green' ? 'bg-good' :
                    project.health === 'yellow' ? 'bg-warn' : 'bg-bad'
                  }`} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-bg-el border border-rule rounded-sv p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Invoices</span>
            <Badge variant="muted">Coming soon</Badge>
          </h2>

          <div className="py-12 text-center">
            <FileText className="h-12 w-12 text-ink-3 mx-auto mb-3" />
            <p className="text-sm text-ink-2 mb-1">Invoice tracking coming soon</p>
            <p className="text-xs text-ink-3">Connect your billing system to track invoices and payments automatically.</p>
          </div>
        </div>
      )}
    </div>
  )
}
