# Spravio — Research (Estado do Codebase)

> Snapshot do estado atual. Atualizar após cada fase/feature major.

---

## Resumo

- **Monorepo**: pnpm workspaces (`apps/*`, `packages/*`)
- **Pacotes**: `@spravio/api`, `@spravio/web`, `@spravio/types`, `@spravio/utils`
- **Fases implementadas**: 1–16 (todas completas)
- **TypeScript**: 0 errors | **Lint**: 0 errors, 2 warnings
- **Branch**: main | **Último commit**: 880aded

---

## Backend (53 endpoints, 16 módulos)

### Módulos
| Módulo | Endpoints | Auth |
|--------|-----------|------|
| auth | POST /login, POST /register | Público |
| projects | 5 endpoints (CRUD + sync) | JWT |
| sprints | 3 endpoints (list, sync, stats) | JWT |
| developers | 4 endpoints (list, CRUD, link) | JWT |
| overview | 1 endpoint (dashboard stats) | JWT |
| pullrequests | 2 endpoints (list, sync) | JWT |
| billing | 5 endpoints (plans, checkout, portal, webhook, status) | Misto |
| budget | 3 endpoints (get, upsert, sprint-hours) | JWT |
| portal | 3 endpoints (project, sprints, sprint-detail) | Portal secret |
| assignments | 2 endpoints (list, bulk-assign) | JWT |
| report | 1 endpoint (sprint-report) | JWT |
| slack-config | 2 endpoints (get, upsert) | JWT |
| teams-config | 2 endpoints (get, upsert) | JWT |
| tempo-config | 3 endpoints (get, upsert, sync) | JWT |
| clockify-config | 3 endpoints (get, upsert, sync) | JWT |
| forecast | 4 endpoints (generate, latest, history, insights) | JWT |

### Plugins registados
- `@fastify/cors` (origin: *)
- `@fastify/jwt` (HS256, 7d expiry)
- `@fastify/formbody`
- `@sentry/node` (Fastify integration)
- Pino logger

### Jobs (BullMQ)
- `alertDetector` — Detecta sprints com risco e notifica Slack/Teams
- `scheduler` — Cron job que agenda alertDetector

---

## Database (23 models, 7 enums)

### Models principais
Organization, User, OrganizationUser, Project, Sprint, Issue, Developer, DeveloperAssignment, ProjectBudget, DeveloperRate, SprintHours, PullRequest, SlackConfig, TeamsConfig, TempoConfig, ClockifyConfig, PortalConfig, Subscription, DeliveryForecast, SprintReport, AlertRule, AlertHistory, AuditLog

### Enums
OrgRole, ProjectSource, ProjectStatus, IssueStatus, IssuePriority, SprintStatus, SubscriptionPlan

### Migrations aplicadas (6)
1. `init` — Schema base
2. `add_developer_assignment` — Assignments model
3. `add_budget_models` — Budget/rates/hours
4. `add_portal_config` — Portal configs
5. `add_subscription_model` — Subscription/billing
6. `add_delivery_forecast` — AI forecasts

> Fases 10-16 NÃO têm migrations formais (schema evoluiu via `db push`)

---

## Frontend (14 páginas)

| Página | Rota | Funcionalidade |
|--------|------|---------------|
| Portfolio | `/[orgSlug]` | Lista de projetos |
| Overview | `/[orgSlug]/[projectSlug]` | Dashboard do projeto |
| Sprint | `.../sprint` | Sprint board + charts |
| Developers | `.../developers` | Lista + CRUD devs |
| Pull Requests | `.../pullrequests` | PRs do repositório |
| Financials | `.../financials` | Budget + rates |
| Backlog | `.../backlog` | Issues backlog |
| Settings | `.../settings` | Configs do projeto |
| Portal | `/portal/[token]` | Client-facing portal |
| Billing | `/billing` | Planos + Stripe |
| Login | `/login` | Auth login |
| Register | `/register` | Auth register |
| Onboarding | `/onboarding` | Setup wizard (Jira/Azure) |
| Forecast | `.../forecast` | AI delivery forecast |

---

## Integrações (14 serviços)

| Categoria | Serviços | Status |
|-----------|----------|--------|
| PM (7) | Jira, Azure DevOps, Trello, ClickUp, Linear, Asana, Monday | Implementados |
| Code (2) | GitHub, GitLab | Implementados |
| Time (2) | Tempo, Clockify | Implementados |
| Messaging (2) | Slack, Teams | Implementados |
| AI (1) | Anthropic Claude | Implementado |

---

## Known Issues

| Prioridade | Issue | Localização |
|------------|-------|-------------|
| CRÍTICO | Senhas em plaintext | `auth/route.ts:40,92` |
| Médio | Rotas sem auth guards | GET /projects, etc. |
| Médio | Sem migrations formais fases 10-16 | Prisma schema |
| Médio | Falta loading/error em financials e settings | Frontend pages |
| Baixo | Onboarding só suporta Jira/Azure | Wizard component |
| Baixo | Project.source é String, não enum | Prisma schema |
| Baixo | Zero testes no codebase | — |

---

*Última atualização: 2026-04-04*
