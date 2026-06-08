import { apiClient } from '@/lib/api/client'
import { StatusBadge, PRStatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { UnconfiguredProjectState } from '@/components/projects/unconfigured-project-state'
import { LayoutGrid, CheckCircle2, AlertCircle, TrendingUp, Github } from 'lucide-react'

export default async function SprintPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const [sprintSummary, developers, project] = await Promise.all([
    apiClient.sprints.getCurrent(projectId),
    apiClient.developers.listByProject(projectId),
    apiClient.projects.getById(projectId),
  ])

  // Check if project has source credentials configured
  const hasSourceCredentials =
    (project.source === 'jira' && project.jiraProjectKey) ||
    (project.source === 'azure' && project.azureProjectId)

  if (!hasSourceCredentials) {
    return (
      <UnconfiguredProjectState
        source={project.source}
        pageName="Sprint Details"
        pageDescription="Connect your issue tracking system to see current sprint cards, progress, and assignee details."
      />
    )
  }

  if (!sprintSummary) {
    return <EmptyState title="No active sprint" description="There is no active sprint for this project." />
  }

  const { sprint, totalCards, completedCards, remainingCards, completionPercentage } = sprintSummary

  // Get all cards from all developers
  const allCards = (
    await Promise.all(
      developers.map((dev) =>
        apiClient.developers.getCards(projectId, dev.developerId).catch(() => []),
      ),
    )
  ).flat()

  // Deduplicate by id
  const cardMap = new Map(allCards.map((c) => [c.id, c]))
  const cards = Array.from(cardMap.values())

  return (
    <div className="flex flex-col gap-6">
      {/* Sprint KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <LayoutGrid className="h-4 w-4 text-ink-3" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Total Cards</span>
          </div>
          <div className="font-display text-3xl text-ink">{totalCards}</div>
          <div className="text-xs text-ink-3 mt-1">In sprint</div>
        </div>

        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-good" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Completed</span>
          </div>
          <div className="font-display text-3xl text-good">{completedCards}</div>
          <div className="text-xs text-ink-3 mt-1">Done</div>
        </div>

        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-warn" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Remaining</span>
          </div>
          <div className="font-display text-3xl text-warn">{remainingCards}</div>
          <div className="text-xs text-ink-3 mt-1">To do</div>
        </div>

        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Completion</span>
          </div>
          <div className="font-display text-3xl text-ink">{completionPercentage}%</div>
          <div className={`text-xs mt-1 ${completionPercentage >= 70 ? 'text-good' : 'text-warn'}`}>
            {completionPercentage >= 70 ? 'On track' : 'Needs attention'}
          </div>
        </div>
      </div>

      {/* Sprint info and cards */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">
          {sprint.name}
          <span className="ml-2 text-xs text-ink-3 font-normal">
            {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : ''} —{' '}
            {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : ''}
          </span>
        </h2>

        {cards.length === 0 ? (
          <div className="py-12 text-center">
            <LayoutGrid className="h-12 w-12 text-ink-3 mx-auto mb-3" />
            <p className="text-sm text-ink-3">No cards in this sprint</p>
          </div>
        ) : (
          <div className="bg-bg-el-2 border border-rule rounded-sv overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[70px_1fr_36px_32px_70px_80px_80px] gap-2 px-4 py-3 bg-bg-el-3 border-b border-rule">
              {['Key', 'Title', 'Dev', 'Pts', 'PR #', 'PR Status', 'Status'].map((h) => (
                <div key={h} className="text-xs font-mono uppercase tracking-wider text-ink-3">
                  {h}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {cards.map((card) => {
              const dev = developers.find((d) => d.developerId === card.developerId)
              return (
                <div
                  key={card.id}
                  className="grid grid-cols-[70px_1fr_36px_32px_70px_80px_80px] gap-2 items-center px-4 py-3 border-b border-rule last:border-b-0 transition-colors hover:bg-bg-el"
                >
                  <span className="text-xs text-ink-3 font-mono">
                    {card.jiraIssueKey ?? (card.azureWorkItemId ? `#${card.azureWorkItemId}` : '—')}
                  </span>
                  <span className="truncate text-sm text-ink">{card.title}</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-mono text-accent border border-accent/20">
                    {dev?.name.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? '?'}
                  </div>
                  <span className="text-xs text-ink-2 font-mono">{card.points}</span>
                  {card.linkedPRNumber ? (
                    <span className="flex items-center gap-1 text-xs text-ink-2 font-mono">
                      <Github className="h-3 w-3" />#{card.linkedPRNumber}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-3">—</span>
                  )}
                  {card.linkedPRStatus ? (
                    <PRStatusBadge status={card.linkedPRStatus} />
                  ) : (
                    <span />
                  )}
                  <StatusBadge status={card.status} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
