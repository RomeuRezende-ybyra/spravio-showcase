---
id: SPEC-002
title: "Jira Integration"
status: concluido
prioridade: essencial
categoria: integracao
ultima_atualizacao: "2026-04-01"
---

# Jira Integration

## Resumo
Integracao completa com Jira Cloud: sync de projetos, sprints, issues, epics e developers com cache Redis.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **Jira Integration** (`apps/api/src/integrations/jira/`): client, endpoints, mappers, types
- **Sync Job** (`apps/api/src/jobs/syncJira.job.ts`): Background sync
- **Sprints Module** (`apps/api/src/modules/sprints/`): Sprint listing, current sprint
- **Developers Module** (`apps/api/src/modules/developers/`): Dev metrics, card assignments

### Frontend
- **Onboarding Wizard**: Jira connection step
- **Sprint View** (`apps/web/src/app/(dashboard)/projects/[projectId]/sprint/`)
- **Backlog View** (`apps/web/src/app/(dashboard)/projects/[projectId]/backlog/`)

### Modelos de Dados
```prisma
model Sprint { id, projectId, name, state, startDate, endDate, totalPoints, completedPoints }
model Issue { id, sprintId, key, summary, status, type, storyPoints, developerId }
model Epic { id, projectId, key, name, color }
model Developer { id, name, email, avatarUrl, jiraAccountId }
```

### Endpoints API
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /projects/:projectId/sprints | Listar sprints |
| GET | /projects/:projectId/sprints/current | Sprint ativa com resumo |

## Criterios de Aceitacao
- [x] Sync de sprints, issues e developers do Jira
- [x] Cache Redis com TTL 300s
- [x] Mapeamento de tipos Jira → Spravio
- [x] Background job de sync periodico
