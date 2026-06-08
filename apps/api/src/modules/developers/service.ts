import { prisma } from '../../lib/prisma.js'
import { developerRepository } from './repository.js'
import { AppError } from '../../lib/errors.js'
import {
  getPullRequests,
  getPRReviews,
  getContributorStats,
  mapGithubDevMetrics,
} from '../../integrations/github/index.js'
import type { GithubReview } from '../../integrations/github/index.js'
import type { DeveloperMetrics } from '@spravio/types'

export const developerService = {
  async listByProject(projectId: string): Promise<DeveloperMetrics[]> {
    const devLinks = await developerRepository.findByProjectId(projectId)

    // Check if project has GitHub configured
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { githubRepo: true },
    })

    let githubMetricsMap: Map<string, DeveloperMetrics['githubMetrics']> | null = null

    if (project?.githubRepo) {
      githubMetricsMap = await buildGithubMetricsMap(project.githubRepo, devLinks)
    }

    return devLinks.map((dl: typeof devLinks[number]) => ({
      developerId: dl.developer.id,
      name: dl.developer.name,
      avatarUrl: dl.developer.avatarUrl,
      rating: dl.rating,
      deliveryRate: dl.deliveryRate,
      returnRate: dl.returnRate,
      backendPoints: dl.backendPoints,
      frontendPoints: dl.frontendPoints,
      totalPoints: dl.backendPoints + dl.frontendPoints,
      githubMetrics: dl.developer.githubLogin && githubMetricsMap
        ? githubMetricsMap.get(dl.developer.githubLogin) ?? null
        : null,
    }))
  },

  async getCards(projectId: string, developerId: string) {
    const issues = await developerRepository.findCards(projectId, developerId)

    if (issues.length === 0) {
      // Check if developer exists in project
      const devLinks = await developerRepository.findByProjectId(projectId)
      const exists = devLinks.some((dl: typeof devLinks[number]) => dl.developer.id === developerId)
      if (!exists) {
        throw new AppError('DEVELOPER_NOT_FOUND', `Developer ${developerId} not found in project`, 404)
      }
    }

    return issues.map((issue: typeof issues[number]) => ({
      id: issue.id,
      jiraIssueKey: issue.jiraIssueKey,
      azureWorkItemId: issue.azureWorkItemId,
      title: issue.title,
      points: issue.points,
      issueType: issue.issueType,
      status: issue.status,
      wasReturned: issue.wasReturned,
      developerId: issue.developerId,
      epicId: issue.epicId,
      epicName: issue.epic?.name ?? null,
      linkedPRNumber: issue.linkedPRNumber ?? null,
      linkedPRStatus: issue.linkedPRStatus as 'OPEN' | 'MERGED' | 'CLOSED' | null,
    }))
  },
}

async function buildGithubMetricsMap(
  githubRepo: string,
  devLinks: Awaited<ReturnType<typeof developerRepository.findByProjectId>>,
): Promise<Map<string, DeveloperMetrics['githubMetrics']>> {
  const [owner, repo] = githubRepo.split('/')
  if (!owner || !repo) return new Map()

  try {
    const allPRs = await getPullRequests(owner, repo, 'all')

    // Collect reviews for all PRs
    const reviewsByPR = new Map<number, GithubReview[]>()
    for (const pr of allPRs) {
      const reviews = await getPRReviews(owner, repo, pr.number)
      reviewsByPR.set(pr.number, reviews)
    }

    // Get commit counts
    const commitCountByLogin = new Map<string, number>()
    const contributorStats = await getContributorStats(owner, repo)
    for (const stat of contributorStats) {
      commitCountByLogin.set(stat.author.login, stat.total)
    }

    const map = new Map<string, DeveloperMetrics['githubMetrics']>()

    for (const dl of devLinks) {
      const login = dl.developer.githubLogin
      if (!login) continue

      const metrics = mapGithubDevMetrics(
        login,
        allPRs,
        reviewsByPR,
        commitCountByLogin.get(login) ?? 0,
      )

      map.set(login, metrics)
    }

    return map
  } catch {
    // If GitHub API fails, return empty — don't break the whole endpoint
    return new Map()
  }
}
