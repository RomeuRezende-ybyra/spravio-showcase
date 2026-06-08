import { linearGraphQL } from './client.js'
import type {
  LinearTeam,
  LinearTeamsResponse,
  LinearUser,
  LinearTeamMembersResponse,
  LinearCycle,
  LinearCyclesResponse,
  LinearIssue,
  LinearIssuesResponse,
  LinearCycleIssuesResponse,
} from './types.js'

/**
 * Get all teams for the authenticated user
 */
export async function getTeams(): Promise<LinearTeam[]> {
  const query = `
    query {
      teams {
        nodes {
          id
          name
          key
          description
          icon
          color
        }
      }
    }
  `

  const response = await linearGraphQL<LinearTeamsResponse>(query)
  return response.data.teams.nodes
}

/**
 * Get all members of a team
 */
export async function getTeamMembers(teamId: string): Promise<LinearUser[]> {
  const query = `
    query($teamId: String!) {
      team(id: $teamId) {
        members {
          nodes {
            id
            name
            displayName
            email
            avatarUrl
            active
          }
        }
      }
    }
  `

  const response = await linearGraphQL<LinearTeamMembersResponse>(query, { teamId })
  return response.data.team.members.nodes
}

/**
 * Get all cycles (sprints) for a team
 */
export async function getTeamCycles(teamId: string): Promise<LinearCycle[]> {
  const query = `
    query($teamId: String!) {
      team(id: $teamId) {
        cycles {
          nodes {
            id
            number
            name
            description
            startsAt
            endsAt
            completedAt
            progress
            scopeId
            completedScopeId
          }
        }
      }
    }
  `

  const response = await linearGraphQL<LinearCyclesResponse>(query, { teamId })
  return response.data.team.cycles.nodes
}

/**
 * Get all issues for a team with pagination
 */
export async function getTeamIssues(teamId: string): Promise<LinearIssue[]> {
  const allIssues: LinearIssue[] = []
  let hasNextPage = true
  let cursor: string | null = null

  const query = `
    query($teamId: String!, $after: String) {
      team(id: $teamId) {
        issues(first: 100, after: $after) {
          nodes {
            id
            identifier
            title
            description
            priority
            priorityLabel
            estimate
            state {
              id
              name
              type
              color
              position
            }
            assignee {
              id
              name
              displayName
              email
              avatarUrl
              active
            }
            creator {
              id
              name
              displayName
              email
              avatarUrl
              active
            }
            cycle {
              id
            }
            labels {
              nodes {
                id
                name
                color
              }
            }
            createdAt
            updatedAt
            completedAt
            canceledAt
            url
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `

  while (hasNextPage) {
    const response: LinearIssuesResponse = await linearGraphQL<LinearIssuesResponse>(query, { teamId, after: cursor })
    allIssues.push(...response.data.team.issues.nodes)
    hasNextPage = response.data.team.issues.pageInfo.hasNextPage
    cursor = response.data.team.issues.pageInfo.endCursor
  }

  return allIssues
}

/**
 * Get issues for a specific cycle
 */
export async function getCycleIssues(cycleId: string): Promise<LinearIssue[]> {
  const allIssues: LinearIssue[] = []
  let hasNextPage = true
  let cursor: string | null = null

  const query = `
    query($cycleId: String!, $after: String) {
      cycle(id: $cycleId) {
        issues(first: 100, after: $after) {
          nodes {
            id
            identifier
            title
            description
            priority
            priorityLabel
            estimate
            state {
              id
              name
              type
              color
              position
            }
            assignee {
              id
              name
              displayName
              email
              avatarUrl
              active
            }
            creator {
              id
              name
              displayName
              email
              avatarUrl
              active
            }
            cycle {
              id
            }
            labels {
              nodes {
                id
                name
                color
              }
            }
            createdAt
            updatedAt
            completedAt
            canceledAt
            url
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `

  while (hasNextPage) {
    const response: LinearCycleIssuesResponse = await linearGraphQL<LinearCycleIssuesResponse>(query, { cycleId, after: cursor })
    allIssues.push(...response.data.cycle.issues.nodes)
    hasNextPage = response.data.cycle.issues.pageInfo.hasNextPage
    cursor = response.data.cycle.issues.pageInfo.endCursor
  }

  return allIssues
}
