---
id: SPEC-013
title: "Trello Integration"
status: concluido
prioridade: essencial
categoria: integracao
ultima_atualizacao: "2026-04-01"
---

# Trello Integration

## Resumo
Integracao com Trello: sync de boards, lists, cards mapeados para projetos, sprints e issues.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **Trello Integration** (`apps/api/src/integrations/trello/`): client, endpoints, mappers, types
- **Sync Job** (`apps/api/src/jobs/syncTrello.job.ts`)

### Modelos de Dados
```prisma
model Project { source: "trello" }
model Developer { trelloMemberId }
```

## Criterios de Aceitacao
- [x] Sync de boards, lists e cards
- [x] Mapeamento Trello → Spravio types
- [x] Cache Redis
