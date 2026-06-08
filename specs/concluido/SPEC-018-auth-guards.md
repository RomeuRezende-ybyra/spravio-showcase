---
id: SPEC-018
title: "Auth Guards em Rotas Desprotegidas"
status: concluido
prioridade: essencial
categoria: infraestrutura
pontos: 5
mvp: true
ultima_atualizacao: "2026-05-03"
---

# Auth Guards em Rotas Desprotegidas

## Resumo

11 endpoints da API eram acessiveis sem autenticacao, incluindo 2 vulnerabilidades criticas (DELETE /projects/:id e POST sync/github sem auth). Todas as rotas agora exigem autenticacao.

## Status Atual

**100% implementado.** Todas as 11 rotas protegidas com `requireAuth()`.

## O que foi Implementado

- [x] `GET /projects` — requireAuth()
- [x] `GET /projects/:id` — requireAuth()
- [x] `DELETE /projects/:id` — requireAuth(['OWNER'])
- [x] `GET /projects/:projectId/sprints` — requireAuth()
- [x] `GET /projects/:projectId/sprints/current` — requireAuth()
- [x] `GET /projects/:projectId/developers` — requireAuth()
- [x] `GET /projects/:projectId/developers/:devId/cards` — requireAuth()
- [x] `GET /projects/:projectId/overview` — requireAuth()
- [x] `GET /projects/:projectId/pullrequests` — requireAuth()
- [x] `GET /projects/:projectId/pullrequests/stats` — requireAuth()
- [x] `POST /projects/:projectId/sync/github` — requireAuth(['OWNER', 'PROJECT_MANAGER'])
- [x] `pnpm typecheck` — 0 errors

## Arquivos Modificados

| Arquivo | Mudanca |
|---------|---------|
| `apps/api/src/modules/projects/route.ts` | Auth em GET /projects, GET /projects/:id, DELETE /projects/:id |
| `apps/api/src/modules/sprints/route.ts` | Auth em 2 rotas GET |
| `apps/api/src/modules/developers/route.ts` | Auth em 2 rotas GET |
| `apps/api/src/modules/overview/route.ts` | Auth em 1 rota GET |
| `apps/api/src/modules/pullrequests/route.ts` | Auth em 2 rotas GET + 1 POST |

## Criterios de Aceitacao

- [x] Todas as 11 rotas tem `preHandler: requireAuth(...)`
- [x] DELETE exige OWNER
- [x] POST sync exige OWNER/PROJECT_MANAGER
- [x] GET retorna 401 sem token
- [x] Frontend continua funcionando (apiClient ja injeta token)
- [x] `pnpm typecheck` — 0 errors
