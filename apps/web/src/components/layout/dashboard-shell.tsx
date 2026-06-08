'use client'

import { ReactNode, useState } from 'react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { CommandPalette } from './command-palette'

interface DashboardShellProps {
  children: ReactNode
  user?: {
    name: string
    role: string
    avatarUrl: string | null
    organizationName?: string
  }
  projects?: Array<{
    id: string
    name: string
    jiraProjectKey: string | null
    azureProjectId?: string | null
    healthStatus?: 'green' | 'yellow' | 'red'
  }>
  breadcrumbs?: Array<{ label: string; href?: string }>
  title?: string
  subtitle?: string
  actions?: ReactNode
  lastSync?: Date | string
  showCommandPalette?: boolean
  showNotifications?: boolean
}

export function DashboardShell({
  children,
  user,
  projects = [],
  breadcrumbs,
  title,
  subtitle,
  actions,
  lastSync,
  showCommandPalette = true,
  showNotifications = true,
}: DashboardShellProps) {
  return (
    <div className="sv-shell grid grid-cols-[224px_1fr] min-h-screen bg-bg">
      {/* Command Palette */}
      <CommandPalette projects={projects} />

      {/* Sidebar */}
      <Sidebar projects={projects} user={user} />

      {/* Main Area */}
      <div className="sv-main flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar
          breadcrumbs={breadcrumbs}
          title={title}
          subtitle={subtitle}
          actions={actions}
          lastSync={lastSync}
          showCommandPalette={showCommandPalette}
          showNotifications={showNotifications}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
