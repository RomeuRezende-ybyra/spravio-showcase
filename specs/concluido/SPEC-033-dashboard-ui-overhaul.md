---
id: SPEC-033
title: "Dashboard & UI Overhaul (OKLCH)"
status: concluido
prioridade: essencial
categoria: ux
ultima_atualizacao: "2026-04-20"
pr_referencia: "Commits 82a30fc → d1d6cf1"
---

# Dashboard & UI Overhaul (OKLCH)

## Resumo
Redesign completo do dashboard com design system OKLCH. Novas paginas: Portfolio, Sprints cross-project, PR inbox, Forecast, Financial, Integrations, Settings completo.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Frontend — Paginas Novas
- **Portfolio** (`apps/web/src/app/(dashboard)/portfolio/`)
- **Sprints** (`apps/web/src/app/(dashboard)/sprints/`): Cross-project
- **Pull Requests** (`apps/web/src/app/(dashboard)/pull-requests/`): Inbox
- **Forecast** (`apps/web/src/app/(dashboard)/forecast/`)
- **Financial** (`apps/web/src/app/(dashboard)/financial/`)
- **Integrations** (`apps/web/src/app/(dashboard)/integrations/`)
- **Settings** (9 sub-paginas): workspace, members, billing, integrations, api, webhooks, notifications, security

### Design System
- **OKLCH Colors**: Perceptually uniform color space
- **Error Boundaries**: Styled com OKLCH design
- **Responsive**: Mobile-friendly layouts

### Backend
- **Users Module** (`apps/api/src/modules/users/`): Profile management
- **Report Module** (`apps/api/src/modules/report/`): PDF export

## Criterios de Aceitacao
- [x] Dashboard redesign com OKLCH
- [x] Todas as paginas listadas funcionais
- [x] Error boundaries estilizados
- [x] Responsivo
