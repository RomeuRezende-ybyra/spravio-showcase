---
id: SPEC-014
title: "ClickUp Integration"
status: concluido
prioridade: essencial
categoria: integracao
ultima_atualizacao: "2026-04-01"
---

# ClickUp Integration

## Resumo
Integracao com ClickUp: sync de spaces, folders, tasks mapeados para projetos, sprints e issues.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **ClickUp Integration** (`apps/api/src/integrations/clickup/`): client, endpoints, mappers, types
- **Sync Job** (`apps/api/src/jobs/syncClickUp.job.ts`)

### Modelos de Dados
```prisma
model Project { source: "clickup" }
model Developer { clickupUserId }
```

## Criterios de Aceitacao
- [x] Sync de spaces, folders e tasks
- [x] Mapeamento ClickUp → Spravio types
- [x] Cache Redis
