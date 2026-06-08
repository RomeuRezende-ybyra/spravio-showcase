// ─── Raw GitHub API response types ──────────────────────────────────────────

export interface GithubUser {
  login: string
  id: number
  avatar_url: string
  name: string | null
  email: string | null
}

export interface GithubPullRequest {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  draft: boolean
  user: GithubUser
  head: { ref: string }
  base: { ref: string }
  created_at: string
  updated_at: string
  merged_at: string | null
  closed_at: string | null
  additions: number
  deletions: number
  changed_files: number
  review_comments: number
  body: string | null
}

export interface GithubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  author: GithubUser | null
  stats?: {
    additions: number
    deletions: number
    total: number
  }
}

export interface GithubReview {
  id: number
  user: GithubUser
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED'
  submitted_at: string
  body: string
}

export interface GithubContributorStats {
  author: GithubUser
  total: number
  weeks: Array<{
    w: number
    a: number
    d: number
    c: number
  }>
}
