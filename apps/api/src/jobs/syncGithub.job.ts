import type { Job } from 'bullmq'
import { prisma } from '../lib/prisma.js'
import {
  getPullRequests,
  getPRReviews,
  getContributorStats,
  extractJiraKeys,
  normalizePRStatus,
  mapGithubDevMetrics,
  calculateDevRating,
} from '../integrations/github/index.js'
import type { GithubReview } from '../integrations/github/index.js'
import type { GithubClientOptions } from '../integrations/github/client.js'
import { readToken } from '../lib/secure-tokens.js'
import { detectAlerts } from './alertDetector.js'

export interface SyncGithubPayload {
  projectId: string
  githubRepo: string // "owner/repo"
}

export async function syncGithubProcessor(job: Job<SyncGithubPayload>) {
  const { projectId, githubRepo } = job.data
  const [owner, repo] = githubRepo.split('/')

  if (!owner || !repo) {
    throw new Error(`Invalid githubRepo format: "${githubRepo}". Expected "owner/repo".`)
  }

  // Get project for tenant isolation
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, organizationId: true },
  })

  if (!project) {
    throw new Error(`Project ${projectId} not found`)
  }

  // Fetch org's OAuth token from DB (falls back to env GITHUB_TOKEN via client)
  const orgSettings = await prisma.organizationSettings.findUnique({
    where: { organizationId: project.organizationId },
    select: { githubToken: true },
  })

  const clientOptions: GithubClientOptions = {}
  if (orgSettings?.githubToken) {
    const decrypted = readToken(orgSettings.githubToken)
    if (decrypted) {
      clientOptions.token = decrypted
    }
  }

  const syncLog = await prisma.syncLog.create({
    data: {
      type: 'GITHUB',
      status: 'RUNNING',
      project: { connect: { id: projectId } },
    },
  })

  const startTime = Date.now()
  let itemsSynced = 0

  try {
    // 1. Fetch all PRs
    const allPRs = await getPullRequests(owner, repo, 'all', clientOptions)
    await job.updateProgress(20)

    // 2. Fetch reviews for each PR (batch)
    const reviewsByPR = new Map<number, GithubReview[]>()
    for (const pr of allPRs) {
      const reviews = await getPRReviews(owner, repo, pr.number, clientOptions)
      reviewsByPR.set(pr.number, reviews)
    }
    await job.updateProgress(40)

    // 3. Link PRs to Jira issues
    const projectIssues = await prisma.issue.findMany({
      where: {
        sprint: {
          projectId,
          project: { organizationId: project.organizationId }  // ✅ Tenant isolation
        }
      },
      select: { id: true, jiraIssueKey: true },
    })

    const issueByKey = new Map(projectIssues.map((i: typeof projectIssues[number]) => [i.jiraIssueKey, i.id]))

    for (const pr of allPRs) {
      const jiraKeys = extractJiraKeys(pr)
      const prStatus = normalizePRStatus(pr)

      for (const key of jiraKeys) {
        const issueId = issueByKey.get(key)
        if (issueId) {
          // ✅ Safe: issueId comes from projectIssues fetched with tenant isolation (line 63-71)
          await prisma.issue.update({
            where: { id: issueId },
            data: {
              linkedPRNumber: pr.number,
              linkedPRStatus: prStatus,
            },
          })
          itemsSynced++
        }
      }
    }
    await job.updateProgress(60)

    // 4. Enrich developer metrics with GitHub data
    const projectDevs = await prisma.projectDeveloper.findMany({
      where: { projectId },
      include: {
        developer: {
          include: {
            issues: {
              where: { sprint: { projectId } },
            },
          },
        },
      },
    })

    // Fetch commits per developer
    const commitCountByLogin = new Map<string, number>()
    const contributorStats = await getContributorStats(owner, repo, clientOptions)
    for (const stat of contributorStats) {
      commitCountByLogin.set(stat.author.login, stat.total)
    }
    await job.updateProgress(70)

    for (const pd of projectDevs) {
      const { developer } = pd
      if (!developer.githubLogin) continue

      const commitCount = commitCountByLogin.get(developer.githubLogin) ?? 0

      const githubMetrics = mapGithubDevMetrics(
        developer.githubLogin,
        allPRs,
        reviewsByPR,
        commitCount,
      )

      // Recalculate rating with GitHub weights
      const issues = developer.issues
      const totalIssues = issues.length
      if (totalIssues === 0) continue

      const doneIssues = issues.filter((i: typeof issues[number]) => i.status === 'DONE')
      const returnedIssues = issues.filter((i: typeof issues[number]) => i.wasReturned)

      const deliveryRate = (doneIssues.length / totalIssues) * 100
      const returnRate = (returnedIssues.length / totalIssues) * 100

      const prMergeRate = githubMetrics.totalPRs > 0
        ? (githubMetrics.mergedPRs / githubMetrics.totalPRs) * 100
        : 100

      // Normalize review contribution (cap at 20 reviews = 100%)
      const reviewContribution = Math.min(100, (githubMetrics.reviewContributions / 20) * 100)

      const rating = calculateDevRating({
        deliveryRate,
        reworkRate: returnRate,
        prMergeRate,
        avgCycleTimeHours: githubMetrics.avgCycleTimeHours,
        reviewContribution,
      })

      await prisma.projectDeveloper.update({
        where: { id: pd.id },
        data: {
          rating: Math.round(rating * 100) / 100,
        },
      })

      itemsSynced++
    }
    await job.updateProgress(90)

    // 5. Update project lastSyncAt
    // ✅ Safe: projectId validated at job start with organizationId
    await prisma.project.update({
      where: { id: projectId },
      data: { lastSyncAt: new Date() },
    })

    // 6. Detect alerts (non-blocking)
    try {
      await detectAlerts(projectId)
    } catch (alertErr) {
      console.error('Alert detection failed:', alertErr)
    }

    // 7. Finalize sync log
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'SUCCESS',
        finishedAt: new Date(),
        durationMs: Date.now() - startTime,
        itemsSynced,
      },
    })

    await job.updateProgress(100)
  } catch (error) {
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        durationMs: Date.now() - startTime,
        itemsSynced,
        errorMsg: error instanceof Error ? error.message : String(error),
      },
    })
    throw error
  }
}
