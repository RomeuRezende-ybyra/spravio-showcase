'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const baseTabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'sprint', label: 'Sprint' },
  { key: 'developers', label: 'Developers' },
  { key: 'pullrequests', label: 'Pull Requests' },
  { key: 'backlog', label: 'Backlog' },
  { key: 'time', label: 'Time' },
  { key: 'docs', label: 'Docs' },
  { key: 'team', label: 'Team' },
  { key: 'risks', label: 'Risks' },
  { key: 'activity', label: 'Activity' },
]

export function ProjectTabs({ projectId, userRole }: { projectId: string; userRole?: string }) {
  const pathname = usePathname()

  const isManagerOrOwner = userRole === 'OWNER' || userRole === 'PROJECT_MANAGER'
  const tabs = isManagerOrOwner
    ? [...baseTabs, { key: 'financials', label: 'Financials' }, { key: 'settings', label: 'Settings' }]
    : baseTabs

  return (
    <div className="flex shrink-0 border-b border-rule bg-bg-el px-7 overflow-x-auto">
      {tabs.map((tab) => {
        const href = `/projects/${projectId}/${tab.key}`
        const isActive = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={tab.key}
            href={href}
            className={cn(
              'border-b-2 px-4 py-2.5 text-sm font-medium transition-colors -mb-px whitespace-nowrap',
              isActive
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-3 hover:text-ink-2',
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
