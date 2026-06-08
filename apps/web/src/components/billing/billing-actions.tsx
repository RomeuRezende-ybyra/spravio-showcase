'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { PlanId } from '@spravio/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3010'

const plans: Array<{ id: PlanId; name: string; price: string; features: string }> = [
  { id: 'starter', name: 'Starter', price: '$49/mo', features: '3 projects, 10 devs, 1 GP' },
  { id: 'growth', name: 'Growth', price: '$149/mo', features: '10 projects, 30 devs, 5 GPs' },
  { id: 'scale', name: 'Scale', price: '$399/mo', features: 'Unlimited' },
]

interface BillingActionsProps {
  currentPlanId: PlanId | null
}

export function BillingActions({ currentPlanId }: BillingActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUpgrade(planId: PlanId) {
    setLoading(planId)
    try {
      const res = await fetch(`${API_URL}/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/settings/billing?success=true`,
          cancelUrl: `${window.location.origin}/settings/billing?cancelled=true`,
        }),
      })
      const json = await res.json()
      if (json.success && json.data.url) {
        window.location.href = json.data.url
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(null)
    }
  }

  async function handleManage() {
    setLoading('manage')
    try {
      const res = await fetch(`${API_URL}/billing/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/settings/billing`,
        }),
      })
      const json = await res.json()
      if (json.success && json.data.url) {
        window.location.href = json.data.url
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId
          return (
            <div
              key={plan.id}
              className={`rounded-lg border p-4 ${isCurrent ? 'border-teal-500 bg-teal-50/50' : 'border-gray-200'}`}
            >
              <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
              <p className="text-lg font-bold text-teal-600 mt-1">{plan.price}</p>
              <p className="text-[11px] text-gray-500 mt-1">{plan.features}</p>
              <Button
                size="sm"
                variant={isCurrent ? 'outline' : 'default'}
                className="mt-3 w-full"
                disabled={isCurrent || loading !== null}
                onClick={() => handleUpgrade(plan.id)}
              >
                {loading === plan.id ? 'Loading...' : isCurrent ? 'Current' : 'Upgrade'}
              </Button>
            </div>
          )
        })}
      </div>

      {currentPlanId && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleManage}
          disabled={loading !== null}
        >
          {loading === 'manage' ? 'Loading...' : 'Manage Subscription'}
        </Button>
      )}
    </div>
  )
}
