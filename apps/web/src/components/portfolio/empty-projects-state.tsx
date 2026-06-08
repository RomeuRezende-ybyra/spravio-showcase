'use client'

import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/shared/empty-state'

export function EmptyProjectsState() {
  const router = useRouter()

  return (
    <EmptyState
      title="No projects yet"
      description="Connect your Jira or Azure DevOps account to start tracking projects, sprints, and team performance."
      action={{
        label: 'Configure Integrations',
        onClick: () => router.push('/settings/integrations'),
      }}
    />
  )
}
