import { prisma } from '../../lib/prisma.js'
import { GitHubPullRequestEventSchema, GitHubPushEventSchema } from './types.js'
import type { GitHubPullRequestEvent, GitHubPushEvent } from './types.js'

/**
 * Handle pull_request events from GitHub
 */
export async function handlePullRequestEvent(payload: unknown, orgId: string): Promise<void> {
  const parsed = GitHubPullRequestEventSchema.safeParse(payload)
  if (!parsed.success) {
    throw new Error(`Invalid pull_request payload: ${parsed.error.message}`)
  }

  const event: GitHubPullRequestEvent = parsed.data
  const repoFullName = event.repository.full_name

  // Find projects in this org linked to this repo
  const projects = await prisma.project.findMany({
    where: {
      organizationId: orgId,
      githubRepo: repoFullName,
    },
    select: { id: true },
  })

  if (projects.length === 0) return

  // Determine PR status
  let prStatus: string
  if (event.pull_request.merged) {
    prStatus = 'MERGED'
  } else if (event.pull_request.state === 'closed') {
    prStatus = 'CLOSED'
  } else {
    prStatus = 'OPEN'
  }

  // Update linked issues with PR info
  for (const project of projects) {
    // Find issues in this project that reference this PR number
    const issues = await prisma.issue.findMany({
      where: {
        sprint: { projectId: project.id },
        linkedPRNumber: event.pull_request.number,
      },
      select: { id: true },
    })

    for (const issue of issues) {
      await prisma.issue.update({
        where: { id: issue.id },
        data: { linkedPRStatus: prStatus },
      })
    }
  }
}

/**
 * Handle push events from GitHub
 * For push events we just record the event — actual sync is handled by the job queue
 */
export async function handlePushEvent(payload: unknown, _orgId: string): Promise<void> {
  const parsed = GitHubPushEventSchema.safeParse(payload)
  if (!parsed.success) {
    throw new Error(`Invalid push payload: ${parsed.error.message}`)
  }

  // Push events are logged for now — they could trigger lightweight sync
  // via BullMQ job in the future
  const _event: GitHubPushEvent = parsed.data
}
