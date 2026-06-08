# Spravio — Constitution

> Princípios inegociáveis do projeto. Leia antes de qualquer implementação.

---

## Tech Stack (INEGOCIÁVEL)

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend | Next.js App Router | 14.2 |
| UI | Tailwind CSS + shadcn/ui | — |
| Backend | Fastify | 5 |
| Validation | Zod | 3 |
| ORM | Prisma | 6 |
| Database | PostgreSQL | 15 |
| Cache | Redis (ioredis) | 7 |
| Queue | BullMQ | — |
| Auth | NextAuth.js + @fastify/jwt | — |
| Package Manager | pnpm (workspaces) | — |
| Monitoring | Sentry | — |
| Payments | Stripe | — |
| Logging | Pino | — |

**NUNCA** substitua nenhuma tecnologia acima sem aprovação explícita.

---

## Estrutura de Módulos (Backend)

```
apps/api/src/modules/<domain>/
├── route.ts       # Endpoints Fastify + Zod validation
├── service.ts     # Business logic (quando necessário)
├── repository.ts  # Prisma queries (quando necessário)
└── types.ts       # Types locais do módulo
```

### Regras:
- Rotas SEMPRE validam input com Zod (`z.object().parse()`)
- Rotas SEMPRE retornam `{ success: true, data: ... }` ou throw `AppError`
- Business logic complexa vai em `service.ts`, não na rota
- Queries complexas vão em `repository.ts`

---

## Estrutura de Integrações

```
apps/api/src/integrations/<service>/
├── types.ts       # Raw API types
├── client.ts      # HTTP client + auth + rate limit
├── endpoints.ts   # API calls + Redis cache
├── mappers.ts     # External → Internal mapping
└── index.ts       # Barrel export
```

### Regras:
- TODA chamada externa DEVE usar Redis cache (TTL 300s padrão)
- Mappers convertem tipos externos em tipos internos do Spravio
- Rate limiting respeitando limites da API externa

---

## Estrutura Frontend

```
apps/web/src/app/(dashboard)/[orgSlug]/[projectSlug]/
├── page.tsx       # Página principal
├── loading.tsx    # Loading skeleton (OBRIGATÓRIO)
├── error.tsx      # Error boundary (OBRIGATÓRIO)
└── layout.tsx     # Layout (quando necessário)
```

### Regras:
- TODA rota precisa de `loading.tsx` + `error.tsx`
- Server Components por padrão, `'use client'` só quando necessário
- API client em `src/lib/api/client.ts` (server-side auth injection)

---

## Regras de Ouro

1. **NUNCA** use `any` — use `unknown` + type guards
2. **SEMPRE** cache chamadas externas (Redis TTL 300s)
3. **NUNCA** `console.log` em produção — use Pino logger
4. **SEMPRE** Zod em inputs E outputs de rotas
5. **NUNCA** SQL raw — use Prisma client
6. **SEMPRE** `loading.tsx` + `error.tsx` em rotas de página
7. **NUNCA** npm/yarn — use pnpm
8. **NUNCA** use `as` type assertions — prefira type guards
9. **SEMPRE** trate erros com `AppError` + `sendError()`
10. **SEMPRE** use `@spravio/types` para tipos compartilhados

---

## Definition of Done

Uma feature só está completa quando:

1. `pnpm typecheck` — 0 errors
2. `pnpm lint` — 0 warnings
3. Zod validation em inputs E outputs
4. Redis cache em chamadas externas
5. Prisma migration criada (se schema mudou)
6. `loading.tsx` + `error.tsx` presentes
7. Sem `console.log` (usar Pino)
8. Tipos compartilhados em `@spravio/types`

---

## Portas (Development)

| Serviço | Porta Host | Porta Container |
|---------|-----------|-----------------|
| PostgreSQL | 5435 | 5432 |
| Redis | 6380 | 6379 |
| API (Fastify) | 3010 | 3010 |
| Web (Next.js) | 3011 | 3011 |

> Use `127.0.0.1` em `.env` (não `localhost` — IPv6 causa ECONNRESET no Windows)

---

## Modelo de Integrações (SaaS)

Spravio é uma plataforma SaaS multi-tenant. Existem DOIS níveis de credentials:

### 1. PLATFORM-LEVEL (env vars no servidor)
- São da **PLATAFORMA SPRAVIO**, não do cliente
- Ex: `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` (OAuth App do Spravio)
- Ex: `STRIPE_SECRET_KEY`, `SENTRY_DSN`
- Configurados no deploy, nunca expostos ao usuário
- Um único valor para toda a plataforma

### 2. ORG-LEVEL (banco de dados, criptografados)
- São do **CLIENTE** (organização)
- Ex: `githubToken` (obtido via OAuth flow)
- Ex: `jiraApiToken` (inserido pelo OWNER)
- Armazenados em `OrganizationSettings`, criptografados com `secureToken()`
- Cada org tem seus próprios valores

### Regra
O usuário final **NUNCA** precisa inserir Client ID/Secret de OAuth.
O fluxo OAuth usa as credentials da plataforma (env) para gerar um token
per-org que é salvo no banco.

---

## Workflow Obrigatório

**TODA** feature (exceto hotfix de 1-3 linhas) DEVE ter:

1. `spec.md` **ANTES** da implementação
2. Plan aprovado (`plan.md`)
3. Tarefas decompostas (`tasks.md`)
4. Entrada no `CHANGELOG.md` após implementação

### Fluxo
```
Ideia → spec.md → plan.md → tasks.md → Implementação → CHANGELOG.md
```

### Exceções
- Hotfix de 1-3 linhas: pode ir direto, mas DEVE atualizar CHANGELOG
- Bugfix urgente: pode pular plan/tasks, mas DEVE ter spec retroativa

---

*Última atualização: 2026-05-03*
