import { z } from 'zod'

// ─── ENUMS ───────────────────────────────────────────────────────────────────

export const IssueTypeSchema = z.enum(['BACKEND', 'FRONTEND', 'DESIGN', 'DEVOPS'])
export const IssueStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'TEST', 'UAT', 'DONE', 'CANCELLED'])
export const SprintStateSchema = z.enum(['FUTURE', 'ACTIVE', 'CLOSED'])
export const OrgRoleSchema = z.enum(['OWNER', 'PROJECT_MANAGER', 'VIEWER'])
export const PRStatusSchema = z.enum(['OPEN', 'MERGED', 'CLOSED'])
export const PRAlertSeveritySchema = z.enum(['NONE', 'WARNING', 'CRITICAL'])
export const ProjectSourceSchema = z.enum(['jira', 'azure', 'trello', 'clickup', 'linear', 'asana', 'monday'])
export const BudgetHealthSchema = z.enum(['green', 'yellow', 'red'])
export const SubscriptionStatusSchema = z.enum(['TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED'])
export const PlanIdSchema = z.enum(['starter', 'growth', 'scale'])

export type IssueType = z.infer<typeof IssueTypeSchema>
export type IssueStatus = z.infer<typeof IssueStatusSchema>
export type SprintState = z.infer<typeof SprintStateSchema>
export type OrgRole = z.infer<typeof OrgRoleSchema>
export type PRStatus = z.infer<typeof PRStatusSchema>
export type PRAlertSeverity = z.infer<typeof PRAlertSeveritySchema>
export type ProjectSource = z.infer<typeof ProjectSourceSchema>
export type BudgetHealth = z.infer<typeof BudgetHealthSchema>
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>
export type PlanId = z.infer<typeof PlanIdSchema>

// ─── AUTH / SESSION ──────────────────────────────────────────────────────────

export const UserSessionSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  orgId: z.string(),
  orgRole: OrgRoleSchema,
})

export type UserSession = z.infer<typeof UserSessionSchema>

export const AssignProjectInputSchema = z.object({
  userId: z.string().min(1),
})

export type AssignProjectInput = z.infer<typeof AssignProjectInputSchema>

// ─── DEVELOPER ───────────────────────────────────────────────────────────────

export const DeveloperSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  jiraAccountId: z.string().nullable(),
  azureUserId: z.string().nullable(),
  githubLogin: z.string().nullable(),
})

export const GithubDevMetricsSchema = z.object({
  totalPRs: z.number().int(),
  mergedPRs: z.number().int(),
  avgCycleTimeHours: z.number(),
  reviewContributions: z.number().int(),
  commitCount: z.number().int(),
})

export const DeveloperMetricsSchema = z.object({
  developerId: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  rating: z.number().min(0).max(5),
  deliveryRate: z.number().min(0).max(100),
  returnRate: z.number().min(0).max(100),
  backendPoints: z.number().int(),
  frontendPoints: z.number().int(),
  totalPoints: z.number().int(),
  githubMetrics: GithubDevMetricsSchema.nullable(),
})

export type Developer = z.infer<typeof DeveloperSchema>
export type GithubDevMetrics = z.infer<typeof GithubDevMetricsSchema>
export type DeveloperMetrics = z.infer<typeof DeveloperMetricsSchema>

// ─── SPRINT ──────────────────────────────────────────────────────────────────

export const SprintSchema = z.object({
  id: z.string(),
  jiraSprintId: z.number().nullable(),
  azureIterationId: z.string().nullable(),
  name: z.string(),
  state: SprintStateSchema,
  startDate: z.string().datetime().nullable(),
  endDate: z.string().datetime().nullable(),
  totalPoints: z.number().int(),
  completedPoints: z.number().int(),
})

export const BurndownPointSchema = z.object({
  date: z.string(),
  baselinePoints: z.number(),
  actualPoints: z.number(),
  completedPoints: z.number(),
})

export const SprintSummarySchema = z.object({
  sprint: SprintSchema,
  totalCards: z.number().int(),
  completedCards: z.number().int(),
  remainingCards: z.number().int(),
  completionPercentage: z.number(),
  totalPoints: z.number().int(),
  backendPoints: z.number().int(),
  frontendPoints: z.number().int(),
  burndown: z.array(BurndownPointSchema),
})

export type Sprint = z.infer<typeof SprintSchema>
export type BurndownPoint = z.infer<typeof BurndownPointSchema>
export type SprintSummary = z.infer<typeof SprintSummarySchema>

// ─── PULL REQUEST ────────────────────────────────────────────────────────────

export const PullRequestSchema = z.object({
  id: z.string(),
  number: z.number().int(),
  title: z.string(),
  status: PRStatusSchema,
  authorLogin: z.string(),
  jiraKeys: z.array(z.string()),
  cycleTimeHours: z.number().nullable(),
  isStale: z.boolean(),
  staleSeverity: PRAlertSeveritySchema,
  createdAt: z.string().datetime(),
  mergedAt: z.string().datetime().nullable(),
  closedAt: z.string().datetime().nullable(),
})

export type PullRequest = z.infer<typeof PullRequestSchema>

// ─── ISSUE (CARD) ─────────────────────────────────────────────────────────────

export const IssueSchema = z.object({
  id: z.string(),
  jiraIssueKey: z.string().nullable(),
  azureWorkItemId: z.number().int().nullable(),
  title: z.string(),
  points: z.number().int(),
  issueType: IssueTypeSchema,
  status: IssueStatusSchema,
  wasReturned: z.boolean(),
  developerId: z.string().nullable(),
  epicId: z.string().nullable(),
  epicName: z.string().nullable(),
  linkedPRNumber: z.number().int().nullable(),
  linkedPRStatus: PRStatusSchema.nullable(),
})

export type Issue = z.infer<typeof IssueSchema>

// ─── EPIC ────────────────────────────────────────────────────────────────────

export const EpicSchema = z.object({
  id: z.string(),
  jiraEpicKey: z.string().nullable(),
  azureEpicId: z.number().int().nullable(),
  name: z.string(),
  color: z.string().nullable(),
  issues: z.array(IssueSchema),
  totalPoints: z.number().int(),
})

export type Epic = z.infer<typeof EpicSchema>

// ─── PROJECT ─────────────────────────────────────────────────────────────────

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  source: ProjectSourceSchema,
  jiraProjectKey: z.string().nullable(),
  azureProjectId: z.string().nullable(),
  githubRepo: z.string().nullable(),
  isActive: z.boolean(),
  lastSyncAt: z.string().datetime().nullable(),
  assignedGPId: z.string().nullable(),
  assignedGPName: z.string().nullable(),
})

export const GithubSummarySchema = z.object({
  totalPRs: z.number().int(),
  openPRs: z.number().int(),
  mergedPRs: z.number().int(),
  stalePRs: z.number().int(),
  avgCycleTimeHours: z.number(),
})

export const BudgetSummarySchema = z.object({
  totalBudget: z.number(),
  cumulativeCost: z.number(),
  consumedPercent: z.number(),
  budgetHealth: BudgetHealthSchema,
  currency: z.string(),
})

export const ProjectOverviewSchema = z.object({
  project: ProjectSchema,
  currentSprint: SprintSummarySchema.nullable(),
  developers: z.array(DeveloperMetricsSchema),
  progressByStatus: z.object({
    done: z.number(),
    uat: z.number(),
    test: z.number(),
    inProgress: z.number(),
    todo: z.number(),
  }),
  totalPoints: z.number().int(),
  backendPoints: z.number().int(),
  frontendPoints: z.number().int(),
  overallProgress: z.number(),
  githubSummary: GithubSummarySchema.nullable(),
  budgetSummary: BudgetSummarySchema.nullable(),
})

export type Project = z.infer<typeof ProjectSchema>
export type GithubSummary = z.infer<typeof GithubSummarySchema>
export type BudgetSummary = z.infer<typeof BudgetSummarySchema>
export type ProjectOverview = z.infer<typeof ProjectOverviewSchema>

// ─── PROJECT ASSIGNMENT (GP) ─────────────────────────────────────────────────

export const ProjectAssignmentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  assignedAt: z.string().datetime(),
})

export const GPPortfolioSchema = z.object({
  userId: z.string(),
  name: z.string(),
  projects: z.array(ProjectSchema),
  totalProjects: z.number().int(),
})

export type ProjectAssignment = z.infer<typeof ProjectAssignmentSchema>
export type GPPortfolio = z.infer<typeof GPPortfolioSchema>

// ─── BUDGET & FINANCIALS (Phase 8 prep — nullable) ──────────────────────────

export const ProjectBudgetSchema = z.object({
  id: z.string(),
  totalBudget: z.number(),
  currency: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  projectId: z.string(),
})

export const DeveloperRateSchema = z.object({
  id: z.string(),
  hourlyRate: z.number(),
  currency: z.string(),
  developerId: z.string(),
  projectId: z.string(),
})

export const HoursSourceSchema = z.enum(['manual', 'tempo', 'clockify'])

export const SprintHoursSchema = z.object({
  id: z.string(),
  hoursLogged: z.number(),
  source: HoursSourceSchema,
  externalId: z.string().nullable(),
  sprintId: z.string(),
  developerId: z.string(),
})

export type HoursSource = z.infer<typeof HoursSourceSchema>

export const ProjectFinancialsSchema = z.object({
  budget: ProjectBudgetSchema.nullable(),
  sprintCost: z.number(),
  cumulativeCost: z.number(),
  budgetRemaining: z.number().nullable(),
  burnRate: z.number().nullable(),
  projectedTotal: z.number().nullable(),
  budgetHealth: BudgetHealthSchema.nullable(),
})

export type ProjectBudget = z.infer<typeof ProjectBudgetSchema>
export type DeveloperRate = z.infer<typeof DeveloperRateSchema>
export type SprintHours = z.infer<typeof SprintHoursSchema>
export type ProjectFinancials = z.infer<typeof ProjectFinancialsSchema>

// ─── DEVELOPER CARD DISTRIBUTION ─────────────────────────────────────────────

export const DeveloperCardDistributionSchema = z.object({
  developer: DeveloperMetricsSchema,
  cards: z.array(IssueSchema),
})

export type DeveloperCardDistribution = z.infer<typeof DeveloperCardDistributionSchema>

// ─── BILLING & SUBSCRIPTION ─────────────────────────────────────────────

export const PlanLimitsSchema = z.object({
  maxProjects: z.number().int(),
  maxDevelopers: z.number().int(),
  maxGPs: z.number().int(),
})

export const SubscriptionInfoSchema = z.object({
  status: SubscriptionStatusSchema,
  planId: PlanIdSchema.nullable(),
  limits: PlanLimitsSchema,
  usage: z.object({
    projects: z.number().int(),
    developers: z.number().int(),
    gps: z.number().int(),
  }),
})

export type PlanLimits = z.infer<typeof PlanLimitsSchema>
export type SubscriptionInfo = z.infer<typeof SubscriptionInfoSchema>

// ─── CLIENT PORTAL ──────────────────────────────────────────────────────

export const PortalDataSchema = z.object({
  projectName: z.string(),
  jiraProjectKey: z.string().nullable(),
  lastSyncAt: z.string().nullable(),
  currentSprint: SprintSummarySchema.nullable(),
  overallProgress: z.number(),
  progressByStatus: z.object({
    done: z.number(),
    uat: z.number(),
    test: z.number(),
    inProgress: z.number(),
    todo: z.number(),
  }),
  teamDeliveryRate: z.number(),
})

export type PortalData = z.infer<typeof PortalDataSchema>

// ─── SLACK ──────────────────────────────────────────────────────────────────

export const SlackAlertTypeSchema = z.enum(['stale_pr', 'budget', 'sprint_health', 'done_without_code'])

export const SlackConfigSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  webhookUrl: z.string().nullable(),
  channelId: z.string().nullable(),
  alertTypes: z.array(SlackAlertTypeSchema),
  isActive: z.boolean(),
})

export const SlackConfigInputSchema = z.object({
  webhookUrl: z.string().nullable().optional(),
  channelId: z.string().nullable().optional(),
  alertTypes: z.array(SlackAlertTypeSchema).optional(),
  isActive: z.boolean().optional(),
})

export const SlackAlertPayloadSchema = z.object({
  alertType: SlackAlertTypeSchema,
  severity: z.enum(['warning', 'critical']),
  projectId: z.string(),
  projectName: z.string(),
  message: z.string(),
  details: z.record(z.unknown()),
  timestamp: z.string().datetime(),
})

export type SlackAlertType = z.infer<typeof SlackAlertTypeSchema>
export type SlackConfig = z.infer<typeof SlackConfigSchema>
export type SlackConfigInput = z.infer<typeof SlackConfigInputSchema>
export type SlackAlertPayload = z.infer<typeof SlackAlertPayloadSchema>

// ─── TEAMS (Phase 10) ───────────────────────────────────────────────────────

export const TeamsAlertTypeSchema = z.enum(['stale_pr', 'budget', 'sprint_health', 'done_without_code'])

export const TeamsConfigSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  webhookUrl: z.string(),
  alertTypes: z.array(TeamsAlertTypeSchema),
  isActive: z.boolean(),
})

export const TeamsConfigInputSchema = z.object({
  webhookUrl: z.string().url().optional(),
  alertTypes: z.array(TeamsAlertTypeSchema).optional(),
  isActive: z.boolean().optional(),
})

export type TeamsAlertType = z.infer<typeof TeamsAlertTypeSchema>
export type TeamsConfig = z.infer<typeof TeamsConfigSchema>
export type TeamsConfigInput = z.infer<typeof TeamsConfigInputSchema>

// ─── TEMPO (Phase 11) ────────────────────────────────────────────────────────

export const TempoConfigSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  isActive: z.boolean(),
  lastSyncAt: z.string().datetime().nullable(),
  hasToken: z.boolean(),
})

export const TempoConfigInputSchema = z.object({
  apiToken: z.string().min(1),
  isActive: z.boolean().optional(),
})

export type TempoConfig = z.infer<typeof TempoConfigSchema>
export type TempoConfigInput = z.infer<typeof TempoConfigInputSchema>

// ─── CLOCKIFY (Phase 11) ─────────────────────────────────────────────────────

export const ClockifyConfigSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  workspaceId: z.string(),
  isActive: z.boolean(),
  lastSyncAt: z.string().datetime().nullable(),
  hasApiKey: z.boolean(),
})

export const ClockifyConfigInputSchema = z.object({
  apiKey: z.string().min(1),
  workspaceId: z.string().min(1),
  isActive: z.boolean().optional(),
})

export type ClockifyConfig = z.infer<typeof ClockifyConfigSchema>
export type ClockifyConfigInput = z.infer<typeof ClockifyConfigInputSchema>

// ─── DELIVERY FORECAST (Phase 12) ────────────────────────────────────────────

export const ForecastConfidenceSchema = z.enum(['low', 'medium', 'high'])

export const DeliveryForecastSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  onTimeProbability: z.number().min(0).max(100),
  predictedEndDate: z.string().datetime().nullable(),
  confidence: ForecastConfidenceSchema,
  reasoning: z.string(),
  createdAt: z.string().datetime(),
})

export const ForecastInputSchema = z.object({
  projectName: z.string(),
  velocity: z.number(),
  velocityTrend: z.enum(['increasing', 'stable', 'decreasing']),
  reworkRate: z.number(),
  teamSize: z.number(),
  totalRemainingPoints: z.number(),
  completedSprints: z.number(),
  daysRemaining: z.number().nullable(),
  budgetHealth: z.enum(['green', 'yellow', 'red']).nullable(),
  sprintLengthDays: z.number(),
})

export type ForecastConfidence = z.infer<typeof ForecastConfidenceSchema>
export type DeliveryForecast = z.infer<typeof DeliveryForecastSchema>
export type ForecastInput = z.infer<typeof ForecastInputSchema>

// ─── API RESPONSES ───────────────────────────────────────────────────────────

export const ApiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  })

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
})

export type ApiError = z.infer<typeof ApiErrorSchema>
