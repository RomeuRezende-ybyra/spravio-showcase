import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { GPPortfolio, SubscriptionInfo, PortalData, PlanId } from '@spravio/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3010'

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: { code: string; message: string; details?: unknown }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  }

  // Inject auth token from server session when running on the server
  if (typeof window === 'undefined') {
    try {
      const session = await getServerSession(authOptions)
      if (session?.apiToken) {
        headers['Authorization'] = `Bearer ${session.apiToken}`
      }
    } catch {
      // Not in a request context (e.g. build time) — skip auth
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  })

  const json = (await res.json()) as ApiResponse<T>

  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? `Request failed: ${res.status}`)
  }

  return json.data
}

export const apiClient = {
  projects: {
    list() {
      return request<Array<{
        id: string
        name: string
        source: string
        jiraProjectKey: string | null
        azureProjectId: string | null
        githubRepo: string | null
        isActive: boolean
        lastSyncAt: string | null
        createdAt: string
      }>>('/projects')
    },
    listMine() {
      return request<Array<{
        id: string
        name: string
        source: string
        jiraProjectKey: string | null
        azureProjectId: string | null
        githubRepo: string | null
        isActive: boolean
        lastSyncAt: string | null
        createdAt: string
      }>>('/projects/mine')
    },
    getById(id: string) {
      return request<{
        id: string
        name: string
        source: string
        jiraProjectKey: string | null
        azureProjectId: string | null
        githubRepo: string | null
        isActive: boolean
        lastSyncAt: string | null
      }>(`/projects/${id}`)
    },
    create(input: {
      name: string
      source?: 'jira' | 'azure'
      jiraProjectKey?: string
      azureProjectId?: string
      organizationId: string
      githubRepo?: string | null
    }) {
      return request('/projects', {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },
  },

  sprints: {
    listByProject(projectId: string) {
      return request<Array<{
        id: string
        jiraSprintId: number
        name: string
        state: string
        startDate: string | null
        endDate: string | null
        totalPoints: number
        completedPoints: number
        _count: { issues: number }
      }>>(`/projects/${projectId}/sprints`)
    },
    getCurrent(projectId: string) {
      return request<{
        sprint: {
          id: string
          jiraSprintId: number
          name: string
          state: string
          startDate: string | null
          endDate: string | null
          totalPoints: number
          completedPoints: number
        }
        totalCards: number
        completedCards: number
        remainingCards: number
        completionPercentage: number
        totalPoints: number
        backendPoints: number
        frontendPoints: number
        burndown: Array<{
          date: string
          baselinePoints: number
          actualPoints: number
          completedPoints: number
        }>
      } | null>(`/projects/${projectId}/sprints/current`)
    },
  },

  developers: {
    listByProject(projectId: string) {
      return request<Array<{
        developerId: string
        name: string
        avatarUrl: string | null
        rating: number
        deliveryRate: number
        returnRate: number
        backendPoints: number
        frontendPoints: number
        totalPoints: number
        githubMetrics: {
          totalPRs: number
          mergedPRs: number
          avgCycleTimeHours: number
          reviewContributions: number
          commitCount: number
        } | null
      }>>(`/projects/${projectId}/developers`)
    },
    getCards(projectId: string, devId: string) {
      return request<Array<{
        id: string
        jiraIssueKey: string | null
        azureWorkItemId: number | null
        title: string
        points: number
        issueType: string
        status: string
        wasReturned: boolean
        developerId: string | null
        epicId: string | null
        epicName: string | null
        linkedPRNumber: number | null
        linkedPRStatus: string | null
      }>>(`/projects/${projectId}/developers/${devId}/cards`)
    },
  },

  pullRequests: {
    list(projectId: string) {
      return request<Array<{
        id: string
        number: number
        title: string
        status: 'OPEN' | 'MERGED' | 'CLOSED'
        authorLogin: string
        jiraKeys: string[]
        cycleTimeHours: number | null
        isStale: boolean
        staleSeverity: 'NONE' | 'WARNING' | 'CRITICAL'
        createdAt: string
        mergedAt: string | null
        closedAt: string | null
      }>>(`/projects/${projectId}/pullrequests`)
    },
    getStats(projectId: string) {
      return request<{
        totalPRs: number
        openPRs: number
        mergedPRs: number
        stalePRs: number
        avgCycleTimeHours: number
      }>(`/projects/${projectId}/pullrequests/stats`)
    },
  },

  sync: {
    github(projectId: string) {
      return request<{ message: string }>(`/projects/${projectId}/sync/github`, {
        method: 'POST',
      })
    },
  },

  overview: {
    get(projectId: string) {
      return request<{
        project: {
          id: string
          name: string
          source: string
          jiraProjectKey: string | null
          azureProjectId: string | null
          githubRepo: string | null
          isActive: boolean
          lastSyncAt: string | null
          assignedGPId: string | null
          assignedGPName: string | null
        }
        currentSprint: {
          sprint: {
            id: string
            jiraSprintId: number
            name: string
            state: string
            startDate: string | null
            endDate: string | null
            totalPoints: number
            completedPoints: number
          }
          totalCards: number
          completedCards: number
          remainingCards: number
          completionPercentage: number
          totalPoints: number
          backendPoints: number
          frontendPoints: number
          burndown: Array<{
            date: string
            baselinePoints: number
            actualPoints: number
            completedPoints: number
          }>
        } | null
        developers: Array<{
          developerId: string
          name: string
          avatarUrl: string | null
          rating: number
          deliveryRate: number
          returnRate: number
          backendPoints: number
          frontendPoints: number
          totalPoints: number
          githubMetrics: {
            totalPRs: number
            mergedPRs: number
            avgCycleTimeHours: number
            reviewContributions: number
            commitCount: number
          } | null
        }>
        progressByStatus: {
          done: number
          uat: number
          test: number
          inProgress: number
          todo: number
        }
        totalPoints: number
        backendPoints: number
        frontendPoints: number
        overallProgress: number
        githubSummary: {
          totalPRs: number
          openPRs: number
          mergedPRs: number
          stalePRs: number
          avgCycleTimeHours: number
        } | null
        budgetSummary: {
          totalBudget: number
          cumulativeCost: number
          consumedPercent: number
          budgetHealth: 'green' | 'yellow' | 'red'
          currency: string
        } | null
      }>(`/projects/${projectId}/overview`)
    },
  },

  assignments: {
    list(projectId: string) {
      return request<Array<{
        id: string
        projectId: string
        userId: string
        assignedAt: string
        user: { id: string; name: string | null; email: string; avatarUrl: string | null }
      }>>(`/projects/${projectId}/assignments`)
    },
    assign(projectId: string, userId: string) {
      return request<{ id: string; projectId: string; userId: string }>(`/projects/${projectId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      })
    },
    remove(projectId: string, userId: string) {
      return request<null>(`/projects/${projectId}/assign/${userId}`, {
        method: 'DELETE',
      })
    },
  },

  portfolio: {
    list() {
      return request<{
        projects: Array<{
          id: string
          key: string
          name: string
          client: string
          clientSector: string
          source: string
          health: 'green' | 'yellow' | 'red'
          healthScore: number
          sprintNum: number
          sprintDay: number
          sprintLength: number
          sprintCompleted: number
          sprintTotalPoints: number
          burndown: { ideal: number[]; actual: number[] }
          velocityPoints: number
          velocitySpark: number[]
          velocityTrend: 'up' | 'down' | 'stable'
          consumedPct: number
          team: Array<{ name: string; avatar: string; color?: string }>
          prsOpen: number
          prsStale: number
          onTimeProb: number
          lastSync: string
        }>
        kpis: {
          totalProjects: number
          activeBudget: number
          avgBurn: number
          openPRs: number
          avgMargin: number
          avgHealth: number
          burnTimeline: Array<{ spent: number; budget: number }>
        }
      }>('/portfolio')
    },
  },

  financial: {
    summary() {
      return request<{
        totalRevenue: number
        totalConsumed: number
        totalBilled: number
        overdue: number
        burnByProject: Array<{
          projectName: string
          consumed: number
          budget: number
          health: 'green' | 'yellow' | 'red'
        }>
        projects: Array<{
          id: string
          name: string
          client: string
          budget: number
          consumed: number
          billed: number
          margin: number
          health: 'green' | 'yellow' | 'red'
          currency: string
        }>
      }>('/financial/summary')
    },
  },

  allSprints: {
    list() {
      return request<Array<{
        id: string
        name: string
        state: string
        startDate: string | null
        endDate: string | null
        totalPoints: number
        completedPoints: number
        project: { id: string; name: string; key: string | null }
        totalCards: number
        completedCards: number
        remainingCards: number
        completionPercentage: number
        backendPoints: number
        frontendPoints: number
        burndown: Array<{
          date: string
          baselinePoints: number
          actualPoints: number
          completedPoints: number
        }>
        issuesByStatus: {
          todo: number
          inProgress: number
          test: number
          uat: number
          done: number
          cancelled: number
        }
      }>>('/sprints')
    },
  },

  forecasts: {
    listAll() {
      return request<Array<{
        projectId: string
        projectName: string
        projectKey: string | null
        deadline: string | null
        startDate: string | null
        forecast: {
          id: string
          onTimeProbability: number
          predictedEndDate: string | null
          confidence: string
          reasoning: string
          createdAt: string
        } | null
      }>>('/forecasts')
    },
  },

  gp: {
    portfolios() {
      return request<GPPortfolio[]>('/gp/portfolios')
    },
  },

  billing: {
    subscription() {
      return request<SubscriptionInfo>('/billing/subscription')
    },
    checkout(planId: PlanId, successUrl: string, cancelUrl: string) {
      return request<{ url: string }>('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ planId, successUrl, cancelUrl }),
      })
    },
    portal(returnUrl: string) {
      return request<{ url: string }>('/billing/portal', {
        method: 'POST',
        body: JSON.stringify({ returnUrl }),
      })
    },
  },

  budget: {
    get(projectId: string) {
      return request<{
        id: string
        totalBudget: number
        currency: string
        startDate: string
        endDate: string
        projectId: string
      } | null>(`/projects/${projectId}/budget`)
    },
    set(projectId: string, input: {
      totalBudget: number
      currency: string
      startDate: string
      endDate: string
    }) {
      return request<{
        id: string
        totalBudget: number
        currency: string
        startDate: string
        endDate: string
        projectId: string
      }>(`/projects/${projectId}/budget`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },
    setRate(projectId: string, devId: string, input: { hourlyRate: number; currency?: string }) {
      return request<{ id: string; hourlyRate: number; currency: string }>(
        `/projects/${projectId}/developers/${devId}/rate`,
        { method: 'PUT', body: JSON.stringify(input) },
      )
    },
    logHours(projectId: string, sprintId: string, input: {
      developerId: string
      hoursLogged: number
      source?: string
    }) {
      return request<{ id: string; hoursLogged: number }>(
        `/projects/${projectId}/sprints/${sprintId}/hours`,
        { method: 'POST', body: JSON.stringify(input) },
      )
    },
    getFinancials(projectId: string) {
      return request<{
        budget: {
          id: string
          totalBudget: number
          currency: string
          startDate: string
          endDate: string
          projectId: string
        } | null
        sprintCost: number
        cumulativeCost: number
        budgetRemaining: number | null
        burnRate: number | null
        projectedTotal: number | null
        budgetHealth: 'green' | 'yellow' | 'red' | null
        consumedPercent: number | null
        sprintCosts: Array<{ sprintId: string; sprintName: string; cost: number }>
        developerCosts: Array<{
          developerId: string
          name: string
          avatarUrl: string | null
          hourlyRate: number
          totalHours: number
          totalCost: number
        }>
      }>(`/projects/${projectId}/financials`)
    },
  },

  slack: {
    getConfig(projectId: string) {
      return request<{
        id: string
        projectId: string
        webhookUrl: string | null
        channelId: string | null
        alertTypes: string[]
        isActive: boolean
      } | null>(`/projects/${projectId}/slack-config`)
    },
    updateConfig(projectId: string, input: {
      webhookUrl?: string | null
      channelId?: string | null
      alertTypes?: string[]
      isActive?: boolean
    }) {
      return request<{
        id: string
        projectId: string
        webhookUrl: string | null
        channelId: string | null
        alertTypes: string[]
        isActive: boolean
      }>(`/projects/${projectId}/slack-config`, {
        method: 'PUT',
        body: JSON.stringify(input),
      })
    },
    testConfig(projectId: string) {
      return request<{ message: string }>(`/projects/${projectId}/slack-config/test`, {
        method: 'POST',
      })
    },
  },

  portal: {
    getData(token: string) {
      return request<PortalData>(`/portal/${token}`)
    },
    generateToken(projectId: string, expiryDays: number | null) {
      return request<{ token: string }>(`/projects/${projectId}/portal-token`, {
        method: 'POST',
        body: JSON.stringify({ expiryDays }),
      })
    },
  },
}
