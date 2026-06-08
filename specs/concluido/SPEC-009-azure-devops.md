---
id: SPEC-009
title: "Azure DevOps Integration"
status: concluido
prioridade: essencial
categoria: integracao
ultima_atualizacao: "2026-04-01"
---

# Azure DevOps Integration

## Resumo
Integracao com Azure DevOps: sync de projetos, iterations (sprints), work items (issues) e developers.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **Azure Integration** (`apps/api/src/integrations/azure/`): client, endpoints, mappers, types
- **Sync Job** (`apps/api/src/jobs/syncAzureProject.job.ts`): Background sync

### Modelos de Dados
```prisma
model Project { azureProjectId }
model Developer { azureId }
model OrganizationSettings { azureOrganization, azureProject, azurePat }
```

## Criterios de Aceitacao
- [x] Sync de iterations e work items
- [x] Mapeamento Azure → Spravio types
- [x] Cache Redis
- [x] Background job de sync
