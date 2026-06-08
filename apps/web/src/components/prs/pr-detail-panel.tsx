'use client'

import { Badge } from '@/components/ui/badge'
import { X, Github, GitMerge, FileText, MessageSquare, User, Calendar, CheckCircle, XCircle } from 'lucide-react'

interface PRDetailPanelProps {
  pr: {
    id: string
    number: number
    title: string
    repo: string
    branch: string
    author: {
      name: string
      login: string
      avatarUrl: string | null
    }
    status: 'open' | 'closed' | 'merged'
    reviewStatus: 'pending' | 'approved' | 'changes-requested'
    ciStatus: 'success' | 'failed' | 'running'
    createdAt: string
    additions: number
    deletions: number
    filesChanged: number
    labels: string[]
    reviewers: Array<{
      name: string
      login: string
      approved: boolean
    }>
  }
  onClose: () => void
}

export function PRDetailPanel({ pr, onClose }: PRDetailPanelProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[600px] bg-bg-el border-l border-rule shadow-2xl z-50 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-rule bg-bg-el-2">
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-accent" />
              <div>
                <h2 className="text-lg font-semibold text-ink">{pr.title}</h2>
                <p className="text-xs text-ink-3">
                  {pr.repo}#{pr.number} · opened by @{pr.author.login}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-bg-el-3 rounded transition-colors"
            >
              <X className="h-5 w-5 text-ink-3" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Metadata */}
            <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
              <h3 className="text-sm font-semibold text-ink mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink-3">Branch</span>
                  <span className="text-ink font-mono text-xs">{pr.branch}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-3">Created</span>
                  <span className="text-ink text-xs">
                    {new Date(pr.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-3">Status</span>
                  <Badge
                    variant={
                      pr.reviewStatus === 'approved' ? 'success' :
                      pr.reviewStatus === 'changes-requested' ? 'warning' : 'muted'
                    }
                    className="text-xs"
                  >
                    {pr.reviewStatus === 'approved' && 'Approved'}
                    {pr.reviewStatus === 'changes-requested' && 'Changes Requested'}
                    {pr.reviewStatus === 'pending' && 'Pending Review'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-3">CI Status</span>
                  <Badge
                    variant={
                      pr.ciStatus === 'success' ? 'success' :
                      pr.ciStatus === 'failed' ? 'danger' : 'default'
                    }
                    className="text-xs"
                  >
                    {pr.ciStatus === 'success' && '✓ Passed'}
                    {pr.ciStatus === 'failed' && '✗ Failed'}
                    {pr.ciStatus === 'running' && '⟳ Running'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Diff Summary */}
            <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
              <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                Changes
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-display text-ink">{pr.filesChanged}</div>
                  <div className="text-xs text-ink-3">Files</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-display text-good">+{pr.additions}</div>
                  <div className="text-xs text-ink-3">Additions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-display text-bad">-{pr.deletions}</div>
                  <div className="text-xs text-ink-3">Deletions</div>
                </div>
              </div>
            </div>

            {/* Reviewers */}
            <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
              <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />
                Reviewers ({pr.reviewers.length})
              </h3>
              {pr.reviewers.length === 0 ? (
                <p className="text-sm text-ink-3">No reviewers assigned yet</p>
              ) : (
                <div className="space-y-2">
                  {pr.reviewers.map((reviewer) => (
                    <div
                      key={reviewer.login}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-mono text-accent border border-accent/20">
                          {reviewer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm text-ink">{reviewer.name}</div>
                          <div className="text-xs text-ink-3">@{reviewer.login}</div>
                        </div>
                      </div>
                      {reviewer.approved ? (
                        <CheckCircle className="h-4 w-4 text-good" />
                      ) : (
                        <XCircle className="h-4 w-4 text-ink-3" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Labels */}
            {pr.labels.length > 0 && (
              <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
                <h3 className="text-sm font-semibold text-ink mb-3">Labels</h3>
                <div className="flex flex-wrap gap-2">
                  {pr.labels.map((label) => (
                    <Badge key={label} variant="muted" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Placeholder */}
            <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
              <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-accent" />
                Comments
              </h3>
              <p className="text-sm text-ink-3">
                No comments yet. Start a conversation!
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-rule bg-bg-el-2">
            <a
              href={`https://github.com/${pr.repo}/pull/${pr.number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-sv hover:bg-accent/90 transition-colors text-sm font-medium"
            >
              <Github className="h-4 w-4" />
              Open in GitHub
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-rule rounded-sv hover:bg-bg-el-3 transition-colors text-sm font-medium text-ink"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
