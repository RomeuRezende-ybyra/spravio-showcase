'use client'

import { GitPullRequest } from 'lucide-react'

export default function PullRequestsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Pull Requests</h1>
        <p className="text-sm text-ink-3">Review and manage pull requests across all projects</p>
      </div>

      {/* Empty State */}
      <div className="bg-bg-el border border-rule rounded-sv py-16 text-center">
        <GitPullRequest className="h-12 w-12 text-ink-3 mx-auto mb-3" />
        <p className="text-sm text-ink-2 mb-1">No pull requests yet</p>
        <p className="text-xs text-ink-3">Connect a code repository (GitHub, GitLab, Bitbucket) to track pull requests automatically.</p>
      </div>
    </div>
  )
}
