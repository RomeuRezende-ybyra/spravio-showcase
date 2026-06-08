export interface GitLabUser {
  id: number
  username: string
  name: string
  avatar_url: string
  email: string | null
}

export interface GitLabMergeRequest {
  id: number
  iid: number // project-specific MR number
  title: string
  state: 'opened' | 'closed' | 'merged'
  draft: boolean
  author: GitLabUser
  source_branch: string
  target_branch: string
  created_at: string
  updated_at: string
  merged_at: string | null
  closed_at: string | null
  description: string | null
  web_url: string
}

export interface GitLabCommit {
  id: string // SHA
  short_id: string
  title: string
  message: string
  author_name: string
  author_email: string
  authored_date: string
  committer_name: string
  committer_email: string
}

export interface GitLabProject {
  id: number
  path_with_namespace: string
  name: string
  web_url: string
}

export interface GitLabMember {
  id: number
  username: string
  name: string
  avatar_url: string
}
