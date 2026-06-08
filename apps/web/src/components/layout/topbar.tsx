'use client'

import { RefreshCw, Bell, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CommandPaletteTrigger } from './command-palette'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface TopbarProps {
  breadcrumbs?: BreadcrumbItem[]
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  lastSync?: Date | string
  showCommandPalette?: boolean
  showNotifications?: boolean
}

export function Topbar({
  breadcrumbs = [],
  title,
  subtitle,
  actions,
  lastSync,
  showCommandPalette = true,
  showNotifications = true,
}: TopbarProps) {
  const formatLastSync = (date: Date | string | undefined) => {
    if (!date) return null
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-rule bg-bg-el px-5">
      {/* Left: Breadcrumbs or Title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-3" />}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-ink-3 hover:text-ink transition-colors truncate"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-ink font-medium truncate">{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>
        ) : title ? (
          <div>
            <h1 className="text-base font-semibold text-ink tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-ink-3">{subtitle}</p>}
          </div>
        ) : null}
      </div>

      {/* Right: Actions, Command Palette, Notifications, Last Sync */}
      <div className="flex items-center gap-3">
        {actions}

        {showCommandPalette && <CommandPaletteTrigger />}

        {showNotifications && (
          <button
            className="relative rounded-sv p-2 text-ink-3 hover:bg-bg-el-2 hover:text-ink transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {/* Notification badge (optional) */}
            {/* <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" /> */}
          </button>
        )}

        {lastSync && (
          <div className="flex items-center gap-1.5 text-xs text-ink-3 border-l border-rule pl-3">
            <RefreshCw className="h-3 w-3" />
            <span>Synced {formatLastSync(lastSync)}</span>
          </div>
        )}
      </div>
    </header>
  )
}

export function SyncButton({
  label = 'Sync',
  onClick,
  loading = false,
}: {
  label?: string
  onClick?: () => void
  loading?: boolean
}) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={loading}
      className="gap-1.5 bg-accent hover:bg-accent-deep text-white"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
      {label}
    </Button>
  )
}
