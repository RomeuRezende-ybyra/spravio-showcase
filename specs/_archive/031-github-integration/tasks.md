# 031 — GitHub OAuth Integration — Tarefas

> **Status:** ✅ Todas completas (retroativo)

---

## Tarefas

### Backend — Integration Layer

- [x] **T1:** Criar `integrations/github/types.ts` com tipos da API (GithubUser, GithubPullRequest, GithubCommit, GithubReview, GithubContributorStats)
- [x] **T2:** Criar `integrations/github/client.ts` com HTTP client (Bearer auth, rate limit handling, retry logic)
- [x] **T3:** Criar `integrations/github/endpoints.ts` com chamadas à API (getPullRequests, getCommits, getPRReviews, getContributorStats) + Redis cache TTL 5min
- [x] **T4:** Criar `integrations/github/mappers.ts` (extractJiraKeys, normalizePRStatus, detectStalePRs, mapGithubDevMetrics, calculateDevRating)
- [x] **T5:** Criar barrel export `integrations/github/index.ts`

### Backend — OAuth & Org Connection

- [x] **T6:** Adicionar route `POST /auth/oauth/github` para login/registro via GitHub
- [x] **T7:** Adicionar routes em `modules/organizations/route.ts`: connect, disconnect, status
- [x] **T8:** Implementar auto-registro de webhook em org connect (POST /orgs/{org}/hooks)
- [x] **T9:** Criptografar tokens com `secureToken()` antes de salvar em OrganizationSettings

### Backend — Webhook Handling

- [x] **T10:** Criar `modules/github-webhook/verify.ts` com HMAC-SHA256 verification (timingSafeEqual)
- [x] **T11:** Criar `modules/github-webhook/route.ts` (POST /webhooks/github)
- [x] **T12:** Criar `modules/github-webhook/handlers.ts` (pull_request → update Issue.linkedPRStatus)
- [x] **T13:** Criar `modules/github-webhook/types.ts` com Zod schemas para payloads
- [x] **T14:** Implementar deduplicação via X-GitHub-Delivery header (GitHubWebhookEvent)

### Backend — Project Linking & Sync

- [x] **T15:** Adicionar routes `modules/github/route.ts`: GET repos, POST connect, DELETE disconnect
- [x] **T16:** Criar `jobs/syncGithub.job.ts` (sync PRs, reviews, contributor stats via BullMQ)
- [x] **T17:** Implementar Jira key extraction (PR title + branch + body)

### Database

- [x] **T18:** Adicionar model `GitHubWebhookConfig` ao schema Prisma
- [x] **T19:** Adicionar model `GitHubWebhookEvent` ao schema Prisma
- [x] **T20:** Adicionar fields `githubOrg`, `githubToken` a OrganizationSettings
- [x] **T21:** Adicionar field `githubRepo` a Project
- [x] **T22:** Adicionar fields `linkedPRNumber`, `linkedPRStatus` a Issue
- [x] **T23:** Criar e aplicar migration

### Frontend

- [x] **T24:** Criar `lib/api/github.ts` com API client (listRepos, connectRepo, disconnectRepo, getStatus)
- [x] **T25:** Criar `components/onboarding/step-connect-github.tsx`
- [x] **T26:** Criar `components/integrations/github-repo-selector.tsx` (dropdown com search)
- [x] **T27:** Criar `components/shared/github-placeholder.tsx`

### Security

- [x] **T28:** Auth guards (OWNER, PROJECT_MANAGER) em todas as routes de connect/disconnect
- [x] **T29:** Tenant isolation (organizationId filter) em todas as queries
- [x] **T30:** Webhook signature verification com timing-safe comparison

---

## Resumo

| Área | Tarefas | Completas |
|------|---------|-----------|
| Integration Layer | 5 | 5 |
| OAuth & Org | 4 | 4 |
| Webhooks | 5 | 5 |
| Project & Sync | 3 | 3 |
| Database | 6 | 6 |
| Frontend | 4 | 4 |
| Security | 3 | 3 |
| **Total** | **30** | **30** |
