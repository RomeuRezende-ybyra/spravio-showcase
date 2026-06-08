---
id: SPEC-037
title: "Client Management"
status: concluido
prioridade: essencial
categoria: plataforma
ultima_atualizacao: "2026-05-03"
---

# Client Management

## Resumo
O formulario de criacao de projeto exigia selecao de "client" mas o backend nao tem modelo Client. Implementada Opcao B: campo client tornado opcional, criacao de projeto conectada a API real.

## Status Atual
**100% implementado (Opcao B — fix rapido).** Criacao de projetos funcional em producao.

## O que foi feito
- [x] Client tornado opcional no formulario (removido `*` do label)
- [x] Botao Next habilitado apenas com `name` (removida validacao de client)
- [x] `handleCreateProject` conectado a API real via `POST /api/projects`
- [x] Lista de projetos carregada via `GET /api/projects` (proxy para `/projects/mine`)
- [x] Proxy GET adicionado em `apps/web/src/app/api/projects/route.ts`
- [x] `pnpm typecheck` — 0 errors

## Decisao
**Opcao B: Tornar client opcional (fix rapido)**
- Dropdown de client mantido na UI para uso futuro
- Quando modelo Client for implementado (Opcao A), basta popular o dropdown

## Arquivos Modificados
| Arquivo | Mudanca |
|---------|---------|
| `apps/web/src/components/projects/new-project-modal.tsx` | Client sem `*`, validacao removida |
| `apps/web/src/app/(dashboard)/projects/page.tsx` | API real para list + create |
| `apps/web/src/app/api/projects/route.ts` | Handler GET adicionado |

## Criterios de Aceitacao
- [x] Usuario consegue criar projeto em producao
- [x] `pnpm typecheck` — 0 errors
