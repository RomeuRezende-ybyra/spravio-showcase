import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Topbar, SyncButton } from '@/components/layout/topbar'
import { ProjectTabs } from '@/components/shared/project-tabs'
import { SharePortalButton } from '@/components/shared/share-portal-button'
import { ExportPdfButton } from '@/components/shared/export-pdf-button'
import { apiClient } from '@/lib/api/client'

async function getProject(id: string) {
  try {
    return await apiClient.projects.getById(id)
  } catch {
    return null
  }
}

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const [project, session] = await Promise.all([
    getProject(projectId),
    getServerSession(authOptions),
  ])

  const canExport = session?.orgRole === 'OWNER' || session?.orgRole === 'PROJECT_MANAGER'

  return (
    <>
      <Topbar
        title={project?.name ?? 'Project'}
        subtitle={project ? `${project.jiraProjectKey ?? project.azureProjectId ?? ''}${project.githubRepo ? ` · ${project.githubRepo}` : ''}` : undefined}
        actions={
          <div className="flex items-center gap-2">
            {canExport && <SharePortalButton projectId={projectId} />}
            {canExport && <ExportPdfButton projectId={projectId} />}
            <SyncButton />
          </div>
        }
      />
      <ProjectTabs projectId={projectId} userRole={session?.orgRole} />
      <main className="flex-1 overflow-y-auto p-7">
        {children}
      </main>
    </>
  )
}
