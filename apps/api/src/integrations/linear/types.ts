// Linear API (GraphQL) response types

export interface LinearTeam {
  id: string
  name: string
  key: string
  description: string | null
  icon: string | null
  color: string | null
}

export interface LinearCycle {
  id: string
  number: number
  name: string | null
  description: string | null
  startsAt: string
  endsAt: string
  completedAt: string | null
  progress: number
  scopeId: number
  completedScopeId: number
}

export interface LinearIssue {
  id: string
  identifier: string
  title: string
  description: string | null
  priority: number
  priorityLabel: string
  estimate: number | null
  state: LinearWorkflowState
  assignee: LinearUser | null
  creator: LinearUser | null
  cycle: { id: string } | null
  labels: { nodes: LinearLabel[] }
  createdAt: string
  updatedAt: string
  completedAt: string | null
  canceledAt: string | null
  url: string
}

export interface LinearWorkflowState {
  id: string
  name: string
  type: 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled'
  color: string
  position: number
}

export interface LinearUser {
  id: string
  name: string
  displayName: string
  email: string
  avatarUrl: string | null
  active: boolean
}

export interface LinearLabel {
  id: string
  name: string
  color: string
}

// GraphQL response wrappers
export interface LinearTeamsResponse {
  data: {
    teams: {
      nodes: LinearTeam[]
    }
  }
}

export interface LinearTeamMembersResponse {
  data: {
    team: {
      members: {
        nodes: LinearUser[]
      }
    }
  }
}

export interface LinearCyclesResponse {
  data: {
    team: {
      cycles: {
        nodes: LinearCycle[]
      }
    }
  }
}

export interface LinearIssuesResponse {
  data: {
    team: {
      issues: {
        nodes: LinearIssue[]
        pageInfo: {
          hasNextPage: boolean
          endCursor: string | null
        }
      }
    }
  }
}

export interface LinearCycleIssuesResponse {
  data: {
    cycle: {
      issues: {
        nodes: LinearIssue[]
        pageInfo: {
          hasNextPage: boolean
          endCursor: string | null
        }
      }
    }
  }
}
