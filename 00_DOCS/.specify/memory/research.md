# Spravio — Technical Research Document

> Visão comprimida do codebase existente para contexto de desenvolvimento.
> Atualizado: 2026-04-04 | Branch: `main` | Pós-implementação specs 017-022

---

## 1. Estado Atual

| Métrica | Valor |
|---------|-------|
| Fases implementadas | 16/16 ✅ |
| Specs de correção | 6/6 ✅ |
| TypeScript errors | 0 |
| Lint errors | 0 |
| Lint warnings | 2 (pré-existentes) |
| Database models | 23 |
| API endpoints | 53 |
| Frontend pages | 14 |
| Background jobs | 15 |
| Integrações | 14 |
| **Test framework** | Vitest ✅ |
| **Password hashing** | bcryptjs ✅ |
| **Auth guards** | Implementados ✅ |

---

## 2. Database Schema

### Models (23)

```prisma
// Multi-tenancy
Organization           # Raiz multi-tenant
OrganizationUser       # User ↔ Org (role: OWNER|PM|VIEWER)
OrganizationSettings   # Credenciais por org

// Auth
User                   # email, passwordHash, stripeCustomerId
Account                # OAuth (NextAuth)
Session                # Sessions (NextAuth)

// Core Domain
Project                # source: jira|azure|trello|clickup|linear|asana|monday
ProjectAssignment      # GP ↔ Project
Sprint                 # 7 external ID fields (jira/azure/trello/etc)
BurndownPoint          # Daily burndown data
Epic                   # Epic grouping

// People
Developer              # 9 external user ID fields
ProjectDeveloper       # Metrics per project (rating, deliveryRate)

// Work Items
Issue                  # 7 external issue IDs, linkedPRNumber

// Financial
ProjectBudget          # totalBudget, currency, dates
DeveloperRate          # Hourly rate per dev/project
SprintHours            # Hours logged (manual|tempo|clockify)

// Notifications
SlackConfig            # Per-project Slack webhook + alert types
TeamsConfig            # Per-project Teams webhook + alert types

// Time Tracking Config
TempoConfig            # Per-project Tempo API token
ClockifyConfig         # Per-project Clockify config

// AI
DeliveryForecast       # onTimeProbability, predictedEndDate, reasoning

// Audit
SyncLog                # Sync job status/errors/duration
```

### Enums (7)

```prisma
OrgRole:            OWNER | PROJECT_MANAGER | VIEWER
SprintState:        FUTURE | ACTIVE | CLOSED
IssueType:          BACKEND | FRONTEND | DESIGN | DEVOPS
IssueStatus:        TODO | IN_PROGRESS | TEST | UAT | DONE | CANCELLED
SyncType:           FULL | SPRINT | INCREMENTAL | GITHUB | AZURE | GITLAB | 
                    TEMPO | CLOCKIFY | TRELLO | CLICKUP | LINEAR | ASANA | MONDAY
SyncStatus:         RUNNING | SUCCESS | FAILED | PARTIAL
SubscriptionStatus: TRIALING | ACTIVE | PAST_DUE | CANCELLED
```

---

## 3. API Routes (53 endpoints)

### Auth (2)
| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/login` | Public |
| POST | `/auth/register` | Public |

### Projects (5)
| Method | Path | Auth |
|--------|------|------|
| GET | `/projects` | ⚠️ None |
| GET | `/projects/mine` | Any role |
| GET | `/projects/:id` | ⚠️ None |
| POST | `/projects` | OWNER |
| DELETE | `/projects/:id` | ⚠️ None |

### Sprints (2)
| Method | Path | Auth |
|--------|------|------|
| GET | `/projects/:projectId/sprints` | ⚠️ None |
| GET | `/projects/:projectId/sprints/current` | ⚠️ None |

### Developers (2)
| Method | Path | Auth |
|--------|------|------|
| GET | `/projects/:projectId/developers` | ⚠️ None |
| GET | `/projects/:projectId/developers/:devId/cards` | ⚠️ None |

### Pull Requests (3)
| Method | Path | Auth |
|--------|------|------|
| GET | `/projects/:projectId/pullrequests` | ⚠️ None |
| GET | `/projects/:projectId/pullrequests/stats` | ⚠️ None |
| POST | `/projects/:projectId/sync/github` | ⚠️ None |

### Billing (4)
| Method | Path | Auth |
|--------|------|------|
| POST | `/billing/checkout` | OWNER |
| POST | `/billing/portal` | OWNER |
| GET | `/billing/subscription` | Any role |
| POST | `/billing/webhook` | Stripe sig |

### Budget & Financials (6)
| Method | Path | Auth |
|--------|------|------|
| GET | `/projects/:projectId/budget` | Any role |
| POST | `/projects/:projectId/budget` | OWNER/PM |
| PUT | `/projects/:projectId/developers/:devId/rate` | OWNER |
| POST | `/projects/:projectId/sprints/:sprintId/hours` | OWNER/PM |
| GET | `/projects/:projectId/financials` | Any role |
| POST | `/projects/:projectId/hours/sync` | OWNER/PM |

### Alerts & Config (8)
| Method | Path | Auth |
|--------|------|------|
| GET/PUT/DELETE | `/projects/:projectId/slack-config` | OWNER/PM |
| POST | `/projects/:projectId/slack-config/test` | OWNER/PM |
| GET/PUT/DELETE | `/projects/:projectId/teams-config` | OWNER/PM |
| POST | `/projects/:projectId/teams-config/test` | OWNER/PM |

### Sync Triggers (12)
| Method | Path | Source |
|--------|------|--------|
| POST | `/projects/:projectId/sync/jira` | Jira |
| POST | `/projects/:projectId/sync/azure` | Azure |
| POST | `/projects/:projectId/sync/github` | GitHub |
| POST | `/projects/:projectId/sync/gitlab` | GitLab |
| POST | `/projects/:projectId/sync/tempo` | Tempo |
| POST | `/projects/:projectId/sync/clockify` | Clockify |
| POST | `/projects/:projectId/sync/trello` | Trello |
| POST | `/projects/:projectId/sync/clickup` | ClickUp |
| POST | `/projects/:projectId/sync/linear` | Linear |
| POST | `/projects/:projectId/sync/asana` | Asana |
| POST | `/projects/:projectId/sync/monday` | Monday |

### AI Forecast (3)
| Method | Path | Auth |
|--------|------|------|
| GET | `/projects/:projectId/forecast` | PM |
| GET | `/projects/:projectId/forecast/history` | PM |
| POST | `/projects/:projectId/forecast/generate` | PM |

---

## 4. Background Jobs (15)

| Job | Queue | Trigger |
|-----|-------|---------|
| syncJira.job.ts | sync:jira | Manual/Cron |
| syncAzure.job.ts | sync:azure | Manual/Cron |
| syncGitHub.job.ts | sync:github | Manual |
| syncGitLab.job.ts | sync:gitlab | Manual |
| syncTempo.job.ts | sync:tempo | Manual |
| syncClockify.job.ts | sync:clockify | Manual |
| syncTrello.job.ts | sync:trello | Manual |
| syncClickUp.job.ts | sync:clickup | Manual |
| syncLinear.job.ts | sync:linear | Manual |
| syncAsana.job.ts | sync:asana | Manual |
| syncMonday.job.ts | sync:monday | Manual |
| burndownSnapshot.job.ts | burndown | Cron diário |
| slackAlert.job.ts | alerts:slack | Event-driven |
| teamsAlert.job.ts | alerts:teams | Event-driven |
| stalePrDetector.job.ts | stale-pr | Cron |

---

## 5. Frontend Structure

### Pages (14)
```
/                           # Landing/redirect
/login                      # Login form
/register                   # Registration form
/onboarding                 # Wizard de setup
/dashboard                  # Lista de projetos
/portfolio                  # Owner: todos projetos por GP
/projects/[id]              # Layout do projeto
/projects/[id]/overview     # KPIs + burndown + progress
/projects/[id]/sprint       # Sprint atual + cards
/projects/[id]/developers   # Grid de devs + metrics
/projects/[id]/pullrequests # PRs + stale alerts
/projects/[id]/backlog      # Backlog by Epic
/projects/[id]/financials   # Budget + costs
/projects/[id]/settings     # Slack/Teams config
```

### Key Components (~36)
- `DeveloperCard` — avatar, stars, delivery/return bars
- `BurndownChart` — Recharts LineChart
- `ProgressDonut` — Done/UAT/Test/InProgress
- `PointsDonut` — Backend vs Frontend
- `SprintMetrics` — cards, % completed
- `PRList` — PRs + stale badges
- `BacklogTable` — grouped by Epic
- `BudgetGauge` — consumed/total
- `SlackSettingsForm` / `TeamsSettingsForm`
- `OnboardingWizard` — 3-step setup

---

## 6. Integration Patterns

### HTTP Client Pattern
```typescript
// client.ts
const client = axios.create({
  baseURL: process.env.SERVICE_BASE_URL,
  headers: { Authorization: `Bearer ${token}` }
});

// Rate limiting
const limiter = pLimit(10); // 10 concurrent

// Redis cache
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
const data = await client.get(endpoint);
await redis.setex(cacheKey, 300, JSON.stringify(data));
```

### Mapper Pattern
```typescript
// mappers.ts
export function mapExternalIssue(raw: ExternalIssue): Issue {
  return {
    id: raw.id,
    title: raw.name,
    status: mapStatus(raw.state),
    points: extractPoints(raw.customFields),
    // ...
  };
}
```

### Sync Job Pattern
```typescript
// syncX.job.ts
const processor = async (job: Job<SyncJobData>) => {
  const log = await createSyncLog(job.data.projectId, 'X');
  try {
    const data = await fetchFromExternal(job.data);
    await upsertToDatabase(data);
    await completeSyncLog(log.id, 'SUCCESS');
  } catch (error) {
    await completeSyncLog(log.id, 'FAILED', error.message);
    throw error;
  }
};
```

---

## 7. Known Issues & Technical Debt

### ✅ Resolvidos (Specs 017-022)
| Issue | Spec | Status |
|-------|------|--------|
| Senhas em plaintext | 017-password-security | ✅ bcryptjs implementado |
| Rotas sem auth guards | 018-auth-guards | ✅ Guards implementados |
| Sem migrations formais fases 10-16 | 019-formal-migrations | ✅ Migrations criadas |
| Onboarding só jira/azure | 020-onboarding-all-sources | ✅ 7 fontes suportadas |
| Settings só mostra Slack | 021-settings-full-config | ✅ Teams/Tempo/Clockify |
| Zero testes | 022-test-foundation | ✅ Vitest configurado |

### 🟡 Remaining (Low Priority)
| Issue | Location |
|-------|----------|
| 2 unused variables | syncAsana.job.ts:37, forecast/service.ts:82 |
| Sem loading/error em financials/settings | financials/, settings/ |
| Project.source é String, não enum | schema.prisma:122 |

---

## 8. Environment Variables

### API (apps/api/.env)
```bash
# Required
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=min8chars

# Optional - PM Tools
JIRA_BASE_URL=
JIRA_EMAIL=
JIRA_API_TOKEN=
AZURE_ORG=
AZURE_PAT=
TRELLO_API_KEY=
TRELLO_TOKEN=
CLICKUP_API_TOKEN=
LINEAR_API_KEY=
ASANA_TOKEN=
MONDAY_API_TOKEN=

# Optional - Code Platforms
GITHUB_TOKEN=
GITHUB_ORG=
GITLAB_URL=
GITLAB_TOKEN=
GITLAB_GROUP=

# Optional - Time Tracking
TEMPO_API_TOKEN=
CLOCKIFY_API_KEY=
CLOCKIFY_WORKSPACE_ID=

# Optional - Notifications
SLACK_BOT_TOKEN=
SLACK_DEFAULT_CHANNEL=

# Optional - Billing
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_GROWTH=
STRIPE_PRICE_SCALE=

# Optional - AI
ANTHROPIC_API_KEY=

# Optional - Monitoring
SENTRY_DSN_API=
```

### Web (apps/web/.env.local)
```bash
NEXTAUTH_URL=http://localhost:3011
NEXTAUTH_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:3010
SENTRY_DSN_WEB=
```

---

## 9. Dev Commands

```bash
pnpm install                     # Instalar deps
docker-compose up -d             # Postgres + Redis
pnpm --filter api prisma generate
pnpm --filter api prisma migrate dev
pnpm dev                         # API :3010 + Web :3011
pnpm typecheck                   # Must pass 0 errors
pnpm lint                        # Must pass 0 warnings
```

---

## 10. Specs de Correção (Completas ✅)

| ID | Spec | Prioridade | Status |
|----|------|------------|--------|
| 017 | Password Security (bcrypt) | 🔴 Crítica | ✅ Done |
| 018 | Auth Guards | 🟠 Média | ✅ Done |
| 019 | Formal Migrations | 🟠 Média | ✅ Done |
| 020 | Onboarding All Sources | 🟡 Baixa | ✅ Done |
| 021 | Settings Full Config | 🟡 Baixa | ✅ Done |
| 022 | Test Foundation | 🟡 Baixa | ✅ Done |

### Resumo das Implementações

**017 - Password Security**
- bcryptjs ^3.0.3 instalado
- Hash com cost factor 12
- Migração transparente de senhas legacy

**018 - Auth Guards**
- Middleware authGuard em todas rotas sensíveis
- Role-based access (OWNER, PM, VIEWER)
- Org isolation funcionando

**019 - Formal Migrations**
- Baseline migration criada para fases 10-16
- `prisma migrate status` limpo

**020 - Onboarding All Sources**
- 7 fontes suportadas: Jira, Azure, Trello, ClickUp, Linear, Asana, Monday
- Formulários dinâmicos por fonte
- Teste de conexão funcional

**021 - Settings Full Config**
- Tabs: Notificações, Time Tracking, Integrações
- Configuração de Teams, Tempo, Clockify pela UI
- Status de conexão visual

**022 - Test Foundation**
- Vitest configurado
- Mocks de Prisma e Redis
- Estrutura de testes pronta

---

## 11. Próximos Passos Sugeridos

| Prioridade | Feature | Descrição |
|------------|---------|-----------|
| 🟠 Média | Mais testes | Aumentar cobertura para >60% |
| 🟠 Média | E2E tests | Playwright para fluxos críticos |
| 🟡 Baixa | Loading states | Skeletons em financials/settings |
| 🟡 Baixa | Project.source enum | Migrar String → Enum |
| 🟡 Baixa | Unused vars | Limpar 2 warnings restantes |
