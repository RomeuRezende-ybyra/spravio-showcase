'use client'

import { LayoutDashboard } from 'lucide-react'

export default function SprintsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Sprints</h1>
        <p className="text-sm text-ink-3">Track current sprint progress and manage cards</p>
      </div>

      {/* Empty State */}
      <div className="bg-bg-el border border-rule rounded-sv py-16 text-center">
        <LayoutDashboard className="h-12 w-12 text-ink-3 mx-auto mb-3" />
        <p className="text-sm text-ink-2 mb-1">No sprints yet</p>
        <p className="text-xs text-ink-3">Connect a project management tool (Jira, Linear, Azure DevOps) to sync sprints automatically.</p>
      </div>
    </div>
  )
}
