'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { LayoutGrid, LayoutList, FolderOpen } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Topbar } from '@/components/layout/topbar'
import { ProjectsFilters } from '@/components/projects/projects-filters'
import { ProjectsTable } from '@/components/projects/projects-table'
import { ProjectsCards } from '@/components/projects/projects-cards'
import { NewProjectModal } from '@/components/projects/new-project-modal'
import { useSearchParams } from 'next/navigation'

export default function ProjectsPage() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [view, setView] = useState<'table' | 'cards'>('table')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('healthScore')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [allProjects, setAllProjects] = useState<any[]>([])
  const [members, setMembers] = useState<Array<{ id: string; name: string; avatarUrl: string | null }>>([])

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      const json = await res.json()
      if (json.success) {
        setAllProjects(json.data)
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
    }
  }, [])

  const loadMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/members')
      const json = await res.json()
      if (json.success) {
        setMembers(json.data)
      }
    } catch (err) {
      console.error('Failed to load members:', err)
    }
  }, [])

  useEffect(() => {
    loadProjects()
    loadMembers()
  }, [loadProjects, loadMembers])

  // Get filters from URL
  const selectedStatus = searchParams.get('status') || 'all'
  const selectedHealth = searchParams.get('health') || 'all'

  // Filter and search
  const filteredProjects = useMemo(() => {
    let result = [...allProjects]

    // Apply status filter
    if (selectedStatus !== 'all') {
      result = result.filter((p) => p.status === selectedStatus)
    }

    // Apply health filter
    if (selectedHealth !== 'all') {
      result = result.filter((p) => p.health === selectedHealth)
    }

    // Apply search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q)
      )
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortKey as keyof typeof a]
      const bVal = b[sortKey as keyof typeof b]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      return 0
    })

    return result
  }, [allProjects, selectedStatus, selectedHealth, search, sortKey, sortDir])

  // Filter options with counts
  const statusOptions = [
    { id: 'all', label: 'All', count: allProjects.length },
    {
      id: 'active',
      label: 'Active',
      count: allProjects.filter((p) => p.status === 'active').length,
    },
    {
      id: 'paused',
      label: 'Paused',
      count: allProjects.filter((p) => p.status === 'paused').length,
    },
    {
      id: 'done',
      label: 'Done',
      count: allProjects.filter((p) => p.status === 'done').length,
    },
    {
      id: 'discovery',
      label: 'Discovery',
      count: allProjects.filter((p) => p.status === 'discovery').length,
    },
  ]

  const healthOptions = [
    { id: 'all', label: 'All', count: allProjects.length },
    {
      id: 'green',
      label: 'Healthy',
      count: allProjects.filter((p) => p.health === 'green').length,
    },
    {
      id: 'yellow',
      label: 'At Risk',
      count: allProjects.filter((p) => p.health === 'yellow').length,
    },
    {
      id: 'red',
      label: 'Critical',
      count: allProjects.filter((p) => p.health === 'red').length,
    },
  ]

  const handleSort = (key: string) => {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleCreateProject = async (data: any) => {
    if (!session?.orgId) return

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        key: data.key || undefined,
        description: data.description || undefined,
        tags: data.tags?.length ? data.tags : undefined,
        contractType: data.contractType || undefined,
        contractValue: data.budget ? Number(data.budget) : undefined,
        estimatedHours: data.hours ? Number(data.hours) : undefined,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
        clientId: data.client || undefined,
        pmId: data.pm || undefined,
        devIds: data.devs?.length ? data.devs : undefined,
        organizationId: session.orgId,
      }),
    })

    const json = await res.json()
    if (!json.success) {
      throw new Error(json.error?.message ?? 'Failed to create project')
    }

    await loadProjects()
  }

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Projects' }]} lastSync={new Date()} />

      <main className="flex-1 overflow-y-auto bg-bg">
        <div className="p-5 space-y-4">
          {/* Filters + View Toggle */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <ProjectsFilters
                searchValue={search}
                onSearchChange={setSearch}
                statusOptions={statusOptions}
                healthOptions={healthOptions}
                onNewProject={() => setNewProjectOpen(true)}
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-bg-el border border-rule rounded-sv p-1">
              <button
                onClick={() => setView('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sv-sm text-sm transition-colors ${
                  view === 'table' ? 'bg-bg-el-2 text-ink' : 'text-ink-3 hover:text-ink-2'
                }`}
                title="Table view"
              >
                <LayoutList className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setView('cards')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sv-sm text-sm transition-colors ${
                  view === 'cards' ? 'bg-bg-el-2 text-ink' : 'text-ink-3 hover:text-ink-2'
                }`}
                title="Cards view"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>

          {/* Projects View */}
          {allProjects.length === 0 ? (
            <div className="bg-bg-el border border-rule rounded-sv py-16 text-center">
              <FolderOpen className="h-12 w-12 text-ink-3 mx-auto mb-3" />
              <p className="text-sm text-ink-2 mb-1">No projects yet</p>
              <p className="text-xs text-ink-3 mb-4">Connect an integration or create your first project to get started.</p>
              <button
                onClick={() => setNewProjectOpen(true)}
                className="px-4 py-2 bg-accent text-white rounded-sv text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                New Project
              </button>
            </div>
          ) : view === 'table' ? (
            <ProjectsTable
              projects={filteredProjects}
              onSort={handleSort}
              sortKey={sortKey}
              sortDir={sortDir}
            />
          ) : (
            <ProjectsCards projects={filteredProjects} />
          )}

          {/* Footer Stats */}
          {allProjects.length > 0 && (
            <div className="flex items-center justify-between text-xs text-ink-3 px-1">
              <span>
                Showing {filteredProjects.length} of {allProjects.length} projects
              </span>
              <span>Last updated: Just now</span>
            </div>
          )}
        </div>
      </main>

      {/* New Project Modal */}
      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onCreate={handleCreateProject}
        data={{
          clients: [],
          pms: members.map((m) => ({ id: m.id, name: m.name })),
          devs: members.map((m) => ({ id: m.id, name: m.name, avatar: m.avatarUrl ?? '' })),
        }}
      />
    </>
  )
}
