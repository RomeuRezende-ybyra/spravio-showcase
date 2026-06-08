// ─── Raw Jira API types ──────────────────────────────────────────────────────

export interface JiraProject {
  id: string
  key: string
  name: string
  projectTypeKey: string
  style: string
  avatarUrls: Record<string, string>
}

export interface JiraBoard {
  id: number
  name: string
  type: string
  location?: {
    projectId: number
    projectKey: string
    projectName: string
  }
}

export interface JiraSprint {
  id: number
  state: 'future' | 'active' | 'closed'
  name: string
  startDate?: string
  endDate?: string
  completeDate?: string
  originBoardId: number
  goal?: string
}

export interface JiraUser {
  accountId: string
  displayName: string
  emailAddress?: string
  avatarUrls: Record<string, string>
  active: boolean
}

export interface JiraIssueFields {
  summary: string
  status: {
    name: string
    statusCategory: {
      key: string // 'new' | 'indeterminate' | 'done'
      name: string
    }
  }
  issuetype: {
    name: string
    subtask: boolean
  }
  assignee: JiraUser | null
  labels: string[]
  components: Array<{ name: string }>
  sprint?: JiraSprint | null
  parent?: {
    id: string
    key: string
    fields: {
      summary: string
      issuetype: { name: string }
    }
  }
  resolution: { name: string } | null
  resolutiondate: string | null
  created: string
  updated: string
  [key: string]: unknown // for custom fields like story points
}

export interface JiraIssue {
  id: string
  key: string
  fields: JiraIssueFields
}

export interface JiraField {
  id: string
  key: string
  name: string
  custom: boolean
  schema?: {
    type: string
    custom?: string
  }
}

// ─── Response wrappers ───────────────────────────────────────────────────────

export interface JiraPaginatedResponse<T> {
  maxResults: number
  startAt: number
  isLast: boolean
  values: T[]
}

export interface JiraSearchResponse {
  startAt: number
  maxResults: number
  total: number
  issues: JiraIssue[]
}
