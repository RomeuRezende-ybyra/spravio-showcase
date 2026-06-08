'use client'

import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/shared/empty-state'
import { Settings, AlertCircle } from 'lucide-react'

interface UnconfiguredProjectStateProps {
  source: string
  pageName: string
  pageDescription?: string
}

export function UnconfiguredProjectState({
  source,
  pageName,
  pageDescription,
}: UnconfiguredProjectStateProps) {
  const router = useRouter()
  const sourceLabel = source === 'jira' ? 'Jira' : 'Azure DevOps'

  return (
    <div className="flex flex-col gap-5">
      {/* Warning banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-900">
              {sourceLabel} connection required
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              This project is configured to use {sourceLabel}, but credentials haven't been set up yet.
              Configure your {sourceLabel} connection in Settings to start syncing data.
            </p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      <EmptyState
        title={`${pageName} requires ${sourceLabel} connection`}
        description={
          pageDescription ||
          `Configure your ${sourceLabel} credentials to sync ${pageName.toLowerCase()} data for this project.`
        }
        icon={Settings}
        action={{
          label: 'Go to Settings',
          onClick: () => router.push('/settings/integrations'),
        }}
      />
    </div>
  )
}
