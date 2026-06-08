'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { BurnByProjectChart } from '@/components/financial/burn-by-project-chart'
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Calendar, FileText } from 'lucide-react'

type Period = 'ytd' | 'quarter' | 'month'
type Tab = 'overview' | 'projects' | 'invoices'

export default function FinancialPage() {
  const [period, setPeriod] = useState<Period>('ytd')
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  // TODO: Replace with real API calls
  const data = {
    totalRevenue: 0,
    totalConsumed: 0,
    totalBilled: 0,
    overdue: 0,
    burnByProject: [] as any[],
    topMargins: { positive: [] as any[], negative: [] as any[] },
  }
  const projects: any[] = []
  const invoices: any[] = []

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
                ${(data.totalRevenue / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-ink-3 mt-1">Year to date</div>
            </div>

            <div className="bg-bg-el border border-rule rounded-sv p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-warn" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Consumed</span>
              </div>
              <div className="font-display text-3xl text-warn">
                ${(data.totalConsumed / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-ink-3 mt-1">—</div>
            </div>

            <div className="bg-bg-el border border-rule rounded-sv p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-good" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Billed</span>
              </div>
              <div className="font-display text-3xl text-good">
                ${(data.totalBilled / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-ink-3 mt-1">—</div>
            </div>

            <div className="bg-bg-el border border-rule rounded-sv p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-bad" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Overdue</span>
              </div>
              <div className="font-display text-3xl text-bad">
                ${(data.overdue / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-ink-3 mt-1">—</div>
            </div>
          </div>

          {/* Burn Chart */}
          <BurnByProjectChart data={data.burnByProject} />

          {/* Empty state for margins */}
          {data.topMargins.positive.length === 0 && data.topMargins.negative.length === 0 && (
            <div className="bg-bg-el border border-rule rounded-sv py-12 text-center">
              <DollarSign className="h-12 w-12 text-ink-3 mx-auto mb-3" />
              <p className="text-sm text-ink-2 mb-1">No financial data yet</p>
              <p className="text-xs text-ink-3">Financial data will appear here once projects have budgets and billing configured.</p>
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
              {projects.map((project: any, index: number) => (
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
            <Badge variant="muted">{invoices.length} total</Badge>
          </h2>

          {invoices.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-ink-3 mx-auto mb-3" />
              <p className="text-sm text-ink-2">No invoices yet</p>
            </div>
          ) : (
            <div className="bg-bg-el-2 border border-rule rounded-sv overflow-hidden">
              <div className="grid grid-cols-[120px_1fr_100px_100px_80px_100px] gap-2 px-4 py-3 bg-bg-el-3 border-b border-rule">
                {['Invoice #', 'Project', 'Amount', 'Due Date', 'Status', 'Paid Date'].map((h) => (
                  <div key={h} className="text-xs font-mono uppercase tracking-wider text-ink-3">{h}</div>
                ))}
              </div>
              {invoices.map((invoice: any, index: number) => (
                <div
                  key={invoice.id}
                  className={`grid grid-cols-[120px_1fr_100px_100px_80px_100px] gap-2 items-center px-4 py-3 transition-colors hover:bg-bg-el ${
                    index !== invoices.length - 1 ? 'border-b border-rule' : ''
                  }`}
                >
                  <span className="text-xs text-ink-2 font-mono">{invoice.invoiceNumber}</span>
                  <span className="text-sm text-ink">{invoice.projectName}</span>
                  <span className="text-xs text-ink font-mono">${(invoice.amount / 1000).toFixed(0)}K</span>
                  <span className="text-xs text-ink-2">{invoice.dueDate}</span>
                  <Badge
                    variant={
                      invoice.status === 'paid' ? 'success' :
                      invoice.status === 'overdue' ? 'danger' : 'default'
                    }
                    className="text-xs"
                  >
                    {invoice.status}
                  </Badge>
                  <span className="text-xs text-ink-3">{invoice.paidDate || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
