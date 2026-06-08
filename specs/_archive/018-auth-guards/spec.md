# Spec: Auth Guards em Rotas Desprotegidas

> ID: 018-auth-guards
> Status: Draft
> Autor: Claude
> Data: 2026-04-04

---

## Problema

11 endpoints da API são acessíveis **sem autenticação**, incluindo 2 vulnerabilidades críticas:
- `DELETE /projects/:id` — qualquer pessoa pode deletar qualquer projeto
- `POST /projects/:projectId/sync/github` — qualquer pessoa pode disparar sync do GitHub

Os restantes 9 endpoints expõem dados de projetos, sprints, developers, overview e pull requests sem verificar JWT.

**Rotas desprotegidas:**

| Rota | Método | Risco |
|------|--------|-------|
| `/projects` | GET | Dados expostos |
| `/projects/:id` | GET | Dados expostos |
| `/projects/:id` | DELETE | **CRÍTICO** — deleção sem auth |
| `/projects/:projectId/sprints` | GET | Dados expostos |
| `/projects/:projectId/sprints/current` | GET | Dados expostos |
| `/projects/:projectId/developers` | GET | Dados expostos |
| `/projects/:projectId/developers/:devId/cards` | GET | Dados expostos |
| `/projects/:projectId/overview` | GET | Dados expostos |
| `/projects/:projectId/pullrequests` | GET | Dados expostos |
| `/projects/:projectId/pullrequests/stats` | GET | Dados expostos |
| `/projects/:projectId/sync/github` | POST | **CRÍTICO** — ação sem auth |

---

## Solução Proposta

Adicionar `preHandler: requireAuth()` (ou com roles específicos) a todas as 11 rotas desprotegidas. Seguir o mesmo padrão já usado nos módulos billing, budget, forecast, config, etc.

---

## Escopo

### Incluído
- Adicionar `requireAuth()` a todas as 11 rotas listadas
- Rotas de leitura (GET): `requireAuth()` (qualquer usuário autenticado)
- `DELETE /projects/:id`: `requireAuth(['OWNER'])` (só owners)
- `POST .../sync/github`: `requireAuth(['OWNER', 'PROJECT_MANAGER'])` (owners e PMs)
- Substituir `GET /projects` por `GET /projects/mine` existente (ou proteger ambos)

### Excluído
- Org-level scoping (garantir que user só acessa projetos da sua org) — feature separada
- Rate limiting — feature separada
- CORS hardening — feature separada

---

## Requisitos

### Funcionais
1. **[RF-01]** Todas as rotas de leitura de projetos DEVEM exigir JWT válido via `requireAuth()`
2. **[RF-02]** `DELETE /projects/:id` DEVE exigir role OWNER
3. **[RF-03]** `POST /projects/:projectId/sync/github` DEVE exigir role OWNER ou PROJECT_MANAGER
4. **[RF-04]** Requisições sem token válido DEVEM retornar 401
5. **[RF-05]** Requisições com role insuficiente DEVEM retornar 403

### Não-funcionais
1. **[RNF-01]** Overhead do auth check DEVE ser < 5ms (JWT decode é síncrono)
2. **[RNF-02]** Nenhum endpoint de dados do projeto pode ficar acessível sem autenticação

---

## Arquivos Impactados

| Arquivo | Tipo de mudança |
|---------|----------------|
| `apps/api/src/modules/projects/route.ts` | Modificação — adicionar preHandler a GET /projects, GET /projects/:id, DELETE /projects/:id |
| `apps/api/src/modules/sprints/route.ts` | Modificação — adicionar preHandler a 2 rotas |
| `apps/api/src/modules/developers/route.ts` | Modificação — adicionar preHandler a 2 rotas |
| `apps/api/src/modules/overview/route.ts` | Modificação — adicionar preHandler a 1 rota |
| `apps/api/src/modules/pullrequests/route.ts` | Modificação — adicionar preHandler a 3 rotas |

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Frontend quebra se não enviar token | O `apiClient` já injeta token via `getServerSession()` em server components; client components usam session |
| Rotas de portal param de funcionar | Portal usa token próprio, não JWT — não é afetado |
| Rotas já protegidas duplicam guard | Verificar uma a uma — não adicionar onde já existe |

---

## Definition of Done

- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings
- [ ] Todas as 11 rotas têm `preHandler: requireAuth(...)`
- [ ] DELETE exige OWNER
- [ ] POST sync exige OWNER/PROJECT_MANAGER
- [ ] GET retorna 401 sem token
- [ ] Frontend continua funcionando normalmente

---

## Notas

- O hook `requireAuth()` já existe e está testado em produção em ~30 rotas
- Pattern: `{ preHandler: requireAuth() }` para qualquer autenticado, `{ preHandler: requireAuth(['OWNER']) }` para roles específicos
- A rota `GET /projects/mine` já existe protegida — considerar deprecar `GET /projects` não-autenticada
