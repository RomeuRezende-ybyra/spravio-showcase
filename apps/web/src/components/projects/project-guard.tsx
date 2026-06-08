'use client'

import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/shared/empty-state'
import { Settings, AlertCircle } from 'lucide-react'

interface Project {
  id: string
  name: string
  source: string
  jiraProjectKey: string | null
  azureProjectId: string | null
  githubRepo?: string | null
}

interface ProjectGuardProps {
  project: Project
  children: React.ReactNode
  pageName: string
  pageDescription?: string
}

export function ProjectGuard({ project, children, pageName, pageDescription }: ProjectGuardProps) {
  const router = useRouter()

  const hasSourceCredentials =
    (project.source === 'jira' && project.jiraProjectKey) ||
    (project.source === 'azure' && project.azureProjectId)

  if (!hasSourceCredentials) {
    const sourceLabel = project.source === 'jira' ? 'Jira' : 'Azure DevOps'

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
                Configure your {sourceLabel} connection to start syncing data.
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
            label: 'Configure Integration',
            onClick: () => router.push('/settings/integrations'),
          }}
        />
      </div>
    )
  }

  return <>{children}</>
}
