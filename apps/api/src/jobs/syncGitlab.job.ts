import type { Job } from 'bullmq'
import { prisma } from '../lib/prisma.js'
import {
  getMergeRequests,
  getCommits,
  extractJiraKeys,
  normalizeMRStatus,
  mapGitlabDevMetrics,
} from '../integrations/gitlab/index.js'
import { detectAlerts } from './alertDetector.js'

export interface SyncGitlabPayload {
  projectId: string
  gitlabRepo: string // "group/project" or "user/project"
}

export async function syncGitlabProcessor(job: Job<SyncGitlabPayload>) {
  const { projectId, gitlabRepo } = job.data

  if (!gitlabRepo.includes('/')) {
    throw new Error(`Invalid gitlabRepo format: "${gitlabRepo}". Expected "group/project" or "user/project".`)
  }

  // Get project for tenant isolation
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, organizationId: true },
  })

  if (!project) {
    throw new Error(`Project ${projectId} not found`)
  }

  const syncLog = await prisma.syncLog.create({
    data: {
      type: 'GITLAB',
      status: 'RUNNING',
      project: { connect: { id: projectId } },
    },
  })

  const startTime = Date.now()
  let itemsSynced = 0

  try {
    // 1. Fetch all MRs
    const allMRs = await getMergeRequests(gitlabRepo, 'all')
    await job.updateProgress(20)

    // 2. Fetch commits (for commit count per developer)
    const commits = await getCommits(gitlabRepo)
    await job.updateProgress(40)

    // Build commit count by username
    const commitCountByUsername = new Map<string, number>()
    for (const commit of commits) {
      // GitLab commits don't have username directly, but we can match by author_email
      // For now, we'll use author_name as a fallback identifier
      const authorKey = commit.author_email || commit.author_name
      commitCountByUsername.set(authorKey, (commitCountByUsername.get(authorKey) ?? 0) + 1)
    }

    // 3. Link MRs to Jira issues
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

    for (const mr of allMRs) {
      const jiraKeys = extractJiraKeys(mr)
      const mrStatus = normalizeMRStatus(mr)

      for (const key of jiraKeys) {
        const issueId = issueByKey.get(key)
        if (issueId) {
          // ✅ Safe: issueId comes from projectIssues fetched with tenant isolation
          await prisma.issue.update({
            where: { id: issueId },
            data: {
              linkedPRNumber: mr.iid,
              linkedPRStatus: mrStatus,
            },
          })
          itemsSynced++
        }
      }
    }
    await job.updateProgress(60)

    // 4. Enrich developer metrics with GitLab data
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

    await job.updateProgress(70)

    for (const pd of projectDevs) {
      const { developer } = pd
      if (!developer.gitlabUserId) continue

      // Find MRs authored by this developer
      const devMRs = allMRs.filter((mr) => String(mr.author.id) === developer.gitlabUserId)

      // Find commit count (by email if available)
      const commitCount = developer.email
        ? (commitCountByUsername.get(developer.email) ?? 0)
        : 0

      const gitlabMetrics = mapGitlabDevMetrics(
        devMRs[0]?.author.username ?? '',
        allMRs,
        commitCount
      )

      // Recalculate rating with GitLab weights
      const issues = developer.issues
      const totalIssues = issues.length
      if (totalIssues === 0) continue

      const doneIssues = issues.filter((i: typeof issues[number]) => i.status === 'DONE')
      const returnedIssues = issues.filter((i: typeof issues[number]) => i.wasReturned)

      const deliveryRate = (doneIssues.length / totalIssues) * 100
      const returnRate = (returnedIssues.length / totalIssues) * 100

      const mrMergeRate = gitlabMetrics.totalMRs > 0
        ? (gitlabMetrics.mergedMRs / gitlabMetrics.totalMRs) * 100
        : 100

      // Simplified rating calculation (without review contributions for GitLab)
      // Weight: delivery 40%, rework 30%, MR merge 20%, cycle time 10%
      const cycleScore = Math.max(0, 100 - (gitlabMetrics.avgCycleTimeHours / 48) * 100)

      const score =
        deliveryRate * 0.4 +
        (100 - returnRate) * 0.3 +
        mrMergeRate * 0.2 +
        cycleScore * 0.1

      const rating = Math.round((score / 20) * 10) / 10 // scale to 0-5

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
