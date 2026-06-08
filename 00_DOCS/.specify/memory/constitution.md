# Spravio — Constitution

> Princípios inegociáveis do projeto. Todo código gerado DEVE seguir estas regras.
> Última atualização: 2026-04-04

---

## I. Identidade do Projeto

**Spravio** é uma plataforma SaaS para gerentes de agências de software monitorarem entregas de projetos em tempo real. Consolida dados de múltiplas ferramentas de PM em um dashboard unificado com previsões de entrega baseadas em IA.

**Domínio**: `spravio.io` | API: `api.spravio.io`

---

## II. Arquitetura (INEGOCIÁVEL)

### Estrutura do Monorepo
```
spravio/
├── apps/
│   ├── api/          # Fastify 5 backend         :3010
│   └── web/          # Next.js 14.2 frontend     :3011
├── packages/
│   ├── types/        # @spravio/types (Zod schemas + TS types)
│   └── utils/        # @spravio/utils (helpers)
├── docker-compose.yml
└── CLAUDE.md
```

### Separação de Responsabilidades
Todo módulo backend DEVE seguir esta estrutura:
```
modules/<domínio>/
├── route.ts       # Endpoints Fastify + validação Zod
├── service.ts     # Lógica de negócio
├── repository.ts  # Queries Prisma (NUNCA SQL raw)
└── types.ts       # Tipos locais (se necessário)
```

### Camada de Integração
Toda integração externa DEVE seguir esta estrutura:
```
integrations/<serviço>/
├── types.ts       # Tipos raw da API externa
├── client.ts      # HTTP client com auth + rate limit
├── endpoints.ts   # Funções de chamada à API
├── mappers.ts     # Transformação raw → modelos internos
└── index.ts       # Barrel export
```

**Regra**: Services chamam integrations. Routes NUNCA chamam integrations diretamente.

---

## III. Tech Stack (INEGOCIÁVEL)

| Camada | Tecnologia | Versão | Notas |
|--------|------------|--------|-------|
| Frontend | Next.js App Router | 14.2 | TypeScript strict |
| UI | Tailwind CSS + shadcn/ui | — | NUNCA HTML raw |
| Backend | Fastify | 5 | Plugins modulares |
| Validação | Zod | 3 | Inputs E outputs |
| ORM | Prisma | 6 | Migrations obrigatórias |
| Database | PostgreSQL | 15 | Docker :5434 |
| Cache | Redis | 7 | Docker :6380, TTL 5min |
| Queue | BullMQ | — | Jobs assíncronos |
| Auth | NextAuth.js | — | JWT + Credentials |
| Package Manager | pnpm workspaces | — | NUNCA npm/yarn |
| TypeScript | strict: true | 5.9 | NUNCA `any` |

---

## IV. Integrações Suportadas

### PM Tools (7)
| Serviço | Auth | Base URL |
|---------|------|----------|
| Jira | Basic (email:token) | `JIRA_BASE_URL` |
| Azure DevOps | Basic (:PAT) | `https://dev.azure.com/{org}` |
| Trello | API Key + Token | `https://api.trello.com/1` |
| ClickUp | Bearer Token | `https://api.clickup.com/api/v2` |
| Linear | Bearer (GraphQL) | `https://api.linear.app/graphql` |
| Asana | Bearer Token | `https://app.asana.com/api/1.0` |
| Monday.com | Bearer (GraphQL) | `https://api.monday.com/v2` |

### Code Platforms (2)
| Serviço | Auth | Stale Detection |
|---------|------|-----------------|
| GitHub | Bearer Token | >24h warning, >72h critical |
| GitLab | PRIVATE-TOKEN header | >24h warning, >72h critical |

### Time Tracking (2)
| Serviço | Auth | Base URL |
|---------|------|----------|
| Tempo | Bearer Token | `https://api.tempo.io/4` |
| Clockify | X-Api-Key header | `https://api.clockify.me/api/v1` |

### Messaging (2)
| Serviço | Auth | Format |
|---------|------|--------|
| Slack | Bot Token | Block Kit |
| Microsoft Teams | Incoming Webhook | Adaptive Cards |

### AI (1)
| Serviço | Auth | Model |
|---------|------|-------|
| Anthropic | API Key | claude-sonnet-4-20250514 |

---

## V. Regras de Código (INEGOCIÁVEL)

### TypeScript
- `strict: true` em todo o projeto
- NUNCA usar `any` — use `unknown` + type guards
- Todos os tipos em `@spravio/types`
- Zod schemas para validação runtime

### Backend
- Cache TODA chamada externa (Redis TTL 300s)
- Jobs assíncronos via BullMQ — NUNCA sync bulk calls
- Validação Zod em inputs E outputs de rotas
- Logger: Pino — NUNCA `console.log` em produção
- Error handling: Sentry + typed ApiError

### Frontend
- Server Components por padrão
- `loading.tsx` + `error.tsx` em TODA rota
- API client tipado em `lib/api/client.ts`
- shadcn/ui + Tailwind — NUNCA CSS inline

### Database
- Prisma migrations obrigatórias
- NUNCA `db push` em produção
- NUNCA SQL raw — use Prisma client

---

## VI. Fórmulas de Negócio

### Developer Score (0-5)
```
score = (deliveryRate * 0.35
       + (100 - reworkRate) * 0.25
       + prMergeRate * 0.20
       + cycleTimeScore * 0.10
       + reviewContribution * 0.10) / 20

deliveryRate  = completed / assigned * 100
reworkRate    = returned_to_in_progress / completed * 100
cycleTimeScore: 0h → 100pts, 48h+ → 0pts (linear)
```

### PR/MR Stale Detection
| Duração | Severidade |
|---------|------------|
| < 24h | NONE |
| 24-72h | WARNING |
| > 72h | CRITICAL |

### Budget Health
| Consumido % | Status |
|-------------|--------|
| < 70% | GREEN |
| 70-85% | YELLOW |
| > 85% | RED |

### AI Forecast
- Requer: 3+ sprints completos + `ANTHROPIC_API_KEY`
- Input: velocity (média 3-5 sprints), trend, rework rate, team size, remaining points
- Output: `onTimeProbability` (0-100), `predictedEndDate`, `confidence`, `reasoning`

---

## VII. Definition of Done

Toda feature/bugfix DEVE passar:

1. ✅ `pnpm typecheck` — 0 erros em todos os 4 pacotes
2. ✅ `pnpm lint` — 0 erros, 0 warnings
3. ✅ Zod schema em todos inputs/outputs de rotas
4. ✅ Redis cache em todas chamadas externas (TTL 300s)
5. ✅ Prisma migration criada e aplicada (se schema mudou)
6. ✅ `loading.tsx` + `error.tsx` em novas rotas
7. ✅ NENHUM `console.log` em produção (usar Pino)
8. ✅ Testes passando (quando existirem)

---

## VIII. Roles & Permissions

| Role | Acesso |
|------|--------|
| OWNER | Tudo + billing + portfolio + assignments |
| PROJECT_MANAGER | Projetos atribuídos + configurações |
| VIEWER | Read-only nos projetos atribuídos |

---

## IX. Governança

- Esta Constitution tem precedência sobre todas as outras práticas
- Alterações requerem documentação + aprovação + migration plan
- Todo PR/review DEVE verificar conformidade com estas regras
- O código segue a especificação. Sem exceções.
