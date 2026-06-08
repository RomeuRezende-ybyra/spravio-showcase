'use client'

import { Badge } from '@/components/ui/badge'
import { CreditCard, Download, Calendar, TrendingUp } from 'lucide-react'

export default function BillingSettingsPage() {
  // TODO: Replace with real API calls
  const usage = {
    current_period: { start: '', end: '' },
    projects: 0,
    users: 0,
    api_calls: 0,
    storage_gb: 0,
    total_amount: 0,
    next_billing_date: '',
  }
  const invoices: any[] = []
  const paymentMethods: any[] = []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Billing & Usage</h1>
        <p className="text-sm text-ink-3">Manage your subscription, invoices, and payment methods</p>
      </div>

      {/* Current Plan */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
              Current Plan
            </span>
          </h2>
          <Badge variant="muted" className="text-xs">No plan selected</Badge>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
              <div className="text-xs text-ink-3 mb-1">Projects</div>
              <div className="text-2xl font-bold text-ink">{usage.projects}</div>
              <div className="text-xs text-ink-3 mt-1">of unlimited</div>
            </div>
            <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
              <div className="text-xs text-ink-3 mb-1">Team Members</div>
              <div className="text-2xl font-bold text-ink">{usage.users}</div>
              <div className="text-xs text-ink-3 mt-1">of unlimited</div>
            </div>
            <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
              <div className="text-xs text-ink-3 mb-1">API Calls</div>
              <div className="text-2xl font-bold text-ink">{usage.api_calls.toLocaleString()}</div>
              <div className="text-xs text-ink-3 mt-1">this month</div>
            </div>
            <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
              <div className="text-xs text-ink-3 mb-1">Storage</div>
              <div className="text-2xl font-bold text-ink">{usage.storage_gb} GB</div>
              <div className="text-xs text-ink-3 mt-1">of 100 GB</div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-rule">
            <button className="px-4 py-2 bg-accent text-white rounded-sv hover:bg-accent/90 transition-colors text-sm font-medium">
              Upgrade Plan
            </button>
            <button className="px-4 py-2 border border-rule rounded-sv hover:bg-bg-el-2 transition-colors text-sm font-medium text-ink">
              Change Plan
            </button>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
              Payment Methods
            </span>
          </h2>
          <button className="px-3 py-1.5 text-xs font-medium text-accent border border-accent rounded-sv hover:bg-accent/10 transition-colors">
            Add New Card
          </button>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="py-8 text-center">
            <CreditCard className="h-10 w-10 text-ink-3 mx-auto mb-2" />
            <p className="text-sm text-ink-3">No payment methods configured</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method: any) => (
              <div key={method.id} className="bg-bg-el-2 border border-rule rounded-sv p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-16 items-center justify-center bg-bg-el-3 border border-rule rounded text-xs font-mono text-ink-3">
                    {method.brand}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink">•••• •••• •••• {method.last4}</div>
                    <div className="text-xs text-ink-3">Expires {method.expiry}</div>
                  </div>
                  {method.isDefault && (
                    <Badge variant="muted" className="text-xs ml-2">Default</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <button className="px-3 py-1.5 text-xs font-medium text-ink-3 hover:text-ink border border-rule rounded-sv hover:bg-bg-el-3 transition-colors">
                      Set as Default
                    </button>
                  )}
                  <button className="px-3 py-1.5 text-xs font-medium text-bad hover:bg-bad/10 border border-rule rounded-sv transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice History */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Invoice History
          </span>
        </h2>

        {invoices.length === 0 ? (
          <div className="py-8 text-center">
            <Calendar className="h-10 w-10 text-ink-3 mx-auto mb-2" />
            <p className="text-sm text-ink-3">No invoices yet</p>
          </div>
        ) : (
          <div className="bg-bg-el-2 border border-rule rounded-sv overflow-hidden">
            <div className="grid grid-cols-[1fr_150px_150px_120px_100px] gap-4 px-4 py-3 bg-bg-el-3 border-b border-rule">
              {['Invoice', 'Date', 'Amount', 'Status', ''].map((h) => (
                <div key={h} className="text-xs font-mono uppercase tracking-wider text-ink-3">{h}</div>
              ))}
            </div>
            {invoices.map((invoice: any, index: number) => (
              <div
                key={invoice.id}
                className={`grid grid-cols-[1fr_150px_150px_120px_100px] gap-4 items-center px-4 py-3 ${
                  index !== invoices.length - 1 ? 'border-b border-rule' : ''
                }`}
              >
                <div className="text-sm font-mono text-ink">{invoice.id}</div>
                <div className="text-sm text-ink-2">{new Date(invoice.date).toLocaleDateString()}</div>
                <div className="text-sm font-medium text-ink">${invoice.amount.toFixed(2)}</div>
                <div>
                  <Badge variant="success" className="text-xs">{invoice.status}</Badge>
                </div>
                <button className="p-2 hover:bg-bg-el-3 rounded transition-colors flex items-center gap-1 text-xs text-accent" title="Download">
                  <Download className="h-3 w-3" />
                  PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Trends */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Usage Trends (Coming Soon)
          </span>
        </h2>
        <div className="text-center py-12 text-ink-3">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Usage trends and analytics will be available here</p>
        </div>
      </div>
    </div>
  )
}
