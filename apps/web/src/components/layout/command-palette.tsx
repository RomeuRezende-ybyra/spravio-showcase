'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  LayoutDashboard,
  FolderKanban,
  GitPullRequest,
  Users,
  DollarSign,
  TrendingUp,
  Plug,
  Settings,
  Calendar,
  Search,
} from 'lucide-react'

interface Project {
  id: string
  name: string
  jiraProjectKey: string | null
  healthStatus?: 'green' | 'yellow' | 'red'
}

interface CommandPaletteProps {
  projects?: Project[]
}

export function CommandPalette({ projects = [] }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  // ⌘K or Ctrl+K to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Esc to close
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const navigate = useCallback(
    (href: string) => {
      setOpen(false)
      setSearch('')
      router.push(href)
    },
    [router]
  )

  if (!open) return null

  const navigationItems = [
    { name: 'Portfolio', href: '/portfolio', icon: LayoutDashboard, category: 'Navigation' },
    { name: 'Projects', href: '/projects', icon: FolderKanban, category: 'Navigation' },
    { name: 'Sprints', href: '/sprints', icon: Calendar, category: 'Navigation' },
    { name: 'Pull Requests', href: '/pull-requests', icon: GitPullRequest, category: 'Navigation' },
    { name: 'Developers', href: '/developers', icon: Users, category: 'Navigation' },
    { name: 'Financials', href: '/financial', icon: DollarSign, category: 'Navigation' },
    { name: 'Forecast', href: '/forecast', icon: TrendingUp, category: 'Navigation' },
    { name: 'Integrations', href: '/integrations', icon: Plug, category: 'Navigation' },
    { name: 'Settings', href: '/settings', icon: Settings, category: 'Navigation' },
  ]

  const projectItems = projects.map((project) => ({
    name: project.name,
    href: `/projects/${project.id}/overview`,
    key: project.jiraProjectKey,
    health: project.healthStatus,
    category: 'Projects',
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm">
      <Command
        className="w-full max-w-2xl bg-bg-el border border-rule-2 rounded-sv shadow-sv overflow-hidden"
        shouldFilter={true}
      >
        <div className="flex items-center border-b border-rule px-4">
          <Search className="h-4 w-4 text-ink-3 mr-3" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search projects, actions, navigation..."
            className="flex-1 bg-transparent border-0 py-4 text-base text-ink placeholder:text-ink-3 outline-none"
          />
          <kbd className="ml-auto">ESC</kbd>
        </div>

        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-ink-3">
            No results found.
          </Command.Empty>

          {projectItems.length > 0 && (
            <Command.Group
              heading="Projects"
              className="mb-2"
            >
              <div className="px-2 py-1.5 text-xs font-mono uppercase tracking-wider text-ink-3">
                Projects
              </div>
              {projectItems.map((item) => (
                <Command.Item
                  key={item.href}
                  onSelect={() => navigate(item.href)}
                  className="flex items-center gap-3 px-3 py-2 rounded-sv-sm cursor-pointer data-[selected=true]:bg-bg-el-2 text-ink-2 data-[selected=true]:text-ink"
                >
                  {item.health && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.health === 'green'
                          ? 'bg-good'
                          : item.health === 'yellow'
                          ? 'bg-warn'
                          : 'bg-bad'
                      }`}
                    />
                  )}
                  <span className="flex-1">{item.name}</span>
                  {item.key && (
                    <span className="font-mono text-xs text-ink-3">{item.key}</span>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Group heading="Navigation">
            <div className="px-2 py-1.5 text-xs font-mono uppercase tracking-wider text-ink-3">
              Navigation
            </div>
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Command.Item
                  key={item.href}
                  onSelect={() => navigate(item.href)}
                  className="flex items-center gap-3 px-3 py-2 rounded-sv-sm cursor-pointer data-[selected=true]:bg-bg-el-2 text-ink-2 data-[selected=true]:text-ink"
                >
                  <Icon className="h-4 w-4 text-ink-3" />
                  <span>{item.name}</span>
                </Command.Item>
              )
            })}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  )
}

export function CommandPaletteTrigger() {
  return (
    <button className="flex items-center gap-2 px-3 py-1.5 rounded-sv border border-rule bg-bg-el-2 text-ink-3 hover:border-rule-2 hover:text-ink-2 transition-colors text-sm">
      <Search className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden sm:inline ml-auto">⌘K</kbd>
    </button>
  )
}
