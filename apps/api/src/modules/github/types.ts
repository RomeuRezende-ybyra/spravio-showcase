import { z } from 'zod'

export const ConnectRepoInput = z.object({
  repoFullName: z.string().regex(/^[^/]+\/[^/]+$/, 'Must be in format "owner/repo"'),
})

export type ConnectRepoInput = z.infer<typeof ConnectRepoInput>

export interface GitHubRepo {
  id: number
  full_name: string
  name: string
  private: boolean
  default_branch: string
  html_url: string
  description: string | null
  language: string | null
  updated_at: string
}
