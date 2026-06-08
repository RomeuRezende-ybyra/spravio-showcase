---
id: SPEC-003
title: "Dashboard"
status: concluido
prioridade: essencial
categoria: plataforma
ultima_atualizacao: "2026-04-01"
---

# Dashboard

## Resumo
Dashboard principal do projeto com overview de sprints, burndown chart, metricas de developers e health indicators.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **Overview Module** (`apps/api/src/modules/overview/`): Dados consolidados do projeto

### Frontend
- **Dashboard Layout** (`apps/web/src/app/(dashboard)/layout.tsx`): Sidebar, header, navigation
- **Portfolio** (`apps/web/src/app/(dashboard)/portfolio/`): Visao geral de todos os projetos
- **Projects List** (`apps/web/src/app/(dashboard)/projects/`): Lista de projetos
- **Project Overview** (`apps/web/src/app/(dashboard)/projects/[projectId]/overview/`)
- **Charts** (`apps/web/src/components/charts/`): Burndown, financials

### Endpoints API
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /projects/:projectId/overview | Dados consolidados do projeto |

## Criterios de Aceitacao
- [x] Dashboard com metricas do projeto
- [x] Burndown chart funcional
- [x] Portfolio view com todos os projetos
- [x] Navigation sidebar
