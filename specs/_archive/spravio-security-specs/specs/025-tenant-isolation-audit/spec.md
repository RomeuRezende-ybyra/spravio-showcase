# Feature Specification: Tenant Isolation Audit

> 🔴 CRÍTICA: Garantir que toda query ao banco tem escopo de `organizationId` e impedir vazamento cruzado entre clientes

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature ID** | 025-tenant-isolation-audit |
| **Branch** | `feat/025-tenant-isolation-audit` |
| **Prioridade** | 🔴 Crítica |
| **Data** | 2026-04-21 |
| **Status** | Ready for Implementation |
| **LGPD** | Art. 6º, Art. 46 |

---

## 1. Resumo

O Spravio é multi-tenant com `Organization` como raiz do isolamento. Esta spec audita **todas** as queries Prisma do backend para garantir que sempre têm `where: { organizationId }` (ou relação equivalente), implementa guards automáticos no Prisma Client, e adiciona testes de integração que verificam isolamento end-to-end.

Este é o risco mais crítico de um SaaS B2B: uma única query sem escopo pode vazar dados entre clientes.

---

## 2. Motivação

### Problema
- Codebase tem ~21 models multi-tenant
- Nem todas as queries foram auditadas sistematicamente
- Um `findMany({ where: { id } })` sem `organizationId` pode retornar dados de qualquer cliente
- Bugs de isolamento são silenciosos até um cliente reportar
- Dificuldade de auditar manualmente em código crescente

### Impacto
- **Incidente de vazamento cruzado**: pior cenário possível em SaaS B2B, cliente vê dados de outro cliente
- **Reportação à ANPD**: incidente de segurança grave, prazo de 2 dias úteis
- **Perda de contratos**: incidentes deste tipo resultam em rescisão imediata e danos à reputação

### Métricas de Sucesso
- [ ] 100% das queries Prisma em models multi-tenant têm escopo explícito
- [ ] Middleware Prisma bloqueia queries sem `organizationId` em models marcados
- [ ] Testes de integração verificam que user A não acessa dados de org B
- [ ] Lint rule previne novos endpoints sem `tenantGuard`

---

## 3. User Stories

### Story 1: Cliente não vê dados de outro cliente
**Como** cliente Spravio (agência A)
**Eu quero** ter certeza absoluta de que meus dados são invisíveis a outros clientes
**Para que** posso confiar a plataforma com informações confidenciais de projetos

#### Critérios de Aceite
- [ ] Tentar acessar projeto de outra org retorna 404 (não 403, para não revelar existência)
- [ ] Tentar listar recursos retorna apenas os da própria org
- [ ] Relações aninhadas (issues de project de outra org) são filtradas
- [ ] Teste automatizado simula ataque e verifica bloqueio

### Story 2: Dev não consegue criar endpoint inseguro
**Como** desenvolvedor do Spravio
**Eu quero** que o sistema me impeça de criar queries sem escopo
**Para que** eu não introduza vulnerabilidades inadvertidamente

#### Critérios de Aceite
- [ ] Middleware Prisma loga warning para queries sem escopo em models marcados
- [ ] Em staging/prod, middleware bloqueia queries sem escopo (erro 500)
- [ ] ESLint rule detecta endpoints sem `tenantGuard` middleware

---

## 4. Requisitos Funcionais

### 4.1 Auditoria
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-01 | Script de auditoria varre todos os repositories e lista queries sem escopo | Must Have |
| RF-02 | Relatório gerado com arquivo, linha, e risco (alto/médio/baixo) | Must Have |
| RF-03 | Cada query identificada é corrigida ou justificada (comentário) | Must Have |

### 4.2 Prisma Middleware
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-04 | Middleware inspeciona queries em models multi-tenant | Must Have |
| RF-05 | Se `where` não contém `organizationId` nem relação com org, bloquear | Must Have |
| RF-06 | Exceções explícitas via `prisma.$unsafeScope()` para jobs/admin | Must Have |
| RF-07 | Log estruturado de cada violação (sem body) | Must Have |

### 4.3 Tenant Guard Middleware (Fastify)
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-08 | Middleware extrai `organizationId` do JWT | Must Have |
| RF-09 | Injeta `organizationId` no request context | Must Have |
| RF-10 | Usuário com acesso a múltiplas orgs escolhe via header `X-Organization-Id` | Must Have |
| RF-11 | Valida que usuário pertence à org declarada | Must Have |

### 4.4 Testes de Isolamento
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-12 | Suite de testes cria 2 orgs com dados distintos | Must Have |
| RF-13 | Cada endpoint é testado: user de A tentando acessar recurso de B | Must Have |
| RF-14 | Teste falha se API retorna dados ou 200 indevidamente | Must Have |

---

## 5. Requisitos Não-Funcionais

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-01 | Overhead do middleware Prisma | < 1ms por query |
| RNF-02 | Cobertura de testes de isolamento | 100% dos endpoints protegidos |
| RNF-03 | Auditoria inicial | Executada antes de qualquer correção |

---

## 6. Implementação

### 6.1 Script de Auditoria

**Localização:** `apps/api/scripts/audit-tenant-isolation.ts`

```typescript
import { readFileSync } from 'node:fs';
import { globSync } from 'glob';

const MULTI_TENANT_MODELS = [
  'project',
  'sprint',
  'issue',
  'developer',
  'projectAssignment',
  'burndownPoint',
  'organizationSettings',
  'teamsConfig',
  'tempoConfig',
  'clockifyConfig',
  'slackConfig',
  // ... lista completa
];

interface Finding {
  file: string;
  line: number;
  model: string;
  operation: string;
  code: string;
  risk: 'high' | 'medium' | 'low';
  reason: string;
}

function auditFile(file: string): Finding[] {
  const content = readFileSync(file, 'utf-8');
  const findings: Finding[] = [];
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    for (const model of MULTI_TENANT_MODELS) {
      // Regex captura chamadas como prisma.project.findMany(...)
      const pattern = new RegExp(`prisma\\.${model}\\.(findMany|findFirst|findUnique|update|updateMany|delete|deleteMany|count|aggregate)`);
      const match = line.match(pattern);

      if (match) {
        // Extrair bloco where (próximas ~20 linhas)
        const block = lines.slice(idx, idx + 20).join('\n');

        if (!block.includes('organizationId')) {
          findings.push({
            file,
            line: idx + 1,
            model,
            operation: match[1],
            code: line.trim(),
            risk: ['findMany', 'updateMany', 'deleteMany'].includes(match[1]) ? 'high' : 'medium',
            reason: 'Query em model multi-tenant sem filtro por organizationId',
          });
        }
      }
    }
  });

  return findings;
}

function main() {
  const files = globSync('apps/api/src/**/*.ts', { ignore: '**/*.test.ts' });
  const allFindings: Finding[] = [];

  for (const file of files) {
    allFindings.push(...auditFile(file));
  }

  // Agrupa por risco
  const byRisk = {
    high: allFindings.filter((f) => f.risk === 'high'),
    medium: allFindings.filter((f) => f.risk === 'medium'),
    low: allFindings.filter((f) => f.risk === 'low'),
  };

  console.log(`\n=== Tenant Isolation Audit Report ===\n`);
  console.log(`🔴 HIGH:   ${byRisk.high.length}`);
  console.log(`🟠 MEDIUM: ${byRisk.medium.length}`);
  console.log(`🟡 LOW:    ${byRisk.low.length}\n`);

  for (const finding of allFindings) {
    const icon = finding.risk === 'high' ? '🔴' : finding.risk === 'medium' ? '🟠' : '🟡';
    console.log(`${icon} ${finding.file}:${finding.line}`);
    console.log(`   ${finding.model}.${finding.operation}`);
    console.log(`   ${finding.code}\n`);
  }

  if (byRisk.high.length > 0) process.exit(1);
}

main();
```

### 6.2 Prisma Middleware

**Localização:** `apps/api/src/shared/prisma/tenant-isolation.middleware.ts`

```typescript
import { Prisma } from '@prisma/client';
import { logger } from '../logger/logger';

const MULTI_TENANT_MODELS = new Set([
  'Project', 'Sprint', 'Issue', 'Developer', 'ProjectAssignment',
  'BurndownPoint', 'OrganizationSettings', 'TeamsConfig', 'TempoConfig',
  'ClockifyConfig', 'SlackConfig',
  // ...
]);

// Flag que marca queries que podem pular a checagem (admin, jobs)
const UNSAFE_SCOPE_FLAG = Symbol('unsafe-scope');

export function createTenantIsolationMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    if (!params.model || !MULTI_TENANT_MODELS.has(params.model)) {
      return next(params);
    }

    const requireScope = [
      'findMany',
      'findFirst',
      'findUnique',
      'updateMany',
      'deleteMany',
      'count',
      'aggregate',
    ].includes(params.action);

    if (!requireScope) return next(params);

    const args = params.args ?? {};

    // Permite bypass explícito
    if (args[UNSAFE_SCOPE_FLAG]) {
      delete args[UNSAFE_SCOPE_FLAG];
      return next(params);
    }

    const where = args.where ?? {};
    const hasScope = hasOrganizationScope(where);

    if (!hasScope) {
      logger.error({
        model: params.model,
        action: params.action,
        whereKeys: Object.keys(where),
      }, 'TENANT_ISOLATION_VIOLATION');

      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `Tenant isolation violation: ${params.model}.${params.action} called without organizationId`
        );
      }
    }

    return next(params);
  };
}

function hasOrganizationScope(where: any): boolean {
  if (!where) return false;

  // Check direto
  if ('organizationId' in where) return true;

  // Check via relação (ex: project: { organizationId })
  for (const [key, val] of Object.entries(where)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if ('organizationId' in (val as any)) return true;
      if (hasOrganizationScope(val)) return true;
    }
  }

  return false;
}
```

**Uso:**
```typescript
// apps/api/src/shared/prisma/client.ts
import { PrismaClient } from '@prisma/client';
import { createTenantIsolationMiddleware } from './tenant-isolation.middleware';

export const prisma = new PrismaClient();
prisma.$use(createTenantIsolationMiddleware());
```

### 6.3 Tenant Guard (Fastify)

**Localização:** `apps/api/src/shared/auth/tenant-guard.ts`

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    organizationId?: string;
    userId?: string;
    userRole?: 'OWNER' | 'PM' | 'VIEWER';
  }
}

export async function tenantGuard(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // Assume que authGuard já rodou e populou req.userId
  if (!req.userId) {
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }

  // Header opcional para usuários com múltiplas orgs
  const orgHeader = req.headers['x-organization-id'] as string | undefined;

  // Busca vínculos do user
  const memberships = await req.server.prisma.organizationUser.findMany({
    where: { userId: req.userId },
    select: { organizationId: true, role: true },
  });

  if (memberships.length === 0) {
    reply.code(403).send({ error: 'No organization membership' });
    return;
  }

  let target;
  if (orgHeader) {
    target = memberships.find((m) => m.organizationId === orgHeader);
    if (!target) {
      reply.code(403).send({ error: 'Not a member of this organization' });
      return;
    }
  } else {
    // Default: primeira org do user
    target = memberships[0];
  }

  req.organizationId = target.organizationId;
  req.userRole = target.role;
}
```

### 6.4 Suite de Testes de Isolamento

**Localização:** `apps/api/src/__tests__/tenant-isolation.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../app';
import { PrismaClient } from '@prisma/client';

describe('Tenant Isolation', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let prisma: PrismaClient;

  let orgA: string;
  let orgB: string;
  let tokenA: string;
  let tokenB: string;
  let projectA: string;
  let projectB: string;

  beforeAll(async () => {
    app = await buildApp();
    prisma = new PrismaClient();

    // Setup: cria 2 orgs, 2 users, 2 projects
    const seed = await seedTwoOrgs(prisma);
    orgA = seed.orgA;
    orgB = seed.orgB;
    tokenA = seed.tokenA;
    tokenB = seed.tokenB;
    projectA = seed.projectA;
    projectB = seed.projectB;
  });

  afterAll(async () => {
    await cleanup(prisma);
    await app.close();
  });

  describe('GET /projects', () => {
    it('user A only sees projects of org A', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/projects',
        headers: { authorization: `Bearer ${tokenA}` },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.every((p: any) => p.organizationId === orgA)).toBe(true);
      expect(body.find((p: any) => p.id === projectB)).toBeUndefined();
    });
  });

  describe('GET /projects/:id', () => {
    it('user A gets 404 trying to access project of org B', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/projects/${projectB}`,
        headers: { authorization: `Bearer ${tokenA}` },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /projects/:id', () => {
    it('user A cannot update project of org B', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: `/projects/${projectB}`,
        headers: { authorization: `Bearer ${tokenA}` },
        payload: { name: 'Hacked' },
      });
      expect([403, 404]).toContain(res.statusCode);

      // Verifica no banco que não foi alterado
      const project = await prisma.project.findUnique({ where: { id: projectB } });
      expect(project?.name).not.toBe('Hacked');
    });
  });

  describe('DELETE /projects/:id', () => {
    it('user A cannot delete project of org B', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/projects/${projectB}`,
        headers: { authorization: `Bearer ${tokenA}` },
      });
      expect([403, 404]).toContain(res.statusCode);
      const project = await prisma.project.findUnique({ where: { id: projectB } });
      expect(project).not.toBeNull();
    });
  });

  // Repetir para cada recurso: sprints, issues, developers,
  // integrations, settings, etc.
});
```

### 6.5 ESLint Rule

Adicionar ao `.eslintrc.js`:

```javascript
module.exports = {
  rules: {
    // Todo route handler deve ter tenantGuard no preHandler
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.object.name=/^(app|fastify|server)$/][callee.property.name=/^(get|post|put|patch|delete)$/]:not(:has(Property[key.name='preHandler']))",
        message: 'Routes must declare preHandler (authGuard + tenantGuard)',
      },
    ],
  },
};
```

---

## 7. Casos de Borda

| Cenário | Comportamento Esperado |
|---------|----------------------|
| User pertence a múltiplas orgs | Header `X-Organization-Id` escolhe ativa |
| User troca de org durante sessão | Nova request resolve pela header |
| Admin Spravio (staff) precisa acessar dados | Rota admin separada com `$unsafeScope()` + audit log |
| Background job processa todas as orgs | Itera explícito por org, cada query com escopo |
| Webhook recebe payload sem contexto de user | Identifica org via configuração do webhook |
| Query agregada cross-org (métricas internas) | Marca explícita com `$unsafeScope()` + revisão |

---

## 8. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Query existente sem escopo em produção | Média | Crítico | Auditoria inicial + middleware + testes |
| Dev adiciona nova query sem escopo | Média | Crítico | Middleware + CI com testes de isolamento |
| Bypass excessivo via `$unsafeScope()` | Média | Alto | Revisão obrigatória, audit log automático |
| Middleware com bug deixa passar | Baixa | Crítico | Testes do próprio middleware |
| Performance degradada | Baixa | Baixo | Middleware simples, só checa `where` |

---

## 9. Fora de Escopo

- Row-level security (RLS) no PostgreSQL — complexo, backup de defesa para depois
- Schemas separados por tenant — reestruturação fora de escopo
- Criptografia por tenant — custo alto, fora de escopo atual

---

## 10. Dependências

### Dependências de Features
- Nenhuma — pode ser paralela a specs 023 e 024

### Dependências Técnicas
- [ ] Prisma >= 5.x (já em uso)
- [ ] Vitest para testes de integração
- [ ] Banco de teste isolado

---

## 11. Definition of Done

- [ ] Script de auditoria executado e relatório gerado
- [ ] 100% dos findings HIGH corrigidos
- [ ] 100% dos findings MEDIUM corrigidos ou justificados
- [ ] Prisma middleware implementado
- [ ] Middleware bloqueia em produção, avisa em dev
- [ ] Tenant guard Fastify implementado e aplicado em todas as rotas
- [ ] Suite de testes de isolamento cobrindo todos os recursos
- [ ] Testes passam em CI
- [ ] Documentação em `docs/security/tenant-isolation.md`
- [ ] CLAUDE.md atualizado
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings

---

## 12. Estimativa

| Fase | Tempo |
|------|-------|
| Script de auditoria | 1.5h |
| Corrigir findings HIGH/MEDIUM | 3h |
| Prisma middleware + testes | 2h |
| Tenant guard Fastify + aplicar em rotas | 1.5h |
| Suite de testes de isolamento | 1.5h |
| Documentação | 0.5h |
| **Total** | ~10h |
