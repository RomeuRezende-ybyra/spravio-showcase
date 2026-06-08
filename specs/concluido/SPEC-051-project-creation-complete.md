---
id: SPEC-051
title: "Project Creation Completo"
status: concluido
prioridade: essencial
categoria: plataforma
pontos: 5
mvp: true
ultima_atualizacao: "2026-05-03"
---

# Project Creation Completo

## Resumo

O formulario de criacao de projeto (NewProjectModal) coleta 12+ campos em 4 etapas, mas apenas `name` e `organizationId` eram enviados a API. Implementado fluxo completo: novos campos no schema Prisma, Zod validation, API persiste tudo, e frontend envia os dados coletados.

## Status Atual

**100% implementado.** Todos os campos do formulario sao persistidos no banco. Membros populados via API real.

## O que foi Implementado

- [x] Schema Prisma: campos `key`, `description`, `tags[]`, `contractType`, `contractValue`, `estimatedHours`, `startDate`, `deadline`
- [x] Migration: `20260503000000_add_project_metadata`
- [x] Zod schema: `CreateProjectInput` aceita todos os campos + `clientId`, `pmId`, `devIds`
- [x] Repository: persiste todos os campos + conecta `clientId`
- [x] Service: cria `ProjectAssignment` para PM e devs apos criar projeto
- [x] Frontend: `handleCreateProject` envia todos os dados do form
- [x] API `GET /organizations/members`: lista membros da org (novo endpoint)
- [x] Proxy `GET /api/members`: Next.js proxy para o endpoint
- [x] Dropdowns de PM e Devs populados com membros reais da org
- [x] `pnpm typecheck` — 0 errors

## Arquivos Modificados

| Arquivo | Mudanca |
|---------|---------|
| `apps/api/prisma/schema.prisma` | 8 novos campos no model Project |
| `apps/api/prisma/migrations/20260503000000_add_project_metadata/migration.sql` | Migration SQL |
| `apps/api/src/modules/projects/types.ts` | Zod schema ampliado com todos campos |
| `apps/api/src/modules/projects/repository.ts` | Persistir novos campos + clientId |
| `apps/api/src/modules/projects/service.ts` | Criar ProjectAssignment para PM/devs |
| `apps/api/src/modules/organizations/route.ts` | Endpoint GET /organizations/members |
| `apps/web/src/app/api/members/route.ts` | Proxy Next.js para membros (novo) |
| `apps/web/src/app/(dashboard)/projects/page.tsx` | Enviar todos os campos + popular dropdowns |

## Criterios de Aceitacao

- [x] Criar projeto com todos os campos preenchidos — dados persistidos no DB
- [x] Criar projeto com apenas nome — funciona como antes (campos opcionais)
- [x] PM e devs selecionados — `ProjectAssignment` criados
- [x] `clientId` enviado — relacao com Client salva
- [x] Dropdown de membros populado com dados reais
- [x] `pnpm typecheck` — 0 errors

## Decisoes Tecnicas

- `contractValue` (nao `budget`) para evitar conflito com relacao `ProjectBudget` existente
- `tags` usa `String[]` nativo do PostgreSQL — Prisma suporta nativamente
- `contractValue` usa `Decimal(12,2)` para precisao monetaria
- `contractType` armazenado como String (nao enum Prisma) para flexibilidade
- Assignments criados via `createMany` com `skipDuplicates`

## Dependencias

- **Relacionado:** SPEC-037 (fix rapido), SPEC-042 (Client CRUD)
