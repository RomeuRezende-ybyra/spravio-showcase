import Link from 'next/link'
import { apiClient } from '@/lib/api/client'
import { KpiCard } from '@/components/shared/kpi-card'
import { DevCard } from '@/components/shared/dev-card'
import { GithubPlaceholder } from '@/components/shared/github-placeholder'
import { EmptyState } from '@/components/shared/empty-state'
import { BurndownChart } from '@/components/charts/burndown-chart'
import { ProgressPie } from '@/components/charts/progress-pie'
import { UnconfiguredProjectState } from '@/components/projects/unconfigured-project-state'
import { LayoutGrid, TrendingUp, GitPullRequest } from 'lucide-react'

export default async function OverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const [overview, project] = await Promise.all([
    apiClient.overview.get(projectId),
    apiClient.projects.getById(projectId),
  ])

  const { currentSprint, developers, progressByStatus, githubSummary, budgetSummary } = overview

  // Check if project has source credentials configured
  const hasSourceCredentials =
    (project.source === 'jira' && project.jiraProjectKey) ||
    (project.source === 'azure' && project.azureProjectId)

  if (!hasSourceCredentials) {
    return (
      <UnconfiguredProjectState
        source={project.source}
        pageName="Sprint Overview"
        pageDescription="Connect your issue tracking system to see sprint progress, burndown charts, and team performance metrics."
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPI strip */}
      <div className="grid grid-cols-5 gap-4">
        {/* Total Cards */}
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <LayoutGrid className="h-4 w-4 text-ink-3" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Cards</span>
          </div>
          <div className="font-display text-3xl text-ink">
            {currentSprint?.totalCards ?? 0}
          </div>
          <div className="text-xs text-ink-3 mt-1">Total sprint</div>
        </div>

        {/* Completed */}
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-good" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Completed</span>
          </div>
          <div className="font-display text-3xl text-good">
            {currentSprint?.completedCards ?? 0}
          </div>
          <div className="text-xs text-ink-3 mt-1">
            {currentSprint ? `${currentSprint.completionPercentage}% done` : '—'}
          </div>
        </div>

        {/* Points */}
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <LayoutGrid className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Points</span>
          </div>
          <div className="font-display text-3xl text-ink">{overview.totalPoints}</div>
          <div className="text-xs text-ink-3 mt-1">
            BE {overview.backendPoints} · FE {overview.frontendPoints}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Progress</span>
          </div>
          <div className="font-display text-3xl text-ink">{overview.overallProgress}%</div>
          <div className={`text-xs mt-1 ${overview.overallProgress >= 70 ? 'text-good' : 'text-warn'}`}>
            {overview.overallProgress >= 70 ? 'On track' : 'Needs attention'}
          </div>
        </div>

        {/* Budget */}
        {budgetSummary ? (
          <div className="bg-bg-el border border-rule rounded-sv p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Budget</span>
            </div>
            <div className="font-display text-xl text-ink">
              ${(budgetSummary.cumulativeCost / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-ink-3 mt-1">
              of ${(budgetSummary.totalBudget / 1000).toFixed(1)}K
            </div>
            <div className={`text-xs mt-1 ${
              budgetSummary.budgetHealth === 'red' ? 'text-bad' :
              budgetSummary.budgetHealth === 'yellow' ? 'text-warn' : 'text-good'
            }`}>
              {budgetSummary.consumedPercent.toFixed(0)}% consumed
            </div>
          </div>
        ) : (
          <Link href={`/projects/${projectId}/financials`}>
            <div className="bg-bg-el border border-rule rounded-sv p-4 hover:border-rule-2 transition-colors h-full">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Budget</span>
              <div className="font-display text-xl text-ink-3 mt-2">Not set</div>
              <div className="text-xs text-accent mt-1">Set up →</div>
            </div>
          </Link>
        )}
      </div>

      {/* GitHub summary strip */}
      {githubSummary ? (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-bg-el border border-rule rounded-sv p-4">
            <div className="flex items-center gap-2 mb-2">
              <GitPullRequest className="h-4 w-4 text-ink-3" />
              <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Open PRs</span>
            </div>
            <div className="font-display text-3xl text-ink">{githubSummary.openPRs}</div>
            <div className="text-xs text-ink-3 mt-1">{githubSummary.mergedPRs} merged</div>
          </div>

          <div className="bg-bg-el border border-rule rounded-sv p-4">
            <div className="flex items-center gap-2 mb-2">
              <GitPullRequest className="h-4 w-4 text-warn" />
              <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Stale PRs</span>
            </div>
            <div className={`font-display text-3xl ${githubSummary.stalePRs > 0 ? 'text-warn' : 'text-good'}`}>
              {githubSummary.stalePRs}
            </div>
            <div className="text-xs text-ink-3 mt-1">Needs attention</div>
          </div>

          <div className="bg-bg-el border border-rule rounded-sv p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Avg Cycle</span>
            </div>
            <div className="font-display text-3xl text-ink">
              {Math.round(githubSummary.avgCycleTimeHours)}h
            </div>
            <div className="text-xs text-ink-3 mt-1">Open → merge</div>
          </div>
        </div>
      ) : (
        <GithubPlaceholder message="Connect a GitHub repository to see PR metrics." />
      )}

      {/* Charts row */}
      <div className="grid grid-cols-[1fr_200px_200px] gap-4">
        <BurndownChart data={currentSprint?.burndown ?? []} />
        <ProgressPie
          title="Progress"
          subtitle="By status"
          centerLabel={`${overview.overallProgress}%`}
          data={[
            { name: 'Done', value: progressByStatus.done, color: 'var(--good)' },
            { name: 'UAT', value: progressByStatus.uat, color: 'var(--accent)' },
            { name: 'Test', value: progressByStatus.test, color: 'var(--accent-deep)' },
            { name: 'In Progress', value: progressByStatus.inProgress, color: 'var(--warn)' },
            { name: 'To Do', value: progressByStatus.todo, color: 'var(--ink-3)' },
          ]}
        />
        <ProgressPie
          title="Points"
          subtitle="By type"
          centerLabel={`${overview.totalPoints}`}
          unit="pts"
          data={[
            { name: 'Backend', value: overview.backendPoints, color: 'var(--accent)' },
            { name: 'Frontend', value: overview.frontendPoints, color: 'var(--accent-deep)' },
          ]}
        />
      </div>

      {/* Team grid */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-ink flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Team Performance</span>
        </h2>
        {developers.length === 0 ? (
          <EmptyState title="No developers" description="Developers will appear after the first Jira sync." />
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {developers.map((dev) => (
              <DevCard
                key={dev.developerId}
                name={dev.name}
                avatarUrl={dev.avatarUrl}
                rating={dev.rating}
                deliveryRate={dev.deliveryRate}
                returnRate={dev.returnRate}
                totalPoints={dev.totalPoints}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
