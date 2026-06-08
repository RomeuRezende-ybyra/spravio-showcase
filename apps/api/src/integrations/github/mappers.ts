import type { GithubPullRequest, GithubReview } from './types.js'

// ─── Jira key extraction ────────────────────────────────────────────────────

const JIRA_KEY_REGEX = /[A-Z][A-Z0-9]+-\d+/g

export function extractJiraKeys(pr: { title: string; head: { ref: string }; body?: string | null }): string[] {
  const sources = [pr.title, pr.head.ref, pr.body ?? ''].join(' ')
  const matches = sources.match(JIRA_KEY_REGEX) ?? []
  return [...new Set(matches)]
}

// ─── PR status normalization ────────────────────────────────────────────────

export type NormalizedPRStatus = 'OPEN' | 'MERGED' | 'CLOSED'

export function normalizePRStatus(pr: { state: string; merged_at: string | null }): NormalizedPRStatus {
  if (pr.merged_at) return 'MERGED'
  if (pr.state === 'closed') return 'CLOSED'
  return 'OPEN'
}

// ─── Stale PR detection ────────────────────────────────────────────────────

export type PRAlertSeverity = 'NONE' | 'WARNING' | 'CRITICAL'

export interface StalePRAlert {
  prNumber: number
  title: string
  authorLogin: string
  jiraKeys: string[]
  openSinceHours: number
  severity: 'WARNING' | 'CRITICAL'
}

export function detectStalePRs(prs: GithubPullRequest[]): StalePRAlert[] {
  const now = Date.now()
  const alerts: StalePRAlert[] = []

  for (const pr of prs) {
    if (pr.state !== 'open' || pr.draft) continue

    const openSinceHours = (now - new Date(pr.created_at).getTime()) / (1000 * 60 * 60)

    if (openSinceHours < 24) continue

    alerts.push({
      prNumber: pr.number,
      title: pr.title,
      authorLogin: pr.user.login,
      jiraKeys: extractJiraKeys(pr),
      openSinceHours: Math.round(openSinceHours),
      severity: openSinceHours > 72 ? 'CRITICAL' : 'WARNING',
    })
  }

  return alerts.sort((a, b) => b.openSinceHours - a.openSinceHours)
}

// ─── PR staleness for a single PR ──────────────────────────────────────────

export function getPRStaleSeverity(pr: GithubPullRequest): PRAlertSeverity {
  if (pr.state !== 'open' || pr.draft) return 'NONE'

  const openSinceHours = (Date.now() - new Date(pr.created_at).getTime()) / (1000 * 60 * 60)

  if (openSinceHours > 72) return 'CRITICAL'
  if (openSinceHours > 24) return 'WARNING'
  return 'NONE'
}

// ─── Developer GitHub metrics ──────────────────────────────────────────────

export interface MappedGithubDevMetrics {
  totalPRs: number
  mergedPRs: number
  avgCycleTimeHours: number
  reviewContributions: number
  commitCount: number
}

export function mapGithubDevMetrics(
  githubLogin: string,
  prs: GithubPullRequest[],
  allReviews: Map<number, GithubReview[]>,
  commitCount: number,
): MappedGithubDevMetrics {
  const authoredPRs = prs.filter((pr) => pr.user.login === githubLogin)
  const mergedPRs = authoredPRs.filter((pr) => pr.merged_at !== null)

  // Average cycle time for merged PRs
  const cycleTimes = mergedPRs
    .filter((pr) => pr.merged_at)
    .map((pr) => {
      const created = new Date(pr.created_at).getTime()
      const merged = new Date(pr.merged_at!).getTime()
      return (merged - created) / (1000 * 60 * 60)
    })

  const avgCycleTimeHours = cycleTimes.length > 0
    ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length
    : 0

  // Count reviews given by this developer on other people's PRs
  let reviewContributions = 0
  for (const [, reviews] of allReviews) {
    reviewContributions += reviews.filter((r) => r.user.login === githubLogin).length
  }

  return {
    totalPRs: authoredPRs.length,
    mergedPRs: mergedPRs.length,
    avgCycleTimeHours: Math.round(avgCycleTimeHours * 10) / 10,
    reviewContributions,
    commitCount,
  }
}

// ─── Updated developer rating formula (Jira + GitHub) ──────────────────────

export function calculateDevRating(params: {
  deliveryRate: number       // 0–100 from Jira
  reworkRate: number          // 0–100 from Jira
  prMergeRate: number         // mergedPRs / totalPRs * 100
  avgCycleTimeHours: number   // lower = better, benchmark = 48h
  reviewContribution: number  // normalized 0–100
}): number {
  const { deliveryRate, reworkRate, prMergeRate, avgCycleTimeHours, reviewContribution } = params

  const w = { delivery: 0.35, rework: 0.25, prMerge: 0.20, cycleTime: 0.10, review: 0.10 }

  // Normalize cycle time: 0h = 100pts, 48h+ = 0pts, linear
  const cycleScore = Math.max(0, 100 - (avgCycleTimeHours / 48) * 100)

  const score =
    deliveryRate * w.delivery +
    (100 - reworkRate) * w.rework +
    prMergeRate * w.prMerge +
    cycleScore * w.cycleTime +
    reviewContribution * w.review

  return Math.round((score / 20) * 10) / 10 // scale to 0–5
}

// ─── Map a raw GithubPullRequest to our internal PullRequest shape ─────────

export interface MappedPullRequest {
  id: string
  number: number
  title: string
  status: NormalizedPRStatus
  authorLogin: string
  jiraKeys: string[]
  cycleTimeHours: number | null
  isStale: boolean
  staleSeverity: PRAlertSeverity
  createdAt: string
  mergedAt: string | null
  closedAt: string | null
}

export function mapPullRequest(pr: GithubPullRequest): MappedPullRequest {
  const status = normalizePRStatus(pr)
  const staleSeverity = getPRStaleSeverity(pr)

  let cycleTimeHours: number | null = null
  if (pr.merged_at) {
    const created = new Date(pr.created_at).getTime()
    const merged = new Date(pr.merged_at).getTime()
    cycleTimeHours = Math.round(((merged - created) / (1000 * 60 * 60)) * 10) / 10
  }

  return {
    id: String(pr.id),
    number: pr.number,
    title: pr.title,
    status,
    authorLogin: pr.user.login,
    jiraKeys: extractJiraKeys(pr),
    cycleTimeHours,
    isStale: staleSeverity !== 'NONE',
    staleSeverity,
    createdAt: pr.created_at,
    mergedAt: pr.merged_at,
    closedAt: pr.closed_at,
  }
}
