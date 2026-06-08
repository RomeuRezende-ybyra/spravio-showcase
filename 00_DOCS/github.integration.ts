// ============================================================
// apps/api/src/integrations/github/types.ts
// Raw GitHub API response types
// ============================================================

export interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

export interface GithubPullRequest {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  draft: boolean;
  user: GithubUser;
  head: { ref: string }; // branch name
  base: { ref: string };
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  closed_at: string | null;
  additions: number;
  deletions: number;
  changed_files: number;
  review_comments: number;
  body: string | null;
}

export interface GithubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: GithubUser | null;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export interface GithubReview {
  id: number;
  user: GithubUser;
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED";
  submitted_at: string;
  body: string;
}

export interface GithubContributorStats {
  author: GithubUser;
  total: number; // total commits
  weeks: Array<{
    w: number;   // unix timestamp week start
    a: number;   // additions
    d: number;   // deletions
    c: number;   // commits
  }>;
}

// ============================================================
// apps/api/src/integrations/github/client.ts
// GitHub REST API HTTP client
// ============================================================

// import axios, { AxiosInstance } from "axios";
// import { env } from "../../config/env.js";

/*
export function createGithubClient(): AxiosInstance {
  const client = axios.create({
    baseURL: "https://api.github.com",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    timeout: 15_000,
  });

  // Response interceptor — log + normalize errors
  client.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error.response?.status;
      const msg = error.response?.data?.message ?? error.message;

      if (status === 403 && msg?.includes("rate limit")) {
        // GitHub rate limit: 5000 req/hour for authenticated requests
        const resetAt = error.response?.headers["x-ratelimit-reset"];
        const resetDate = resetAt ? new Date(Number(resetAt) * 1000) : null;
        throw new Error(`GitHub rate limit hit. Resets at ${resetDate?.toISOString()}`);
      }

      throw new Error(`GitHub API error [${status}]: ${msg}`);
    }
  );

  return client;
}

export const githubClient = createGithubClient();
*/

// ============================================================
// apps/api/src/integrations/github/endpoints.ts
// One function per GitHub API endpoint
// ============================================================

// import { githubClient } from "./client.js";
// import { redis } from "../../lib/redis.js";
// import type { GithubPullRequest, GithubCommit, GithubReview, GithubContributorStats } from "./types.js";

const CACHE_TTL = 300; // 5 minutes

/*
// ── Pull Requests ─────────────────────────────────────────

export async function getPullRequests(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "all",
  since?: Date
): Promise<GithubPullRequest[]> {
  const cacheKey = `github:prs:${owner}/${repo}:${state}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const params: Record<string, string | number> = {
    state,
    per_page: 100,
    sort: "updated",
    direction: "desc",
  };

  const { data } = await githubClient.get<GithubPullRequest[]>(
    `/repos/${owner}/${repo}/pulls`,
    { params }
  );

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
  return data;
}

// ── Commits ───────────────────────────────────────────────

export async function getCommits(
  owner: string,
  repo: string,
  author?: string,
  since?: Date
): Promise<GithubCommit[]> {
  const cacheKey = `github:commits:${owner}/${repo}:${author ?? "all"}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const params: Record<string, string | number> = { per_page: 100 };
  if (author) params.author = author;
  if (since) params.since = since.toISOString();

  const { data } = await githubClient.get<GithubCommit[]>(
    `/repos/${owner}/${repo}/commits`,
    { params }
  );

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
  return data;
}

// ── PR Reviews ────────────────────────────────────────────

export async function getPRReviews(
  owner: string,
  repo: string,
  prNumber: number
): Promise<GithubReview[]> {
  const cacheKey = `github:reviews:${owner}/${repo}:${prNumber}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const { data } = await githubClient.get<GithubReview[]>(
    `/repos/${owner}/${repo}/pulls/${prNumber}/reviews`
  );

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
  return data;
}

// ── Contributor Stats ─────────────────────────────────────

export async function getContributorStats(
  owner: string,
  repo: string
): Promise<GithubContributorStats[]> {
  const cacheKey = `github:stats:${owner}/${repo}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // GitHub may return 202 (computing) — retry up to 3x
  let attempts = 0;
  while (attempts < 3) {
    const res = await githubClient.get<GithubContributorStats[]>(
      `/repos/${owner}/${repo}/stats/contributors`
    );
    if (res.status === 200) {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(res.data));
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 2000));
    attempts++;
  }
  return [];
}
*/

// ============================================================
// apps/api/src/integrations/github/mappers.ts
// Transform GitHub raw → internal models
// ============================================================

// import type { GithubPullRequest, GithubCommit, GithubReview } from "./types.js";

// ── Extract Jira issue keys from PR title/branch ──────────

export function extractJiraKeys(pr: { title: string; head: { ref: string }; body?: string | null }): string[] {
  const JIRA_KEY_REGEX = /[A-Z][A-Z0-9]+-\d+/g;
  const sources = [pr.title, pr.head.ref, pr.body ?? ""].join(" ");
  const matches = sources.match(JIRA_KEY_REGEX) ?? [];
  return [...new Set(matches)]; // deduplicate
}

// ── PR state normalization ────────────────────────────────

export type PRStatus = "open" | "in_review" | "approved" | "merged" | "closed";

export function normalizePRStatus(
  pr: { state: string; merged_at: string | null; draft: boolean },
  reviews: Array<{ state: string }>
): PRStatus {
  if (pr.merged_at) return "merged";
  if (pr.state === "closed") return "closed";
  if (pr.draft) return "open";

  const hasApproval = reviews.some((r) => r.state === "APPROVED");
  const hasReviews = reviews.length > 0;

  if (hasApproval) return "approved";
  if (hasReviews) return "in_review";
  return "open";
}

// ── Developer GitHub metrics (mapped to our internal model) ──

export interface GithubDevMetrics {
  githubLogin: string;
  prCount: number;
  mergedPRCount: number;
  openPRCount: number;
  commitCount: number;
  reviewCount: number;
  approvalsGiven: number;
  linesAdded: number;
  linesRemoved: number;
  avgPRCycleTimeHours: number | null; // created → merged
  stalePRCount: number;               // open > 3 days without activity
}

/*
export function mapGithubDevMetrics(
  githubLogin: string,
  prs: GithubPullRequest[],
  commits: GithubCommit[],
  reviews: GithubReview[]
): GithubDevMetrics {
  const authoredPRs = prs.filter((pr) => pr.user.login === githubLogin);
  const mergedPRs = authoredPRs.filter((pr) => pr.merged_at !== null);
  const openPRs = authoredPRs.filter((pr) => pr.state === "open");

  // Stale = open PR with no update in 3 days
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  const stalePRs = openPRs.filter(
    (pr) => new Date(pr.updated_at).getTime() < threeDaysAgo
  );

  // Average cycle time for merged PRs
  const cycleTimes = mergedPRs
    .filter((pr) => pr.merged_at)
    .map((pr) => {
      const created = new Date(pr.created_at).getTime();
      const merged = new Date(pr.merged_at!).getTime();
      return (merged - created) / (1000 * 60 * 60); // hours
    });

  const avgCycleTime =
    cycleTimes.length > 0
      ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length
      : null;

  const authoredReviews = reviews.filter((r) => r.user.login === githubLogin);
  const approvals = authoredReviews.filter((r) => r.state === "APPROVED");

  const authoredCommits = commits.filter((c) => c.author?.login === githubLogin);
  const linesAdded = authoredPRs.reduce((sum, pr) => sum + pr.additions, 0);
  const linesRemoved = authoredPRs.reduce((sum, pr) => sum + pr.deletions, 0);

  return {
    githubLogin,
    prCount: authoredPRs.length,
    mergedPRCount: mergedPRs.length,
    openPRCount: openPRs.length,
    commitCount: authoredCommits.length,
    reviewCount: authoredReviews.length,
    approvalsGiven: approvals.length,
    linesAdded,
    linesRemoved,
    avgPRCycleTimeHours: avgCycleTime,
    stalePRCount: stalePRs.length,
  };
}
*/

// ── Updated developer rating formula (Jira + GitHub) ─────

export function calculateDevRating(params: {
  deliveryRate: number;       // 0–100 from Jira
  reworkRate: number;         // 0–100 from Jira
  prMergeRate: number;        // mergedPRs / totalPRs * 100
  avgCycleTimeHours: number;  // lower = better, benchmark = 24h
  reviewContribution: number; // reviews given (normalized 0–100)
}): number {
  const { deliveryRate, reworkRate, prMergeRate, avgCycleTimeHours, reviewContribution } = params;

  // Weights
  const w = { delivery: 0.35, rework: 0.25, prMerge: 0.20, cycleTime: 0.10, review: 0.10 };

  // Normalize cycle time: 0h = 100pts, 48h+ = 0pts
  const cycleScore = Math.max(0, 100 - (avgCycleTimeHours / 48) * 100);

  const score =
    deliveryRate * w.delivery +
    (100 - reworkRate) * w.rework +
    prMergeRate * w.prMerge +
    cycleScore * w.cycleTime +
    reviewContribution * w.review;

  return Math.round((score / 20) * 10) / 10; // scale to 0–5
}

// ── PR staleness alert ────────────────────────────────────

export interface PRAlert {
  prNumber: number;
  title: string;
  authorLogin: string;
  jiraKeys: string[];
  openSinceHours: number;
  status: PRStatus;
  severity: "warning" | "critical";
}

/*
export function detectStaleAlerts(prs: GithubPullRequest[]): PRAlert[] {
  const now = Date.now();
  const alerts: PRAlert[] = [];

  for (const pr of prs) {
    if (pr.state !== "open" || pr.draft) continue;

    const openSinceHours =
      (now - new Date(pr.created_at).getTime()) / (1000 * 60 * 60);

    if (openSinceHours < 24) continue; // not stale yet

    alerts.push({
      prNumber: pr.number,
      title: pr.title,
      authorLogin: pr.user.login,
      jiraKeys: extractJiraKeys(pr),
      openSinceHours: Math.round(openSinceHours),
      status: "open",
      severity: openSinceHours > 72 ? "critical" : "warning",
    });
  }

  return alerts.sort((a, b) => b.openSinceHours - a.openSinceHours);
}
*/
