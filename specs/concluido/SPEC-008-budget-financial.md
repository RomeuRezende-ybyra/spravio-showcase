---
id: SPEC-008
title: "Budget & Financial"
status: concluido
prioridade: essencial
categoria: plataforma
ultima_atualizacao: "2026-04-01"
---

# Budget & Financial

## Resumo
Gestao de orcamento por projeto: budget total, rates por developer, horas por sprint, dashboard financeiro.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **Budget Module** (`apps/api/src/modules/budget/`): CRUD de budget, rates, hours, financials

### Frontend
- **Financial Dashboard** (`apps/web/src/app/(dashboard)/financial/`)
- **Project Financials** (`apps/web/src/app/(dashboard)/projects/[projectId]/financials/`)
- **Budget Components** (`apps/web/src/components/budget/`)
- **Financial Charts** (`apps/web/src/components/financial/`)

### Modelos de Dados
```prisma
model ProjectBudget { projectId, totalBudget, currency, startDate, endDate }
model DeveloperRate { developerId, projectId, hourlyRate, currency }
model SprintHours { developerId, sprintId, hours, source, externalId }
```

### Endpoints API
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /projects/:projectId/budget | Obter budget |
| POST | /projects/:projectId/budget | Criar budget |
| PUT | /projects/:projectId/developers/:devId/rate | Definir rate |
| POST | /projects/:projectId/sprints/:sprintId/hours | Registrar horas |
| GET | /projects/:projectId/budget/rates | Listar rates |
| GET | /projects/:projectId/financials | Dashboard financeiro |
