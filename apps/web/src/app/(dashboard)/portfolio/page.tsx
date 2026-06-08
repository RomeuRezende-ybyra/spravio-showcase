'use client'

import { useState, useMemo, useEffect } from 'react'
import { LayoutGrid, LayoutList, FolderOpen, Loader2 } from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { PortfolioKPIs } from '@/components/portfolio/portfolio-kpis'
import { PortfolioFilters } from '@/components/portfolio/portfolio-filters'
import { PortfolioTable } from '@/components/portfolio/portfolio-table'
import { PortfolioCards } from '@/components/portfolio/portfolio-cards'

interface PortfolioData {
  projects: any[]
  kpis: {
    totalProjects: number
    activeBudget: number
    avgBurn: number
    openPRs: number
    avgMargin: number
    avgHealth: number
    burnTimeline: Array<{ spent: number; budget: number }>
  }
}

export default function PortfolioPage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('healthScore')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [view, setView] = useState<'table' | 'cards'>('table')
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const res = await fetch('/api/portfolio')
        const json = await res.json()
        if (json.success) {
          setData(json.data)
        }
      } catch (err) {
        console.error('Failed to fetch portfolio:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPortfolio()
  }, [])

  const allProjects = data?.projects ?? []
  const kpis = data?.kpis ?? {
    totalProjects: 0,
    activeBudget: 0,
    avgBurn: 0,
    openPRs: 0,
    avgMargin: 0,
    avgHealth: 0,
    burnTimeline: [],
  }

  // Filter and search
  const filteredProjects = useMemo(() => {
    let result = [...allProjects]

    if (filter === 'ontrack') result = result.filter((p) => p.health === 'green')
    if (filter === 'risk') result = result.filter((p) => p.health === 'yellow')
    if (filter === 'critical') result = result.filter((p) => p.health === 'red')

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q)
      )
    }

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
  }, [allProjects, filter, search, sortKey, sortDir])

  const chips = [
    { id: 'all', label: 'All', count: allProjects.length },
    { id: 'ontrack', label: 'On Track', count: allProjects.filter((p) => p.health === 'green').length, color: 'green' as const },
    { id: 'risk', label: 'At Risk', count: allProjects.filter((p) => p.health === 'yellow').length, color: 'yellow' as const },
    { id: 'critical', label: 'Critical', count: allProjects.filter((p) => p.health === 'red').length, color: 'red' as const },
  ]

  const handleSort = (key: string) => {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <>
      <Topbar
        breadcrumbs={[{ label: 'Portfolio' }]}
        lastSync={new Date()}
      />

      <main className="flex-1 overflow-y-auto bg-bg">
        <div className="p-5 space-y-4">
          {/* KPI Strip */}
          <PortfolioKPIs data={kpis} />

          {/* Filters */}
          <div className="flex items-center justify-between">
            <PortfolioFilters
              activeFilter={filter}
              onFilterChange={setFilter}
              chips={chips}
              searchValue={search}
              onSearchChange={setSearch}
              onExport={() => alert('Export CSV - TODO')}
              onSync={() => alert('Sync All - TODO')}
            />

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-bg-el border border-rule rounded-sv p-1">
              <button
                onClick={() => setView('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sv-sm text-sm transition-colors ${
                  view === 'table'
                    ? 'bg-bg-el-2 text-ink'
                    : 'text-ink-3 hover:text-ink-2'
                }`}
                title="Table view"
              >
                <LayoutList className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setView('cards')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sv-sm text-sm transition-colors ${
                  view === 'cards'
                    ? 'bg-bg-el-2 text-ink'
                    : 'text-ink-3 hover:text-ink-2'
                }`}
                title="Cards view"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>

          {/* Projects View */}
          {loading ? (
            <div className="bg-bg-el border border-rule rounded-sv py-16 text-center">
              <Loader2 className="h-8 w-8 text-ink-3 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-ink-2">Loading portfolio...</p>
            </div>
          ) : allProjects.length === 0 ? (
            <div className="bg-bg-el border border-rule rounded-sv py-16 text-center">
              <FolderOpen className="h-12 w-12 text-ink-3 mx-auto mb-3" />
              <p className="text-sm text-ink-2 mb-1">No projects in portfolio</p>
              <p className="text-xs text-ink-3">Projects will appear here once created and synced.</p>
            </div>
          ) : view === 'table' ? (
            <PortfolioTable
              projects={filteredProjects}
              onSort={handleSort}
              sortKey={sortKey}
              sortDir={sortDir}
            />
          ) : (
            <PortfolioCards
              projects={filteredProjects.map((p) => ({
                ...p,
                activity: Array.from({ length: 14 }, () => Math.floor(Math.random() * 5)),
              }))}
            />
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
    </>
  )
}
