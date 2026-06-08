import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import {
  getPullRequests,
  mapPullRequest,
  detectStalePRs,
} from '../../integrations/github/index.js'
import type { PullRequest, GithubSummary } from '@spravio/types'

function parseRepo(githubRepo: string): { owner: string; repo: string } {
  const [owner, repo] = githubRepo.split('/')
  if (!owner || !repo) {
    throw new AppError('INVALID_REPO', `Invalid githubRepo: "${githubRepo}"`, 400)
  }
  return { owner, repo }
}

export const pullRequestService = {
  async listByProject(projectId: string): Promise<PullRequest[]> {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      throw new AppError('PROJECT_NOT_FOUND', `Project ${projectId} not found`, 404)
    }
    if (!project.githubRepo) {
      throw new AppError('GITHUB_NOT_CONNECTED', 'GitHub repository not configured for this project', 400)
    }

    const { owner, repo } = parseRepo(project.githubRepo)
    const rawPRs = await getPullRequests(owner, repo, 'all')

    return rawPRs.map(mapPullRequest)
  },

  async getStats(projectId: string): Promise<GithubSummary> {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      throw new AppError('PROJECT_NOT_FOUND', `Project ${projectId} not found`, 404)
    }
    if (!project.githubRepo) {
      throw new AppError('GITHUB_NOT_CONNECTED', 'GitHub repository not configured for this project', 400)
    }

    const { owner, repo } = parseRepo(project.githubRepo)
    const rawPRs = await getPullRequests(owner, repo, 'all')

    const openPRs = rawPRs.filter((pr) => pr.state === 'open' && !pr.draft)
    const mergedPRs = rawPRs.filter((pr) => pr.merged_at !== null)
    const staleAlerts = detectStalePRs(rawPRs)

    // Average cycle time for merged PRs
    const cycleTimes = mergedPRs
      .filter((pr) => pr.merged_at)
      .map((pr) => {
        const created = new Date(pr.created_at).getTime()
        const merged = new Date(pr.merged_at!).getTime()
        return (merged - created) / (1000 * 60 * 60)
      })

    const avgCycleTimeHours = cycleTimes.length > 0
      ? Math.round((cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) * 10) / 10
      : 0

    return {
      totalPRs: rawPRs.length,
      openPRs: openPRs.length,
      mergedPRs: mergedPRs.length,
      stalePRs: staleAlerts.length,
      avgCycleTimeHours,
    }
  },

  async getStaleAlerts(projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      throw new AppError('PROJECT_NOT_FOUND', `Project ${projectId} not found`, 404)
    }
    if (!project.githubRepo) {
      return []
    }

    const { owner, repo } = parseRepo(project.githubRepo)
    const rawPRs = await getPullRequests(owner, repo, 'open')

    return detectStalePRs(rawPRs)
  },
}
