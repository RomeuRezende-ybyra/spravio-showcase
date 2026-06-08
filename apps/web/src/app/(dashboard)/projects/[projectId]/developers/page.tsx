import { apiClient } from '@/lib/api/client'
import { Badge } from '@/components/ui/badge'
import { DevCard } from '@/components/shared/dev-card'
import { GithubPlaceholder } from '@/components/shared/github-placeholder'
import { EmptyState } from '@/components/shared/empty-state'
import { UnconfiguredProjectState } from '@/components/projects/unconfigured-project-state'
import { ScoreDots } from '@/components/shared/score-dots'
import { StatusBadge, PRStatusBadge } from '@/components/shared/status-badge'
import { Github, Star, TrendingUp, Code, GitCommit } from 'lucide-react'

export default async function DevelopersPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const [developers, project] = await Promise.all([
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
        pageName="Team Members"
        pageDescription="Connect your issue tracking system to see team members, their performance metrics, and assigned cards."
      />
    )
  }

  if (developers.length === 0) {
    return <EmptyState title="No developers" description="Developers will appear after the first Jira sync." />
  }

  // Show first developer's detail by default
  const selectedDev = developers[0]!
  const cards = await apiClient.developers.getCards(projectId, selectedDev.developerId).catch(() => [])

  return (
    <div className="flex gap-6">
      {/* Dev list */}
      <div className="flex w-64 shrink-0 flex-col gap-3">
        {developers.map((dev) => (
          <DevCard
            key={dev.developerId}
            name={dev.name}
            avatarUrl={dev.avatarUrl}
            rating={dev.rating}
            deliveryRate={dev.deliveryRate}
            returnRate={dev.returnRate}
            totalPoints={dev.totalPoints}
            selected={dev.developerId === selectedDev.developerId}
          />
        ))}
      </div>

      {/* Detail panel */}
      <div className="flex flex-1 flex-col gap-6">
        {/* Header card */}
        <div className="bg-bg-el border border-rule rounded-sv p-5">
          <div className="mb-4 flex items-center gap-4">
            {selectedDev.avatarUrl ? (
              <img src={selectedDev.avatarUrl} alt={selectedDev.name} className="h-14 w-14 rounded-full object-cover border-2 border-accent/20" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-base font-mono text-accent border-2 border-accent/20">
                {selectedDev.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-ink">{selectedDev.name}</h2>
              <p className="text-sm text-ink-3">{selectedDev.totalPoints} points delivered</p>
            </div>
            <div className="flex items-center gap-3">
              <ScoreDots score={selectedDev.rating} />
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-accent fill-accent" />
                  <span className="text-2xl font-display text-accent">{selectedDev.rating.toFixed(1)}</span>
                </div>
                <div className="text-xs text-ink-3">Rating</div>
              </div>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-bg-el-2 border border-rule rounded-sv p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3 w-3 text-good" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Delivery</span>
              </div>
              <div className="font-display text-2xl text-good">{selectedDev.deliveryRate}%</div>
            </div>

            <div className="bg-bg-el-2 border border-rule rounded-sv p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3 w-3 text-warn" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Rework</span>
              </div>
              <div className={`font-display text-2xl ${selectedDev.returnRate > 20 ? 'text-bad' : 'text-warn'}`}>
                {selectedDev.returnRate}%
              </div>
            </div>

            <div className="bg-bg-el-2 border border-rule rounded-sv p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Code className="h-3 w-3 text-accent" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Backend</span>
              </div>
              <div className="font-display text-2xl text-ink">{selectedDev.backendPoints}</div>
            </div>

            <div className="bg-bg-el-2 border border-rule rounded-sv p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Code className="h-3 w-3 text-accent-deep" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Frontend</span>
              </div>
              <div className="font-display text-2xl text-ink">{selectedDev.frontendPoints}</div>
            </div>
          </div>

          {/* GitHub metrics */}
          {selectedDev.githubMetrics ? (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-bg-el-2 border border-rule rounded-sv p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Github className="h-3 w-3 text-ink-3" />
                  <span className="text-xs font-mono uppercase tracking-wider text-ink-3">PRs Merged</span>
                </div>
                <div className="font-display text-2xl text-ink">{selectedDev.githubMetrics.mergedPRs}</div>
              </div>

              <div className="bg-bg-el-2 border border-rule rounded-sv p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <GitCommit className="h-3 w-3 text-ink-3" />
                  <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Commits</span>
                </div>
                <div className="font-display text-2xl text-ink">{selectedDev.githubMetrics.commitCount}</div>
              </div>

              <div className="bg-bg-el-2 border border-rule rounded-sv p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Cycle Time</span>
                </div>
                <div className={`font-display text-2xl ${
                  selectedDev.githubMetrics.avgCycleTimeHours < 24
                    ? 'text-good'
                    : selectedDev.githubMetrics.avgCycleTimeHours <= 48
                    ? 'text-warn'
                    : 'text-bad'
                }`}>
                  {Math.round(selectedDev.githubMetrics.avgCycleTimeHours)}h
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <GithubPlaceholder message="Connect a GitHub repository to see developer metrics." />
            </div>
          )}
        </div>

        {/* Cards assigned */}
        <div className="bg-bg-el border border-rule rounded-sv p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Assigned Cards</span>
            <Badge variant="muted" className="ml-2">{cards.length}</Badge>
          </h3>
          {cards.length === 0 ? (
            <div className="py-12 text-center">
              <Code className="h-12 w-12 text-ink-3 mx-auto mb-3" />
              <p className="text-sm text-ink-3">No cards assigned</p>
            </div>
          ) : (
            <div className="bg-bg-el-2 border border-rule rounded-sv overflow-hidden">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-el ${
                    index !== cards.length - 1 ? 'border-b border-rule' : ''
                  }`}
                >
                  <span className="w-20 text-xs text-ink-3 font-mono">
                    {card.jiraIssueKey ?? (card.azureWorkItemId ? `#${card.azureWorkItemId}` : '—')}
                  </span>
                  <span className="flex-1 truncate text-sm text-ink">{card.title}</span>
                  <span className="text-xs text-ink-2 font-mono">{card.points} pts</span>
                  {card.linkedPRNumber ? (
                    <span className="flex items-center gap-1 text-xs text-ink-2 font-mono">
                      <Github className="h-3 w-3" />#{card.linkedPRNumber}
                    </span>
                  ) : null}
                  {card.linkedPRStatus ? (
                    <PRStatusBadge status={card.linkedPRStatus} />
                  ) : null}
                  <StatusBadge status={card.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
