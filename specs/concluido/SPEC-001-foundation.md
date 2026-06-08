---
id: SPEC-001
title: "Foundation & Monorepo Setup"
status: concluido
prioridade: essencial
categoria: infraestrutura
ultima_atualizacao: "2026-04-01"
---

# Foundation & Monorepo Setup

## Resumo
Setup inicial do monorepo pnpm workspaces com Fastify 5 API, Next.js 14.2 frontend, Prisma 6 ORM, Redis caching, BullMQ job queue e NextAuth.js authentication.

## Status Atual
**100% implementado.** Base funcional em producao.

## O que Ja Existe

### Backend
- **Fastify Server** (`apps/api/src/server.ts`): Entry point com CORS, JWT, routes
- **Auth Module** (`apps/api/src/modules/auth/`): Login, register, forgot-password, reset-password
- **Prisma ORM** (`apps/api/prisma/schema.prisma`): 23+ models
- **Redis** (`apps/api/src/lib/redis.ts`): ioredis client
- **BullMQ** (`apps/api/src/jobs/queue.ts`): Job queue + scheduler
- **Pino Logger**: Structured logging

### Frontend
- **Next.js App Router** (`apps/web/src/app/`): Auth + Dashboard layouts
- **NextAuth.js** (`apps/web/src/lib/auth.ts`): Session management
- **Tailwind + shadcn/ui**: Design system
- **OKLCH Color System**: Theme tokens

### Packages
- **@spravio/types** (`packages/types/`): Shared Zod schemas (150+ types)
- **@spravio/utils** (`packages/utils/`): Shared utilities

### Infraestrutura
- **Docker Compose** (dev + prod)
- **GitHub Actions CI/CD** (`deploy.yml`)
- **GHCR** image registry

### Modelos de Dados (Core)
```prisma
model User { id, email, passwordHash, name, avatarUrl, language, timezone, theme }
model Organization { id, name, slug, stripeCustomerId, subscriptionStatus, planId }
model OrganizationUser { userId, organizationId, role (OWNER/PM/VIEWER) }
model OrganizationSettings { orgId, jira*, azure*, github*, slack*, encryption tokens }
model Project { id, name, source, orgId, jiraProjectKey, azureProjectId, githubRepo }
```

## Criterios de Aceitacao
- [x] Monorepo com pnpm workspaces funcional
- [x] API Fastify respondendo em /health
- [x] Frontend Next.js com auth funcional
- [x] Prisma migrations aplicadas
- [x] Docker Compose dev e prod
- [x] CI/CD pipeline funcional
- [x] TypeScript strict mode sem erros
