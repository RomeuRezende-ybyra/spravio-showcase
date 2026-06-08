import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { GPPortfolio } from '@spravio/types'

interface GPCardProps {
  portfolio: GPPortfolio
}

export function GPCard({ portfolio }: GPCardProps) {
  const initials = portfolio.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs font-bold text-teal-600">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{portfolio.name}</p>
          <p className="text-[10px] text-gray-500">
            {portfolio.totalProjects} project{portfolio.totalProjects !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {portfolio.projects.length === 0 ? (
        <p className="text-xs text-gray-400">No projects assigned</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {portfolio.projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/overview`}
              className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
            >
              <div>
                <p className="text-[12px] font-medium text-gray-800">{project.name}</p>
                <p className="text-[10px] text-gray-400 font-mono">{project.jiraProjectKey ?? project.azureProjectId ?? ''}</p>
              </div>
              <Badge variant={project.isActive ? 'success' : 'muted'} className="text-[10px]">
                {project.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}
