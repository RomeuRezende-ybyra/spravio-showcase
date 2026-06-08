import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/layout/sidebar'
import { CommandPalette } from '@/components/layout/command-palette'
import { apiClient } from '@/lib/api/client'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

async function getProjects() {
  try {
    return await apiClient.projects.listMine()
  } catch {
    return []
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const projects = await getProjects()

  const projectsWithHealth = projects.map((p) => ({
    id: p.id,
    name: p.name,
    jiraProjectKey: p.jiraProjectKey,
    azureProjectId: p.azureProjectId,
    // TODO: Add health status from backend
    healthStatus: 'green' as const,
  }))

  return (
    <>
      <CommandPalette projects={projectsWithHealth} />
      <div className="flex h-screen overflow-hidden bg-bg">
        <Sidebar
          projects={projectsWithHealth}
          user={session ? {
            name: session.user?.name ?? 'User',
            role: session.orgRole,
            avatarUrl: session.user?.image ?? null,
            organizationName: session.user?.name ?? undefined, // TODO: Get from org
          } : undefined}
        />
        <main className="flex flex-1 flex-col overflow-y-auto bg-bg min-h-0">
          <div className="p-6">
            {children}
          </div>
        </main>

        {/* Show onboarding wizard when no projects */}
        {projects.length === 0 && session?.orgId && (
          <OnboardingWizard orgId={session.orgId} />
        )}
      </div>
    </>
  )
}
