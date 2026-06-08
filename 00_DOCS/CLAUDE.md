# Spravio — CLAUDE.md

> Single source of truth para desenvolvimento com IA.
> Leia este arquivo completamente antes de escrever qualquer código.

---

## 🎯 Quick Start

```bash
# Antes de qualquer feature nova, siga o workflow SDD:
/speckit-specify [descrição da feature]   # Cria spec
/speckit-plan [feature-path]              # Cria plano técnico
/speckit-tasks [feature-path]             # Decompõe em tarefas
/speckit-analyze [feature-path]           # Valida consistência
/speckit-implement [feature-path]         # Implementa tarefas
```

---

## 📁 Estrutura do Projeto

```
spravio/
├── .specify/                    # SDD Framework
│   ├── memory/
│   │   ├── constitution.md      # ⚠️ LEIA PRIMEIRO - Princípios inegociáveis
│   │   └── research.md          # Estado atual do codebase
│   └── templates/
│       ├── spec-template.md     # Template para specs
│       ├── plan-template.md     # Template para planos
│       └── tasks-template.md    # Template para tarefas
├── .claude/commands/            # Comandos slash disponíveis
│   ├── specify.md
│   ├── plan.md
│   ├── tasks.md
│   ├── analyze.md
│   └── implement.md
├── specs/                       # Features (spec → plan → tasks)
│   └── [###-feature-name]/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── apps/
│   ├── api/                     # Fastify 5 backend :3010
│   └── web/                     # Next.js 14.2 frontend :3011
├── packages/
│   ├── types/                   # @spravio/types (Zod + TS)
│   └── utils/                   # @spravio/utils (helpers)
└── docker-compose.yml
```

---

## 🏛️ Constitution (Resumo)

> Detalhes completos em `.specify/memory/constitution.md`

### Tech Stack (INEGOCIÁVEL)
| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 14 App Router |
| UI | Tailwind + shadcn/ui |
| Backend | Fastify 5 |
| Validation | Zod |
| ORM | Prisma 6 |
| Database | PostgreSQL 15 |
| Cache | Redis 7 (TTL 300s) |
| Queue | BullMQ |
| Auth | NextAuth.js |
| Package Manager | pnpm |

### Estrutura Obrigatória

**Backend modules:**
```
modules/<domain>/
├── route.ts       # Endpoints + Zod validation
├── service.ts     # Business logic
├── repository.ts  # Prisma queries
└── types.ts       # Local types
```

**Integrations:**
```
integrations/<service>/
├── types.ts       # Raw API types
├── client.ts      # HTTP + auth + rate limit
├── endpoints.ts   # API calls + cache
├── mappers.ts     # External → Internal
└── index.ts       # Barrel export
```

### Definition of Done

1. ✅ `pnpm typecheck` — 0 errors
2. ✅ `pnpm lint` — 0 warnings
3. ✅ Zod em inputs E outputs
4. ✅ Redis cache em chamadas externas
5. ✅ Prisma migration (se schema mudou)
6. ✅ loading.tsx + error.tsx
7. ✅ Sem `console.log` (usar Pino)

---

## 🔌 Integrações (14 serviços)

| Categoria | Serviços |
|-----------|----------|
| **PM (7)** | Jira, Azure DevOps, Trello, ClickUp, Linear, Asana, Monday |
| **Code (2)** | GitHub, GitLab |
| **Time (2)** | Tempo, Clockify |
| **Messaging (2)** | Slack, Teams |
| **AI (1)** | Anthropic Claude |

---

## 📊 Database (23 models)

> Schema completo em `.specify/memory/research.md`

Core: `Organization`, `User`, `Project`, `Sprint`, `Issue`, `Developer`
Financial: `ProjectBudget`, `DeveloperRate`, `SprintHours`
Config: `SlackConfig`, `TeamsConfig`, `TempoConfig`, `ClockifyConfig`
AI: `DeliveryForecast`

---

## 🚀 Fases Implementadas

> Para histórico detalhado, consulte [`CHANGELOG.md`](../CHANGELOG.md)

| Fase | Status | Descrição |
|------|--------|-----------|
| 1 | ✅ | Foundation (monorepo, Docker, Prisma) |
| 2 | ✅ | Jira Integration |
| 3 | ✅ | Dashboard |
| 4 | ✅ | GitHub Integration (basic) |
| 5 | ✅ | GP & Roles |
| 6 | ✅ | SaaS Features (Stripe, Portal) |
| 7 | ✅ | Slack Notifications |
| 8 | ✅ | Budget & Financial |
| 9 | ✅ | Azure DevOps |
| 10 | ✅ | GitLab + Teams |
| 11 | ✅ | Tempo + Clockify |
| 12 | ✅ | AI Forecast |
| 13 | ✅ | Trello |
| 14 | ✅ | ClickUp |
| 15 | ✅ | Linear |
| 16 | ✅ | Asana + Monday |
| — | ✅ | Password Security (bcrypt) — spec 017 |
| — | ✅ | Consolidation Migration — spec 019 |
| — | ✅ | Production Hardening — spec 020 |
| — | ✅ | Dashboard & UI Overhaul (OKLCH design system) |
| — | ✅ | Landing Page & Auth (multilingual, password reset) |
| — | ✅ | VPS Migration (Traefik, self-hosted) |
| — | ✅ | Settings APIs (notifications, security, webhooks, API keys) |
| — | ✅ | GitHub OAuth Integration — spec 031 |

---

## ⚠️ Known Issues

| Prioridade | Issue | Status |
|------------|-------|--------|
| ~~🔴 CRÍTICO~~ | ~~Senhas em plaintext~~ | ✅ Resolvido (bcrypt, spec 017) |
| 🟠 Médio | Rotas sem auth guards (GET /projects, etc.) | spec 018 pendente |
| ~~🟠 Médio~~ | ~~Sem migrations formais fases 10-16~~ | ✅ Resolvido (spec 019) |
| 🟡 Baixo | Onboarding só suporta Jira/Azure | — |
| 🟡 Baixo | Zero testes no codebase | spec 022 pendente |

---

## 💻 Dev Commands

```bash
pnpm install
docker-compose up -d
pnpm --filter api prisma generate
pnpm --filter api prisma migrate dev
pnpm dev                         # API :3010 + Web :3011
pnpm typecheck                   # Must pass
pnpm lint                        # Must pass
```

---

## 🔄 Workflow SDD

### Para nova feature:

```mermaid
graph LR
    A[Ideia] --> B[/speckit-specify]
    B --> C[spec.md]
    C --> D[Review]
    D --> E[/speckit-plan]
    E --> F[plan.md]
    F --> G[/speckit-tasks]
    G --> H[tasks.md]
    H --> I[/speckit-analyze]
    I --> J{OK?}
    J -->|Sim| K[/speckit-implement]
    J -->|Não| B
    K --> L[Código]
    L --> M[PR]
```

### Para bugfix rápido:

1. Leia `constitution.md`
2. Implemente seguindo os padrões
3. Verifique Definition of Done
4. Atualize CLAUDE.md se necessário

---

## 📝 Comandos Slash Disponíveis

| Comando | Descrição |
|---------|-----------|
| `/speckit-specify` | Criar especificação de feature |
| `/speckit-plan` | Criar plano técnico |
| `/speckit-tasks` | Decompor em tarefas |
| `/speckit-analyze` | Validar consistência |
| `/speckit-implement` | Implementar tarefas |

---

## 🎯 Regras de Ouro

1. **SEMPRE** leia `constitution.md` antes de codar
2. **SEMPRE** consulte `CHANGELOG.md` para saber o estado atual do projeto
3. **SEMPRE** crie spec antes de implementar (exceto hotfix de 1-3 linhas)
4. **NUNCA** use `any` — use `unknown` + type guards
5. **SEMPRE** cache chamadas externas (Redis TTL 300s)
6. **NUNCA** `console.log` em produção — use Pino
7. **SEMPRE** Zod em inputs E outputs de rotas
8. **NUNCA** SQL raw — use Prisma client
9. **SEMPRE** loading.tsx + error.tsx em rotas
10. **NUNCA** npm/yarn — use pnpm

---

*Última atualização: 2026-05-03*
*Branch: main | Commit: c658813*
