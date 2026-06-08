'use client'

import { Users } from 'lucide-react'

export default function TeamPage() {
  return (
    <div className="space-y-6">
      {/* Empty State */}
      <div className="bg-bg-el border border-rule rounded-sv py-12 text-center">
        <Users className="h-12 w-12 text-ink-3 mx-auto mb-3" />
        <p className="text-sm text-ink-2 mb-1">No team members yet</p>
        <p className="text-xs text-ink-3">Team members will appear here once assigned to this project.</p>
      </div>
    </div>
  )
}
