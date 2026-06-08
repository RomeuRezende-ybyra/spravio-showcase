'use client'

import { Badge } from '@/components/ui/badge'
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface IntegrationCardProps {
  integration: {
    id: string
    name: string
    vendor: string
    status: 'connected' | 'disconnected' | 'error'
    lastSync: string | null
    eventsLast24h: number
    projectsConnected: number
    logo: string
  }
  onClick: () => void
}

export function IntegrationCard({ integration, onClick }: IntegrationCardProps) {
  const getStatusBadge = () => {
    if (integration.status === 'connected') {
      return (
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3 w-3 text-good" />
          <Badge variant="success" className="text-xs">Connected</Badge>
        </div>
      )
    }
    if (integration.status === 'error') {
      return (
        <div className="flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3 text-bad" />
          <Badge variant="danger" className="text-xs">Error</Badge>
        </div>
      )
    }
    return <Badge variant="muted" className="text-xs">Available</Badge>
  }

  const getRelativeTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never'
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <button
      onClick={onClick}
      className="bg-bg-el border border-rule rounded-sv p-4 hover:border-accent transition-colors text-left w-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
            <span className="text-sm font-bold text-accent">{integration.logo}</span>
          </div>

          {/* Name & Vendor */}
          <div>
            <h3 className="text-sm font-semibold text-ink">{integration.name}</h3>
            <p className="text-xs text-ink-3">{integration.vendor}</p>
          </div>
        </div>

        {/* Status Badge */}
        {getStatusBadge()}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-rule">
        <div>
          <div className="text-xs text-ink-3 mb-0.5">Last Sync</div>
          <div className="text-xs font-medium text-ink flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {getRelativeTime(integration.lastSync)}
          </div>
        </div>

        <div>
          <div className="text-xs text-ink-3 mb-0.5">Events/24h</div>
          <div className="text-xs font-medium text-ink flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {integration.eventsLast24h}
          </div>
        </div>

        <div>
          <div className="text-xs text-ink-3 mb-0.5">Projects</div>
          <div className="text-xs font-medium text-ink">
            {integration.projectsConnected}
          </div>
        </div>
      </div>
    </button>
  )
}
