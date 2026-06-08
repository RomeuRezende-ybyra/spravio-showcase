'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
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
  LogOut,
  ChevronDown,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  projects?: Array<{
    id: string
    name: string
    jiraProjectKey: string | null
    azureProjectId?: string | null
    healthStatus?: 'green' | 'yellow' | 'red'
  }>
  user?: {
    name: string
    role: string
    avatarUrl: string | null
    organizationName?: string
  }
}

const roleLabels: Record<string, string> = {
  OWNER: 'Owner',
  PROJECT_MANAGER: 'PM',
  VIEWER: 'Viewer',
}

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  roles: string[]
}

const visionNavItems: NavItem[] = [
  { name: 'Portfolio', href: '/portfolio', icon: LayoutDashboard, roles: ['OWNER'] },
  { name: 'Projects', href: '/projects', icon: FolderKanban, roles: ['OWNER', 'PROJECT_MANAGER', 'VIEWER'] },
  { name: 'Sprints', href: '/sprints', icon: Calendar, roles: ['OWNER', 'PROJECT_MANAGER', 'VIEWER'] },
  { name: 'Developers', href: '/developers', icon: Users, roles: ['OWNER', 'PROJECT_MANAGER', 'VIEWER'] },
  { name: 'Pull Requests', href: '/pull-requests', icon: GitPullRequest, roles: ['OWNER', 'PROJECT_MANAGER', 'VIEWER'] },
  { name: 'Financials', href: '/financial', icon: DollarSign, roles: ['OWNER', 'PROJECT_MANAGER'] },
  { name: 'Forecast', href: '/forecast', icon: TrendingUp, roles: ['OWNER', 'PROJECT_MANAGER'] },
]

const operationNavItems: NavItem[] = [
  { name: 'Integrations', href: '/integrations', icon: Plug, roles: ['OWNER', 'PROJECT_MANAGER'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['OWNER'] },
]

export function Sidebar({ projects = [], user }: SidebarProps) {
  const pathname = usePathname()
  const userRole = user?.role ?? 'VIEWER'

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const hasAccess = (roles: string[]) => roles.includes(userRole)

  // Show top 8 projects with health indicators
  const topProjects = projects.slice(0, 8)

  return (
    <aside className="flex w-56 flex-col bg-bg-el border-r border-rule">
      {/* Logo & Org */}
      <div className="border-b border-rule px-3.5 py-3.5">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-deep shadow-sm">
            <TrendingUp className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-base font-bold text-ink tracking-tight">Spravio</span>
        </div>

        {user?.organizationName && (
          <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-sv border border-rule bg-bg-el-2 hover:border-rule-2 transition-colors">
            <span className="text-sm font-medium text-ink-2 truncate">
              {user.organizationName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-ink-3 flex-shrink-0 ml-1" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {/* Vision Section */}
        <div className="mb-4">
          <div className="px-2 py-1.5 text-xs font-mono uppercase tracking-wider text-ink-3">
            Vision
          </div>
          {visionNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const hasAccess = item.roles.includes(userRole)
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={hasAccess ? item.href : '#'}
                className={cn(
                  'mb-0.5 flex items-center gap-2.5 rounded-sv px-2 py-1.5 text-sm font-medium transition-colors',
                  isActive && hasAccess
                    ? 'bg-accent/10 text-ink'
                    : !hasAccess
                    ? 'text-ink-3 opacity-35 cursor-not-allowed'
                    : 'text-ink-2 hover:bg-bg-el-2 hover:text-ink',
                )}
                onClick={(e) => !hasAccess && e.preventDefault()}
                title={!hasAccess ? `Requires ${item.roles.join(' or ')} role` : undefined}
              >
                <Icon className={cn('h-4 w-4', isActive && hasAccess ? 'text-accent' : 'text-ink-3')} />
                <span className="flex-1">{item.name}</span>
                {!hasAccess && <Lock className="h-3 w-3" />}
              </Link>
            )
          })}
        </div>

        {/* Projects Quick List */}
        {topProjects.length > 0 && (
          <div className="mb-4">
            <div className="px-2 py-1.5 text-xs font-mono uppercase tracking-wider text-ink-3">
              Projects
            </div>
            {topProjects.map((project) => {
              const projectPath = `/projects/${project.id}`
              const isActive = pathname.startsWith(projectPath)
              const healthColor =
                project.healthStatus === 'green'
                  ? 'bg-good'
                  : project.healthStatus === 'yellow'
                  ? 'bg-warn'
                  : project.healthStatus === 'red'
                  ? 'bg-bad'
                  : 'bg-ink-3'

              return (
                <Link
                  key={project.id}
                  href={`${projectPath}/overview`}
                  className={cn(
                    'mb-0.5 flex items-center gap-2 rounded-sv px-2 py-1 text-sm transition-colors',
                    isActive
                      ? 'bg-accent/10 text-ink font-medium'
                      : 'text-ink-2 hover:bg-bg-el-2',
                  )}
                >
                  <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', healthColor)} />
                  <span className="font-mono text-xs text-ink-3 w-8 flex-shrink-0">
                    {project.jiraProjectKey ?? project.azureProjectId ?? '—'}
                  </span>
                  <span className="truncate flex-1 text-xs">{project.name}</span>
                </Link>
              )
            })}

            {projects.length > 8 && (
              <Link
                href="/projects"
                className="mt-1 flex items-center justify-center px-2 py-1 text-xs text-ink-3 hover:text-ink-2 transition-colors"
              >
                +{projects.length - 8} more projects
              </Link>
            )}
          </div>
        )}

        {/* Operation Section */}
        <div>
          <div className="px-2 py-1.5 text-xs font-mono uppercase tracking-wider text-ink-3">
            Operation
          </div>
          {operationNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const hasAccess = item.roles.includes(userRole)
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={hasAccess ? item.href : '#'}
                className={cn(
                  'mb-0.5 flex items-center gap-2.5 rounded-sv px-2 py-1.5 text-sm font-medium transition-colors',
                  isActive && hasAccess
                    ? 'bg-accent/10 text-ink'
                    : !hasAccess
                    ? 'text-ink-3 opacity-35 cursor-not-allowed'
                    : 'text-ink-2 hover:bg-bg-el-2 hover:text-ink',
                )}
                onClick={(e) => !hasAccess && e.preventDefault()}
                title={!hasAccess ? `Requires ${item.roles.join(' or ')} role` : undefined}
              >
                <Icon className={cn('h-4 w-4', isActive && hasAccess ? 'text-accent' : 'text-ink-3')} />
                <span className="flex-1">{item.name}</span>
                {!hasAccess && <Lock className="h-3 w-3" />}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Footer */}
      <div className="border-t border-rule p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 text-xs font-bold text-accent flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink truncate">{user?.name ?? 'User'}</p>
              <p className="text-xs text-ink-3">{roleLabels[userRole] ?? 'Member'}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="rounded-sv p-1.5 text-ink-3 hover:bg-bg-el-2 hover:text-ink transition-colors flex-shrink-0"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
