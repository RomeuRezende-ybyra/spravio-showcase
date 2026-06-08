import { apiClient } from '@/lib/api/client'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { UnconfiguredProjectState } from '@/components/projects/unconfigured-project-state'
import { Layers, Circle } from 'lucide-react'

export default async function BacklogPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const project = await apiClient.projects.getById(projectId)

  const hasSourceCredentials =
    (project.source === 'jira' && project.jiraProjectKey) ||
    (project.source === 'azure' && project.azureProjectId)

  if (!hasSourceCredentials) {
    return (
      <UnconfiguredProjectState
        source={project.source}
        pageName="Backlog"
        pageDescription="Connect your issue tracking system to see all backlog items, epics, and unscheduled work."
      />
    )
  }

  const developers = await apiClient.developers.listByProject(projectId)

  const allCards = (
    await Promise.all(
      developers.map((dev) =>
        apiClient.developers.getCards(projectId, dev.developerId).catch(() => []),
      ),
    )
  ).flat()

  const cardMap = new Map(allCards.map((c) => [c.id, c]))
  const cards = Array.from(cardMap.values())

  // Group by epic
  const epicGroups = new Map<string, { epicName: string; cards: typeof cards }>()
  const unassigned: typeof cards = []

  for (const card of cards) {
    if (card.epicId && card.epicName) {
      const group = epicGroups.get(card.epicId) ?? { epicName: card.epicName, cards: [] }
      group.cards.push(card)
      epicGroups.set(card.epicId, group)
    } else {
      unassigned.push(card)
    }
  }

  const epics = Array.from(epicGroups.entries())

  if (cards.length === 0) {
    return <EmptyState title="Empty backlog" description="No cards found. Sync your project to populate the backlog." />
  }

  return (
    <div className="bg-bg-el border border-rule rounded-sv p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
          <Layers className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Backlog</span>
        </h2>
        <Badge variant="default">{cards.length} cards</Badge>
      </div>

      {epics.map(([epicId, group]) => (
        <div key={epicId} className="mb-4">
          {/* Epic header */}
          <div className="mb-2 flex items-center gap-2 rounded-sv bg-bg-el-2 border border-rule px-4 py-2.5">
            <Circle className="h-3 w-3 text-accent fill-accent" />
            <span className="text-sm font-semibold text-ink">{group.epicName}</span>
            <span className="text-xs text-ink-3">{group.cards.length} cards</span>
          </div>

          {/* Cards under epic */}
          <div className="bg-bg-el-2 border border-rule rounded-sv overflow-hidden">
            {group.cards.map((card, index) => (
              <div
                key={card.id}
                className={`flex items-center justify-between px-4 py-3 pl-8 transition-colors hover:bg-bg-el ${
                  index !== group.cards.length - 1 ? 'border-b border-rule' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-ink-3 font-mono shrink-0">
                    {card.jiraIssueKey ?? (card.azureWorkItemId ? `#${card.azureWorkItemId}` : '—')}
                  </span>
                  <span className="truncate text-sm text-ink">{card.title}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-ink-2 font-mono">{card.points} pts</span>
                  <StatusBadge status={card.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {unassigned.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 rounded-sv bg-bg-el-2 border border-rule px-4 py-2.5">
            <Circle className="h-3 w-3 text-ink-3" />
            <span className="text-sm font-semibold text-ink-2">No Epic</span>
            <span className="text-xs text-ink-3">{unassigned.length} cards</span>
          </div>
          <div className="bg-bg-el-2 border border-rule rounded-sv overflow-hidden">
            {unassigned.map((card, index) => (
              <div
                key={card.id}
                className={`flex items-center justify-between px-4 py-3 pl-8 transition-colors hover:bg-bg-el ${
                  index !== unassigned.length - 1 ? 'border-b border-rule' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-ink-3 font-mono shrink-0">
                    {card.jiraIssueKey ?? (card.azureWorkItemId ? `#${card.azureWorkItemId}` : '—')}
                  </span>
                  <span className="truncate text-sm text-ink">{card.title}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-ink-2 font-mono">{card.points} pts</span>
                  <StatusBadge status={card.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
