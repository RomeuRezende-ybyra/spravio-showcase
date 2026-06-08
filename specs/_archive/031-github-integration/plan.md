# 031 — GitHub OAuth Integration — Plano Técnico

> **Status:** ✅ Implementado (retroativo)

---

## Decisões Técnicas

### 1. Modelo de Credentials: Platform vs Org

**Decisão:** Two-level credential model

- **Platform-level:** `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — OAuth App da plataforma Spravio, configurado no servidor via env vars. O usuário final nunca vê esses valores.
- **Org-level:** `githubToken` — Obtido via OAuth flow, armazenado criptografado em `OrganizationSettings`. Cada organização tem seu próprio token.

**Justificativa:** SaaS multi-tenant. A plataforma possui o OAuth App, cada cliente autoriza acesso aos seus repos através dele.

### 2. OAuth Flow

```
Browser                  Spravio API              GitHub
  |                          |                       |
  |-- Click "Login GitHub" ->|                       |
  |                          |-- POST /login/oauth -->|
  |                          |   (client_id, code)    |
  |                          |<-- access_token -------|
  |                          |                       |
  |                          |-- GET /user ---------->|
  |                          |<-- user profile -------|
  |                          |                       |
  |<-- JWT token ------------|                       |
```

### 3. Webhook Architecture

**Decisão:** Org-level webhooks (não repo-level)

- Um webhook por organização GitHub (registrado em `/orgs/{org}/hooks`)
- Todos os eventos de todos os repos da org passam pelo mesmo endpoint
- Matching de projeto via `repo.full_name` → `Project.githubRepo`

**Justificativa:** Simplifica gerenciamento. Não precisa registrar/desregistrar webhook por repo.

### 4. Webhook Security

- Shared secret gerado por org, armazenado criptografado em `GitHubWebhookConfig`
- Verification via HMAC-SHA256 com `timingSafeEqual`
- Deduplicação via `X-GitHub-Delivery` header
- Event log em `GitHubWebhookEvent` para auditoria

### 5. Data Sync Strategy

**Decisão:** Hybrid (webhook + background job)

- **Real-time:** Webhooks atualizam PR status imediatamente
- **Batch:** Background job (`sync-github` via BullMQ) faz sync completo periodicamente
- **Cache:** Redis TTL 5min para dados da API

**Justificativa:** Webhooks podem falhar. Job garante consistência eventual.

### 6. Jira Cross-Linking

**Algoritmo:** Extração de Jira keys de 3 fontes:
1. PR title (ex: `[PROJ-123] Fix login bug`)
2. Branch name (ex: `feature/PROJ-123-fix-login`)
3. PR body (ex: `Fixes PROJ-123`)

Pattern: `/[A-Z][A-Z0-9]+-\d+/g`

---

## Arquitetura de Arquivos

```
apps/api/src/
├── integrations/github/
│   ├── types.ts           # GithubUser, GithubPullRequest, etc.
│   ├── client.ts          # HTTP client + rate limit + retry
│   ├── endpoints.ts       # getPullRequests, getCommits, etc.
│   ├── mappers.ts         # extractJiraKeys, normalizePRStatus, etc.
│   └── index.ts           # Barrel export
├── modules/github/
│   ├── route.ts           # /github/repos, /projects/:id/github/*
│   ├── service.ts         # Token validation, repo listing
│   └── types.ts           # Zod schemas
├── modules/github-webhook/
│   ├── route.ts           # POST /webhooks/github
│   ├── handlers.ts        # pull_request, push event handlers
│   ├── verify.ts          # HMAC signature verification
│   └── types.ts           # Webhook payload schemas
├── modules/organizations/
│   └── route.ts           # /organizations/github/connect|disconnect|status
└── jobs/
    └── syncGithub.job.ts  # Background sync job

apps/web/src/
├── lib/api/github.ts                          # API client
├── components/onboarding/step-connect-github.tsx
├── components/integrations/github-repo-selector.tsx
└── components/shared/github-placeholder.tsx
```

---

## Segurança

| Aspecto | Implementação |
|---------|---------------|
| Token storage | Encrypted at rest (`secureToken()`) |
| Webhook verification | HMAC-SHA256 + `timingSafeEqual` |
| Tenant isolation | Todas queries filtradas por `organizationId` |
| Rate limiting | `p-limit` concurrency: 10 |
| CORS | `ALLOWED_ORIGINS` restrito |
| Auth guards | OWNER/PROJECT_MANAGER para connect/disconnect |

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Token revogado pelo usuário | Status check valida token; UI mostra desconectado |
| Webhook delivery failure | Background job como fallback para consistência |
| Rate limit da GitHub API | Redis cache + p-limit + retry com backoff |
| Org sem repos acessíveis | UI mostra mensagem clara, não quebra |
