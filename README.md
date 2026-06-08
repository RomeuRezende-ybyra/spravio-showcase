# Spravio — Engineering Observability Platform

> A multi-tenant SaaS that connects a team's project-management, code, time-tracking and messaging tools into a single source of truth — sprints, issues, pull requests, hours and budget — with AI-assisted delivery forecasting and a no-login client portal.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

**🔗 Live demo:** https://www.spravio.io

> **Demo access:** demo@spravio.io / spravio123456!
> Sample data only — explore freely.

---

> **A note on this repository.** This is a curated, sanitized public showcase of a production SaaS I designed and built. Secrets, infrastructure details and customer data have been removed; environment variables are documented as placeholders in `.env.example`. The goal is to demonstrate architecture and code quality, not to be a one-click deployable copy.

---

## Why this project is worth a look

Most side projects are a single app with a database. Spravio is a **real multi-tenant SaaS** with the moving parts production systems actually need:

- **14 external integrations** behind a consistent client/mapper abstraction — REST *and* GraphQL providers normalized into one internal model.
- **Multi-tenant data isolation** with organization-scoped access and role-based permissions.
- **Background processing** (BullMQ + Redis) for syncing large volumes of issues, sprints and webhooks without blocking requests.
- **AI-assisted delivery forecasting** using Anthropic Claude to turn historical sprint data into delivery predictions.
- **A no-login client portal** — external stakeholders view project status through a tokenized link, fully isolated from the authenticated app.
- **Security & LGPD engineering** treated as first-class features (encryption at rest, log sanitization, tenant-isolation auditing, data export/erasure) — see [Security](#security--lgpd).
- **Spec-driven development** — the `specs/` directory holds the written specification for nearly every feature before it was built. See [How it was built](#how-it-was-built).

---

## What it does

Engineering teams run on a dozen disconnected tools. Spravio connects them and answers the questions managers actually ask:

- **Are we on track?** Sprints, burndown and an AI forecast of the delivery date.
- **What's it costing?** Developer rates × logged hours vs. project budget.
- **What's happening across the portfolio?** Issues, PRs and activity from every connected tool in one dashboard.
- **How do I keep the client informed?** A shareable portal link — no account required.

---

## Architecture

A **pnpm-workspaces monorepo** with a clear separation between the API, the web app, and shared type-safe contracts.

```
spravio/
├── apps/
│   ├── api/                     # Fastify 5 backend
│   │   ├── prisma/              # Schema + seed (organizations → projects → sprints → forecasts)
│   │   └── src/
│   │       ├── modules/         # 20 domain modules (auth, projects, sprints, budget, forecast, billing, portal, …)
│   │       └── integrations/    # 14 external services (PM, code, time-tracking, messaging, AI)
│   └── web/                     # Next.js 16 (App Router)
│       └── src/app/
│           ├── (auth)/          # Login / register / password reset
│           ├── (dashboard)/     # Portfolio, projects, sprints, forecast, financial, settings
│           ├── portal/[token]/  # Client-facing portal (no login)
│           └── api/             # NextAuth + OAuth callback routes
├── packages/
│   ├── types/                   # @spravio/types — shared Zod schemas + TS types
│   └── utils/                   # @spravio/utils — shared helpers
├── specs/                       # Written specifications (the project's blueprint)
├── docker-compose.yml           # Dev stack: postgres, redis, api, web
├── docker-compose.prod.yml      # Prod stack: GHCR images behind Traefik
└── .github/workflows/           # CI/CD pipelines
```

**Design decisions worth highlighting:**

- **Shared contracts package.** Zod schemas in `@spravio/types` are the single source of truth for validation *and* TypeScript types, shared across API and web — no drift between client and server.
- **Integration abstraction.** Every provider follows the same `client + endpoints/queries + mappers + types` shape, so each external API is normalized into one internal domain model. Adding a 15th integration is a known, repeatable task.
- **Queue-backed syncing.** External data is pulled by BullMQ workers, keeping request latency low and making syncs observable and retry-safe.
- **Tenant isolation by design.** Access is organization-scoped throughout, with the client portal deliberately running on a separate, tokenized surface.

---

## Tech stack

### Backend (`apps/api`)
| Concern | Technology |
|---|---|
| Framework | Fastify 5 (TypeScript, `tsx`) |
| ORM / DB | Prisma 6 · PostgreSQL 15 |
| Cache / Queue | Redis 7 (ioredis) · BullMQ |
| Auth | `@fastify/jwt` · jsonwebtoken · bcryptjs |
| Validation | Zod |
| Payments | Stripe |
| Hardening | `@fastify/helmet` · `@fastify/rate-limit` |
| Observability | Pino logging · Sentry |
| AI | `@anthropic-ai/sdk` |

### Frontend (`apps/web`)
| Concern | Technology |
|---|---|
| Framework | Next.js 16 (App Router) · React 18 |
| Auth | NextAuth |
| Styling | Tailwind CSS · CVA · tailwind-merge · lucide-react |
| Data grids | TanStack Table + TanStack Virtual |
| Charts | Recharts |
| Interaction | dnd-kit · cmdk (command palette) · Fuse.js (fuzzy search) |
| Payments | Stripe.js |
| Observability | Sentry |

### Tooling & infra
pnpm workspaces · Vitest + Testing Library · ESLint + typescript-eslint · Docker Compose (dev + Traefik prod) · GitHub Actions CI/CD.

---

## Integrations

Fourteen external services, each normalized into Spravio's internal model:

| Category | Services |
|---|---|
| **Project management** | Jira · Azure DevOps · Trello · ClickUp · Linear* · Asana · Monday* |
| **Code** | GitHub · GitLab |
| **Time tracking** | Tempo · Clockify |
| **Messaging** | Slack · Microsoft Teams |
| **AI** | Anthropic Claude (delivery forecasting) |

<sub>* Linear and Monday use GraphQL; the rest are REST — both handled by the same abstraction.</sub>

---

## Security & LGPD

Security was specified and built as a feature set, not an afterthought. The repository includes a dedicated set of security/LGPD specifications covering:

- **Token encryption at rest** (AES-256-GCM) for third-party integration credentials, with versioned keys to support rotation.
- **Log sanitization** to keep secrets and PII out of logs.
- **Tenant-isolation auditing.**
- **Data retention & erasure**, **data export / portability**, **integration-disconnect** flows, **audit logging**, and **scope minimization** — the building blocks of an LGPD/GDPR-aware platform.

These live alongside the application specs and reflect how I think about handling other people's data.

---

## How it was built

Spravio was developed using a **spec-driven development (SDD)** workflow: each feature was written as a specification *before* implementation. The `specs/` directory is part of the repository on purpose — it shows the reasoning, scope and acceptance criteria behind the code, not just the result.

This is the same approach I bring to client work: decisions documented, scope explicit, and a codebase any competent team can pick up and extend.

---

## Running locally

```bash
pnpm install
cp .env.example .env        # fill in your own values
docker compose up -d        # postgres + redis
pnpm --filter @spravio/api prisma migrate dev
pnpm dev                    # api on :3010, web on :3011
```

> `.env.example` documents every variable the app expects. No real credentials are included.

---

## Author

**Romeu Rezende** — Technical Project Manager & Full-Stack SaaS Developer
*Project Manager | Delivery | Product Manager*

I design and build multi-tenant SaaS products end to end — architecture, delivery and code. Spravio is one of several products I've built on this stack.

- 🌐 Blog: [romeurezende.com.br](https://romeurezende.com.br)
- 💼 Available for SaaS architecture, technical specs and full-stack development.

---

<sub>This repository is a sanitized public showcase. The production codebase is private.</sub>
