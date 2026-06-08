'use client'

import { FileText } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="space-y-6">
      {/* Empty State */}
      <div className="bg-bg-el border border-rule rounded-sv py-12 text-center">
        <FileText className="h-12 w-12 text-ink-3 mx-auto mb-3" />
        <p className="text-sm text-ink-2 mb-1">No documents linked</p>
        <p className="text-xs text-ink-3">Link external documents (Notion, Confluence, Figma, Google Docs) to this project.</p>
      </div>
    </div>
  )
}
