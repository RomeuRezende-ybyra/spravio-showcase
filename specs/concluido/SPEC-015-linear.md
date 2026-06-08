---
id: SPEC-015
title: "Linear Integration"
status: concluido
prioridade: essencial
categoria: integracao
ultima_atualizacao: "2026-04-01"
---

# Linear Integration

## Resumo
Integracao com Linear: sync de cycles, issues e team members mapeados para sprints e issues.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **Linear Integration** (`apps/api/src/integrations/linear/`): client, endpoints, mappers, types
- **Sync Job** (`apps/api/src/jobs/syncLinear.job.ts`)

### Modelos de Dados
```prisma
model Project { source: "linear" }
model Developer { linearId, linearDisplayName }
```

## Criterios de Aceitacao
- [x] Sync de cycles e issues
- [x] Mapeamento Linear → Spravio types
- [x] Cache Redis
