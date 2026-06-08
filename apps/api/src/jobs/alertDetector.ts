import { prisma } from '../lib/prisma.js'
import { alertQueue } from './queue.js'
import { getPullRequests, detectStalePRs } from '../integrations/github/index.js'
import type { SlackAlertJob } from '../integrations/slack/types.js'

/** Runs after sync completes — detects alert conditions and enqueues Slack notifications */
export async function detectAlerts(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, githubRepo: true, organizationId: true },
  })
  if (!project) return

  // Check if Slack is configured and active for this project
  const config = await prisma.slackConfig.findUnique({
    where: { projectId },
    include: { project: { select: { organizationId: true } } },  // ✅ Tenant isolation
  })
  if (!config || !config.isActive || config.alertTypes.length === 0) return

  // Validate tenant isolation
  if (config.project.organizationId !== project.organizationId) {
    throw new Error(`SlackConfig organizationId mismatch for project ${projectId}`)
  }

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD for dedup

  // ─── Stale PRs ──────────────────────────────────────────────────────────
  if (config.alertTypes.includes('stale_pr') && project.githubRepo) {
    const [owner, repo] = project.githubRepo.split('/')
    if (owner && repo) {
      const rawPRs = await getPullRequests(owner, repo, 'open')
      const staleAlerts = detectStalePRs(rawPRs)

      for (const alert of staleAlerts) {
        const severity = alert.severity === 'CRITICAL' ? 'critical' as const : 'warning' as const
        await enqueueAlert(projectId, {
          projectId,
          alertType: 'stale_pr',
          severity,
          payload: {
            projectName: project.name,
            message: `PR #${alert.prNumber} has been open for ${alert.openSinceHours}h`,
            details: { prTitle: alert.title, prNumber: alert.prNumber, hoursOpen: alert.openSinceHours },
          },
        }, `stale_pr-${severity}-${alert.prNumber}-${today}`)
      }
    }
  }

  // ─── Sprint health ──────────────────────────────────────────────────────
  if (config.alertTypes.includes('sprint_health')) {
    const activeSprints = await prisma.sprint.findMany({
      where: {
        projectId,
        state: 'ACTIVE',
        endDate: { not: null },
        project: { organizationId: project.organizationId }  // ✅ Tenant isolation
      },
      select: { id: true, name: true, totalPoints: true, completedPoints: true, endDate: true },
    })

    const now = Date.now()
    for (const sprint of activeSprints) {
      if (!sprint.endDate) continue
      const daysRemaining = (new Date(sprint.endDate).getTime() - now) / (1000 * 60 * 60 * 24)
      const completionPercent = sprint.totalPoints > 0
        ? (sprint.completedPoints / sprint.totalPoints) * 100
        : 100

      if (completionPercent < 40 && daysRemaining < 3 && daysRemaining > 0) {
        await enqueueAlert(projectId, {
          projectId,
          alertType: 'sprint_health',
          severity: 'critical',
          payload: {
            projectName: project.name,
            message: `Sprint "${sprint.name}" is at ${completionPercent.toFixed(1)}% with ${daysRemaining.toFixed(1)} days left`,
            details: { sprintName: sprint.name, completionPercent, daysRemaining },
          },
        }, `sprint_health-${sprint.id}-${today}`)
      }
    }
  }

  // ─── Done without code ────────────────────────────────────────────────
  if (config.alertTypes.includes('done_without_code')) {
    const doneWithoutPR = await prisma.issue.findMany({
      where: {
        sprint: {
          projectId,
          project: { organizationId: project.organizationId }  // ✅ Tenant isolation
        },
        status: 'DONE',
        linkedPRNumber: null,
      },
      select: { id: true, jiraIssueKey: true, azureWorkItemId: true, title: true },
    })

    for (const issue of doneWithoutPR) {
      const issueKey = issue.jiraIssueKey ?? (issue.azureWorkItemId ? `#${issue.azureWorkItemId}` : issue.id)
      await enqueueAlert(projectId, {
        projectId,
        alertType: 'done_without_code',
        severity: 'warning',
        payload: {
          projectName: project.name,
          message: `${issueKey} marked DONE with no linked PR`,
          details: { issueKey, issueTitle: issue.title },
        },
      }, `done_without_code-${issue.id}-${today}`)
    }
  }

  // ─── Budget alert ─────────────────────────────────────────────────────
  if (config.alertTypes.includes('budget')) {
    const budget = await prisma.projectBudget.findUnique({
      where: { projectId },
    })

    if (budget) {
      // Calculate spent from developer rates x sprint hours
      const sprintHours = await prisma.sprintHours.findMany({
        where: {
          sprint: { projectId },
        },
      })

      let totalSpent = 0
      for (const sh of sprintHours) {
        const rate = await prisma.developerRate.findFirst({
          where: { developerId: sh.developerId, projectId },
        })
        if (rate) {
          totalSpent += Number(rate.hourlyRate) * Number(sh.hoursLogged)
        }
      }

      const totalBudget = Number(budget.totalBudget)
      const consumedPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

      if (consumedPercent > 80) {
        await enqueueAlert(projectId, {
          projectId,
          alertType: 'budget',
          severity: consumedPercent > 95 ? 'critical' : 'warning',
          payload: {
            projectName: project.name,
            message: `Budget ${consumedPercent.toFixed(1)}% consumed`,
            details: { consumedPercent, totalBudget, spent: totalSpent },
          },
        }, `budget-${today}`)
      }
    }
  }
}

async function enqueueAlert(projectId: string, data: SlackAlertJob, dedupeKey: string) {
  await alertQueue.add('slack-alert', data, {
    jobId: `alert-${projectId}-${dedupeKey}`,
  })
}
