---
id: SPEC-042
title: "Client Management Completo"
status: a-fazer
prioridade: importante
categoria: plataforma
pontos: 8
mvp: false
ultima_atualizacao: "2026-05-03"
---

# Client Management Completo

## Resumo
Implementar entidade Client completa: model Prisma, CRUD API, UI de gestao, e associacao de projetos a clientes. Complementa o fix rapido do SPEC-037.

## Status Atual
**10% implementado.** SPEC-037 tornou o campo opcional. Dropdown existe mas vazio.

## O que Falta Implementar
- [ ] Model `Client` no Prisma (id, name, email, phone, cnpj, organizationId)
- [ ] Migration Prisma
- [ ] Adicionar `clientId` opcional ao model Project
- [ ] API CRUD: GET/POST/PUT/DELETE `/organizations/:orgId/clients`
- [ ] Zod schemas para input/output
- [ ] UI: pagina `/settings/clients` com listagem, criacao e edicao
- [ ] Popular dropdown de client no NewProjectModal com dados reais
- [ ] Filtro por client no dashboard e lista de projetos

## Criterios de Aceitacao
- [ ] CRUD completo de clients funcional
- [ ] Projetos associados a clients
- [ ] Dashboard filtravel por client
- [ ] `pnpm typecheck` — 0 errors

## Dependencias
- **Relacionado**: SPEC-037 (fix rapido)
