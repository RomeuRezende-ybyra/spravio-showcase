---
id: SPEC-016
title: "Asana + Monday.com Integration"
status: concluido
prioridade: essencial
categoria: integracao
ultima_atualizacao: "2026-04-01"
---

# Asana + Monday.com Integration

## Resumo
Integracao com Asana (projetos, sections, tasks) e Monday.com (boards, groups, items).

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **Asana Integration** (`apps/api/src/integrations/asana/`): client, endpoints, mappers, types
- **Monday Integration** (`apps/api/src/integrations/monday/`): client, endpoints, mappers, types
- **Sync Jobs**: `syncAsana.job.ts`, `syncMonday.job.ts`

### Modelos de Dados
```prisma
model Project { source: "asana" | "monday" }
model Developer { asanaUserId, mondayUserId }
```

## Criterios de Aceitacao
- [x] Sync Asana: projetos, sections, tasks
- [x] Sync Monday: boards, groups, items
- [x] Mapeamento para Spravio types
- [x] Cache Redis
