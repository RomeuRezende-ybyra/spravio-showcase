'use client'

import { Shield } from 'lucide-react'

export default function RisksPage() {
  return (
    <div className="space-y-6">
      {/* Empty State */}
      <div className="bg-bg-el border border-rule rounded-sv py-12 text-center">
        <Shield className="h-12 w-12 text-ink-3 mx-auto mb-3" />
        <p className="text-sm text-ink-2 mb-1">No risks registered</p>
        <p className="text-xs text-ink-3">Risks will be tracked here once added to the project.</p>
      </div>
    </div>
  )
}
