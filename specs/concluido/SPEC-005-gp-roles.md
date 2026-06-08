---
id: SPEC-005
title: "GP & Roles (RBAC)"
status: concluido
prioridade: essencial
categoria: plataforma
ultima_atualizacao: "2026-04-01"
---

# GP & Roles (RBAC)

## Resumo
Sistema de roles (OWNER, PROJECT_MANAGER, VIEWER) com assignment de usuarios a projetos e visao de portfolio por GP.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **Assignments Module** (`apps/api/src/modules/assignments/`): User-project assignments, GP portfolio
- **Auth Middleware** (`apps/api/src/middleware/`): requireAuth() com roles

### Frontend
- **Role Guards** (`apps/web/src/components/guards/`): Componentes condicionais por role
- **Members Settings** (`apps/web/src/app/(dashboard)/settings/members/`)
- **Team Page** (`apps/web/src/app/(dashboard)/projects/[projectId]/team/`)

### Modelos de Dados
```prisma
model OrganizationUser { role: OrgRole (OWNER/PROJECT_MANAGER/VIEWER) }
model ProjectAssignment { userId, projectId }
```

### Endpoints API
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /projects/:projectId/assignments | Listar assignments |
| POST | /projects/:projectId/assign | Atribuir usuario |
| DELETE | /projects/:projectId/assign/:userId | Remover assignment |
| GET | /gp/portfolios | Portfolio do GP |

## Criterios de Aceitacao
- [x] 3 roles: OWNER, PROJECT_MANAGER, VIEWER
- [x] Assignment de usuarios a projetos
- [x] Portfolio view por GP
- [x] Role-based UI guards
