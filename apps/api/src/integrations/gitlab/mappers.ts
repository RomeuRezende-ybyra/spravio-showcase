import type { GitLabMergeRequest } from './types.js'

const JIRA_KEY_REGEX = /[A-Z][A-Z0-9]+-\d+/g

export function extractJiraKeys(mr: {
  title: string
  source_branch: string
  description?: string | null
}): string[] {
  const sources = [mr.title, mr.source_branch, mr.description ?? ''].join(' ')
  const matches = sources.match(JIRA_KEY_REGEX) ?? []
  return [...new Set(matches)]
}

export type NormalizedMRStatus = 'OPEN' | 'MERGED' | 'CLOSED'

export function normalizeMRStatus(mr: { state: string; merged_at: string | null }): NormalizedMRStatus {
  if (mr.merged_at || mr.state === 'merged') return 'MERGED'
  if (mr.state === 'closed') return 'CLOSED'
  return 'OPEN'
}

export type MRAlertSeverity = 'NONE' | 'WARNING' | 'CRITICAL'

export interface StaleMRAlert {
  mrNumber: number
  title: string
  authorUsername: string
  jiraKeys: string[]
  openSinceHours: number
  severity: 'WARNING' | 'CRITICAL'
}

export function detectStaleMRs(mrs: GitLabMergeRequest[]): StaleMRAlert[] {
  const now = Date.now()
  const alerts: StaleMRAlert[] = []

  for (const mr of mrs) {
    if (mr.state !== 'opened' || mr.draft) continue

    const openSinceHours = (now - new Date(mr.created_at).getTime()) / (1000 * 60 * 60)

    if (openSinceHours < 24) continue

    alerts.push({
      mrNumber: mr.iid,
      title: mr.title,
      authorUsername: mr.author.username,
      jiraKeys: extractJiraKeys(mr),
      openSinceHours: Math.round(openSinceHours),
      severity: openSinceHours > 72 ? 'CRITICAL' : 'WARNING',
    })
  }

  return alerts.sort((a, b) => b.openSinceHours - a.openSinceHours)
}

export function getMRStaleSeverity(mr: GitLabMergeRequest): MRAlertSeverity {
  if (mr.state !== 'opened' || mr.draft) return 'NONE'

  const openSinceHours = (Date.now() - new Date(mr.created_at).getTime()) / (1000 * 60 * 60)

  if (openSinceHours > 72) return 'CRITICAL'
  if (openSinceHours >= 24) return 'WARNING'
  return 'NONE'
}

export interface MappedMergeRequest {
  id: string
  number: number
  title: string
  status: NormalizedMRStatus
  authorLogin: string
  jiraKeys: string[]
  cycleTimeHours: number | null
  isStale: boolean
  staleSeverity: MRAlertSeverity
  createdAt: string
  mergedAt: string | null
  closedAt: string | null
}

export function mapMergeRequest(mr: GitLabMergeRequest): MappedMergeRequest {
  const status = normalizeMRStatus(mr)
  const staleSeverity = getMRStaleSeverity(mr)

  let cycleTimeHours: number | null = null
  if (mr.merged_at) {
    const created = new Date(mr.created_at).getTime()
    const merged = new Date(mr.merged_at).getTime()
    cycleTimeHours = Math.round(((merged - created) / (1000 * 60 * 60)) * 10) / 10
  }

  return {
    id: String(mr.id),
    number: mr.iid,
    title: mr.title,
    status,
    authorLogin: mr.author.username,
    jiraKeys: extractJiraKeys(mr),
    cycleTimeHours,
    isStale: staleSeverity !== 'NONE',
    staleSeverity,
    createdAt: mr.created_at,
    mergedAt: mr.merged_at,
    closedAt: mr.closed_at,
  }
}

export interface MappedGitlabDevMetrics {
  totalMRs: number
  mergedMRs: number
  avgCycleTimeHours: number
  commitCount: number
}

export function mapGitlabDevMetrics(
  gitlabUsername: string,
  mrs: GitLabMergeRequest[],
  commitCount: number
): MappedGitlabDevMetrics {
  const authoredMRs = mrs.filter((mr) => mr.author.username === gitlabUsername)
  const mergedMRs = authoredMRs.filter((mr) => mr.merged_at !== null)

  const cycleTimes = mergedMRs
    .filter((mr) => mr.merged_at)
    .map((mr) => {
      const created = new Date(mr.created_at).getTime()
      const merged = new Date(mr.merged_at!).getTime()
      return (merged - created) / (1000 * 60 * 60)
    })

  const avgCycleTimeHours =
    cycleTimes.length > 0 ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length : 0

  return {
    totalMRs: authoredMRs.length,
    mergedMRs: mergedMRs.length,
    avgCycleTimeHours: Math.round(avgCycleTimeHours * 10) / 10,
    commitCount,
  }
}
