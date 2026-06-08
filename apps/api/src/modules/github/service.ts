import { prisma } from '../../lib/prisma.js'
import { readToken } from '../../lib/secure-tokens.js'
import { AppError } from '../../lib/errors.js'
import { githubClient } from '../../integrations/github/client.js'
import type { GitHubRepo } from './types.js'

export const githubService = {
  async getOrgToken(orgId: string): Promise<string> {
    const settings = await prisma.organizationSettings.findUnique({
      where: { organizationId: orgId },
      select: { githubToken: true },
    })

    if (!settings?.githubToken) {
      throw new AppError('GITHUB_NOT_CONNECTED', 'GitHub is not connected for this organization', 400)
    }

    const token = readToken(settings.githubToken)
    if (!token) {
      throw new AppError('GITHUB_TOKEN_INVALID', 'GitHub token could not be decrypted', 500)
    }

    return token
  },

  async listRepos(orgId: string): Promise<GitHubRepo[]> {
    const token = await this.getOrgToken(orgId)

    // Get repos accessible by the authenticated user
    const allRepos: GitHubRepo[] = []
    let page = 1

    while (true) {
      const batch = await githubClient.get<GitHubRepo[]>(
        `/user/repos?per_page=100&page=${page}&sort=updated&direction=desc&type=all`,
        { token },
      )
      allRepos.push(...batch)

      if (batch.length < 100) break
      page++
    }

    return allRepos
  },

  async connectRepo(projectId: string, orgId: string, repoFullName: string): Promise<void> {
    // Verify project belongs to org
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId },
    })

    if (!project) {
      throw new AppError('PROJECT_NOT_FOUND', 'Project not found in this organization', 404)
    }

    // Verify repo access
    const token = await this.getOrgToken(orgId)
    const repoRes = await githubClient.get<GitHubRepo>(
      `/repos/${repoFullName}`,
      { token },
    )

    if (!repoRes) {
      throw new AppError('REPO_NOT_FOUND', `Repository "${repoFullName}" not found or not accessible`, 404)
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { githubRepo: repoFullName },
    })
  },

  async disconnectRepo(projectId: string, orgId: string): Promise<void> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId },
    })

    if (!project) {
      throw new AppError('PROJECT_NOT_FOUND', 'Project not found in this organization', 404)
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { githubRepo: null },
    })
  },
}
