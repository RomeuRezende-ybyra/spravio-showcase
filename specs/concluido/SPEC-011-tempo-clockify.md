---
id: SPEC-011
title: "Tempo + Clockify (Time Tracking)"
status: concluido
prioridade: essencial
categoria: integracao
ultima_atualizacao: "2026-04-01"
---

# Tempo + Clockify (Time Tracking)

## Resumo
Integracao com Tempo (Jira) e Clockify para import de worklogs/time entries e calculo de horas por sprint.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **Tempo Integration** (`apps/api/src/integrations/tempo/`)
- **Clockify Integration** (`apps/api/src/integrations/clockify/`)
- **Tempo Config Module** (`apps/api/src/modules/tempo-config/`)
- **Clockify Config Module** (`apps/api/src/modules/clockify-config/`)
- **Sync Jobs**: `syncTempo.job.ts`, `syncClockify.job.ts`

### Frontend
- **Time Page** (`apps/web/src/app/(dashboard)/projects/[projectId]/time/`)

### Modelos de Dados
```prisma
model TempoConfig { projectId, apiToken, enabled, lastSyncAt }
model ClockifyConfig { projectId, apiKey, workspaceId, enabled, lastSyncAt }
model SprintHours { source: manual | tempo | clockify, externalId }
```

### Endpoints API
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET/PUT/DELETE | /projects/:projectId/tempo-config | CRUD config Tempo |
| POST | /projects/:projectId/tempo-config/test | Testar conexao |
| POST | /projects/:projectId/tempo-config/sync | Disparar sync |
| GET/PUT/DELETE | /projects/:projectId/clockify-config | CRUD config Clockify |
| POST | /projects/:projectId/clockify-config/test | Testar conexao |
| POST | /projects/:projectId/clockify-config/sync | Disparar sync |
