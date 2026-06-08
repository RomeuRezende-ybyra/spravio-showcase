---
id: SPEC-022
title: "Test Foundation (Vitest)"
status: a-fazer
prioridade: importante
categoria: infraestrutura
ultima_atualizacao: "2026-04-04"
---

# Test Foundation (Vitest)

## Resumo
Zero testes no codebase. Configurar Vitest como test runner e criar testes para modulos criticos (auth, requireAuth, types, utils).

## Status Atual
**0% implementado.** Nenhum arquivo de teste existe.

## O que Falta Implementar
- [ ] Configurar Vitest no monorepo (root + packages)
- [ ] Adicionar scripts `test`, `test:watch`, `test:coverage`
- [ ] Testes unitarios para auth/route.ts (login, register, bcrypt)
- [ ] Testes unitarios para requireAuth hook
- [ ] Testes unitarios para @spravio/utils
- [ ] Testes unitarios para @spravio/types (Zod schemas)
- [ ] Setup de test utils (mock Prisma, mock Fastify, mock Redis)

## Criterios de Aceitacao
- [ ] `pnpm test` executa e passa em todos os packages
- [ ] Auth route tem testes para login e register
- [ ] requireAuth hook tem testes para todos os cenarios
- [ ] Test utils com mocks reutilizaveis
- [ ] Nenhuma dependencia de servico externo nos testes

## Dependencias
- **Spec original**: `specs/022-test-foundation/spec.md` (arquivo historico)
