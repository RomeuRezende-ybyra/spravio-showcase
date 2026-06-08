'use client'

import { Clock } from 'lucide-react'

export default function TimePage() {
  return (
    <div className="space-y-6">
      {/* Empty State */}
      <div className="bg-bg-el border border-rule rounded-sv py-12 text-center">
        <Clock className="h-12 w-12 text-ink-3 mx-auto mb-3" />
        <p className="text-sm text-ink-2 mb-1">No time entries yet</p>
        <p className="text-xs text-ink-3">Connect a time tracking integration (Tempo, Clockify) to sync time entries.</p>
      </div>
    </div>
  )
}
