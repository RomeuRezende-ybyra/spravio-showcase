---
id: SPEC-004
title: "GitHub Integration (Basic)"
status: concluido
prioridade: essencial
categoria: integracao
ultima_atualizacao: "2026-04-01"
---

# GitHub Integration (Basic)

## Resumo
Integracao basica com GitHub: listagem de repos, PRs, developer stats com cache Redis. Expandido em SPEC-031 com OAuth completo.

## Status Atual
**100% implementado.** Expandido por SPEC-031.

## O que Ja Existe

### Backend
- **GitHub Integration** (`apps/api/src/integrations/github/`): client, endpoints, mappers, types
- **GitHub Module** (`apps/api/src/modules/github/`): Repo listing, project linking
- **PR Module** (`apps/api/src/modules/pullrequests/`): PR listing, stats
- **Sync Job** (`apps/api/src/jobs/syncGithub.job.ts`): Background sync

### Frontend
- **PR Page** (`apps/web/src/app/(dashboard)/projects/[projectId]/pullrequests/`)
- **PR Inbox** (`apps/web/src/app/(dashboard)/pull-requests/`): Cross-project PRs
- **GitHub Repo Selector** (`apps/web/src/components/integrations/`)

### Modelos de Dados
```prisma
model Developer { githubUsername, githubId }
model Project { githubRepo }  // formato: owner/repo
```

### Endpoints API
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /github/repos | Listar repos acessiveis |
| POST | /projects/:projectId/github/connect | Vincular repo ao projeto |
| DELETE | /projects/:projectId/github/disconnect | Desvincular repo |
| GET | /projects/:projectId/pullrequests | Listar PRs |
| GET | /projects/:projectId/pullrequests/stats | Stats de PRs |

## Dependencias
- **Expandido por**: SPEC-031 (GitHub OAuth + Webhooks)
