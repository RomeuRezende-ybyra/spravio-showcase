# Spec: Test Foundation

> ID: 022-test-foundation
> Status: Draft
> Autor: Claude
> Data: 2026-04-04

---

## Problema

O codebase tem **zero testes** — nenhum arquivo de teste, nenhuma dependência de test runner, nenhum script de teste em nenhum package.json. Isso significa:
- Regressões não são detectadas antes do deploy
- Refactoring é arriscado (sem safety net)
- CI/CD não tem gate de qualidade
- Contribuidores não têm confiança ao modificar código existente

---

## Solução Proposta

Configurar **Vitest** como test runner em todos os packages do monorepo e criar testes iniciais para os módulos mais críticos (auth, projects, billing). Estabelecer padrões e convenções para testes futuros.

---

## Escopo

### Incluído
- Configurar Vitest no monorepo (root + packages)
- Adicionar scripts `test`, `test:watch`, `test:coverage`
- Testes unitários para `auth/route.ts` (login, register, bcrypt)
- Testes unitários para `requireAuth` hook
- Testes unitários para `@spravio/utils` (helpers)
- Testes unitários para `@spravio/types` (Zod schemas)
- Setup de test utils (mock Prisma, mock Fastify, mock Redis)

### Excluído
- Testes E2E (Playwright/Cypress) — feature separada
- Testes de componentes React — feature separada
- 100% coverage — objetivo é estabelecer fundação
- CI/CD pipeline — feature separada

---

## Requisitos

### Funcionais
1. **[RF-01]** `pnpm test` DEVE executar todos os testes do monorepo
2. **[RF-02]** Testes de auth DEVEM cobrir: login com bcrypt, login com plaintext + re-hash, registro, credenciais inválidas
3. **[RF-03]** Testes de requireAuth DEVEM cobrir: token válido, token inválido, role insuficiente
4. **[RF-04]** Testes de utils/types DEVEM cobrir funções/schemas exportados
5. **[RF-05]** Test utils DEVEM fornecer mocks reutilizáveis para Prisma e Fastify

### Não-funcionais
1. **[RNF-01]** Suite completa DEVE rodar em < 30 segundos
2. **[RNF-02]** Testes DEVEM ser isolados (sem dependência de DB ou Redis reais)
3. **[RNF-03]** Config deve suportar pnpm workspaces (cada package pode rodar testes independente)

---

## Arquivos Impactados

| Arquivo | Tipo de mudança |
|---------|----------------|
| `package.json` (root) | Modificação — adicionar script `test` |
| `apps/api/package.json` | Modificação — adicionar vitest + scripts |
| `apps/web/package.json` | Modificação — adicionar vitest + scripts |
| `packages/types/package.json` | Modificação — adicionar vitest + scripts |
| `packages/utils/package.json` | Modificação — adicionar vitest + scripts |
| `apps/api/vitest.config.ts` | Criação |
| `apps/api/src/modules/auth/route.test.ts` | Criação |
| `apps/api/src/hooks/requireAuth.test.ts` | Criação |
| `apps/api/src/test-utils/index.ts` | Criação — mocks de Prisma, Fastify, Redis |
| `packages/types/src/index.test.ts` | Criação |
| `packages/utils/src/index.test.ts` | Criação |

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Fastify 5 requer setup específico para testes | Usar `fastify.inject()` — API oficial para testes sem HTTP real |
| Prisma mocking é complexo | Usar `vitest.mock()` com deep mock do PrismaClient |
| ESM + TypeScript pode ter issues com Vitest | Vitest tem suporte nativo a ESM + TS; projeto já usa `"type": "module"` |
| Testes demoram se não isolados | Mock tudo: Prisma, Redis, JWT. Sem I/O real |

---

## Definition of Done

- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings
- [ ] `pnpm test` executa e passa em todos os packages
- [ ] Auth route tem testes para login e register
- [ ] requireAuth hook tem testes para todos os cenários
- [ ] Utils e types packages têm testes básicos
- [ ] Test utils com mocks reutilizáveis criados
- [ ] Nenhuma dependência de serviço externo nos testes

---

## Notas

- **Vitest** é preferível a Jest para este projeto:
  - Suporte nativo a ESM (`"type": "module"`)
  - TypeScript sem config adicional
  - Rápido, built-in UI (`vitest --ui`)
  - Compatível com pnpm workspaces
- Dependências a instalar: `vitest`, `@vitest/coverage-v8`, `@vitest/ui`
- Padrão de naming: `*.test.ts` co-locado com o arquivo fonte
- Coverage target inicial: auth module 80%+, resto não enforced
