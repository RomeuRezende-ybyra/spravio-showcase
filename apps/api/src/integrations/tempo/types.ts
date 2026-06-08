// Tempo API v4 Response Types

export interface TempoAuthor {
  accountId: string
  displayName: string
}

export interface TempoIssue {
  id: number
  key: string
}

export interface TempoWorklog {
  tempoWorklogId: number
  issue: TempoIssue
  timeSpentSeconds: number
  startDate: string // YYYY-MM-DD
  author: TempoAuthor
  description: string | null
}

export interface TempoWorklogsResponse {
  metadata: {
    count: number
    offset: number
    limit: number
    next?: string
  }
  results: TempoWorklog[]
}

export interface TempoAccount {
  id: number
  key: string
  name: string
}
