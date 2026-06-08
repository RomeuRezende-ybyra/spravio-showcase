import { z } from 'zod'

// ─── ENUMS ───────────────────────────────────────────────────────────────────

export const IssueTypeSchema = z.enum(['BACKEND', 'FRONTEND', 'DESIGN', 'DEVOPS'])
export const IssueStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'TEST', 'UAT', 'DONE', 'CANCELLED'])
export const SprintStateSchema = z.enum(['FUTURE', 'ACTIVE', 'CLOSED'])

// Updated: alinhado com CLAUDE.md e schema.prisma (Phase 5)
export const OrgRoleSchema = z.enum(['OWNER', 'PROJECT_MANAGER', 'VIEWER'])

// GitHub enums (Phase 4)
export const PRStatusSchema = z.enum(['open', 'in_review', 'approved', 'merged', 'closed'])
export const PRAlertSeveritySchema = z.enum(['warning', 'critical'])

export type IssueType = z.infer<typeof IssueTypeSchema>
export type IssueStatus = z.infer<typeof IssueStatusSchema>
export type SprintState = z.infer<typeof SprintStateSchema>
export type OrgRole = z.infer<typeof OrgRoleSchema>
export type PRStatus = z.infer<typeof PRStatusSchema>
export type PRAlertSeverity = z.infer<typeof PRAlertSeveritySchema>

// ─── DEVELOPER ───────────────────────────────────────────────────────────────

export const DeveloperSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  jiraAccountId: z.string(),
  githubLogin: z.string().nullable(),
})

// GitHub metrics per developer (Phase 4)
export const GithubDevMetricsSchema = z.object({
  githubLogin: z.string(),
  prCount: z.number().int(),
  mergedPRCount: z.number().int(),
  openPRCount: z.number().int(),
  commitCount: z.number().int(),
  reviewCount: z.number().int(),
  approvalsGiven: z.number().int(),
  linesAdded: z.number().int(),
  linesRemoved: z.number().int(),
  avgPRCycleTimeHours: z.number().nullable(),  // null if no merged PRs yet
  stalePRCount: z.number().int(),
})

export const DeveloperMetricsSchema = z.object({
  developerId: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  // Combined rating: delivery 35% + rework 25% + prMerge 20% + cycleTime 10% + reviews 10%
  rating: z.number().min(0).max(5),
  // Jira metrics
  deliveryRate: z.number().min(0).max(100),
  returnRate: z.number().min(0).max(100),
  backendPoints: z.number().int(),
  frontendPoints: z.number().int(),
  totalPoints: z.number().int(),
  // GitHub metrics — null until Phase 4 is implemented
  githubMetrics: GithubDevMetricsSchema.nullable(),
})

export type Developer = z.infer<typeof DeveloperSchema>
export type GithubDevMetrics = z.infer<typeof GithubDevMetricsSchema>
export type DeveloperMetrics = z.infer<typeof DeveloperMetricsSchema>

// ─── SPRINT ──────────────────────────────────────────────────────────────────

export const SprintSchema = z.object({
  id: z.string(),
  jiraSprintId: z.number(),
  name: z.string(),
  state: SprintStateSchema,
  startDate: z.string().datetime().nullable(),
  endDate: z.string().datetime().nullable(),
  totalPoints: z.number().int(),
  completedPoints: z.number().int(),
})

export const BurndownPointSchema = z.object({
  date: z.string(),           // ISO date "YYYY-MM-DD"
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

// ─── ISSUE (CARD) ─────────────────────────────────────────────────────────────

export const IssueSchema = z.object({
  id: z.string(),
  jiraIssueKey: z.string(),
  title: z.string(),
  points: z.number().int(),
  issueType: IssueTypeSchema,
  status: IssueStatusSchema,
  wasReturned: z.boolean(),
  developerId: z.string().nullable(),
  epicId: z.string().nullable(),
  epicName: z.string().nullable(),
  // GitHub linkage — populated in Phase 4
  linkedPRNumber: z.number().int().nullable(),
  linkedPRStatus: PRStatusSchema.nullable(),
})

export type Issue = z.infer<typeof IssueSchema>

// ─── EPIC ────────────────────────────────────────────────────────────────────

export const EpicSchema = z.object({
  id: z.string(),
  jiraEpicKey: z.string(),
  name: z.string(),
  color: z.string().nullable(),
  issues: z.array(IssueSchema),
  totalPoints: z.number().int(),
})

export type Epic = z.infer<typeof EpicSchema>

// ─── PULL REQUEST (Phase 4) ──────────────────────────────────────────────────

export const PullRequestSchema = z.object({
  number: z.number().int(),
  title: z.string(),
  branch: z.string(),
  authorLogin: z.string(),
  status: PRStatusSchema,
  jiraKeys: z.array(z.string()),   // e.g. ["BANK-041", "BANK-042"]
  cycleTimeHours: z.number().nullable(),
  isStale: z.boolean(),
  staleSeverity: PRAlertSeveritySchema.nullable(),
  createdAt: z.string().datetime(),
  mergedAt: z.string().datetime().nullable(),
})

export type PullRequest = z.infer<typeof PullRequestSchema>

// ─── PROJECT ─────────────────────────────────────────────────────────────────

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  jiraProjectKey: z.string(),
  githubRepo: z.string().nullable(),   // format: "owner/repo"
  isActive: z.boolean(),
  lastSyncAt: z.string().datetime().nullable(),
  // GP assignment — populated in Phase 5
  assignedGPId: z.string().nullable(),
  assignedGPName: z.string().nullable(),
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
  overallProgress: z.number(),   // 0–100 percentage
  // GitHub summary — null until Phase 4
  githubSummary: z.object({
    totalPRs: z.number().int(),
    mergedPRs: z.number().int(),
    openPRs: z.number().int(),
    stalePRs: z.number().int(),
    avgCycleTimeHours: z.number().nullable(),
  }).nullable(),
})

export type Project = z.infer<typeof ProjectSchema>
export type ProjectOverview = z.infer<typeof ProjectOverviewSchema>

// ─── PROJECT ASSIGNMENT — GP management (Phase 5) ────────────────────────────

export const ProjectAssignmentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  assignedAt: z.string().datetime(),
})

// Portfolio view for OWNER role (Phase 5)
export const GPPortfolioSchema = z.object({
  gpId: z.string(),
  gpName: z.string(),
  gpEmail: z.string(),
  projects: z.array(z.object({
    projectId: z.string(),
    projectName: z.string(),
    health: z.enum(['on_track', 'at_risk', 'late']),
    progress: z.number(),
    daysLeft: z.number().int().nullable(),
  })),
  avgProgress: z.number(),
  onTrackCount: z.number().int(),
  atRiskCount: z.number().int(),
  lateCount: z.number().int(),
})

export type ProjectAssignment = z.infer<typeof ProjectAssignmentSchema>
export type GPPortfolio = z.infer<typeof GPPortfolioSchema>

// ─── DEVELOPER CARD DISTRIBUTION ─────────────────────────────────────────────

export const DeveloperCardDistributionSchema = z.object({
  developer: DeveloperMetricsSchema,
  cards: z.array(IssueSchema),
})

export type DeveloperCardDistribution = z.infer<typeof DeveloperCardDistributionSchema>

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
