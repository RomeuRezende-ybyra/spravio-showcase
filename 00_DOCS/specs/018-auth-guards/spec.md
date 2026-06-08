# Feature Specification: Auth Guards

> 🟠 MÉDIO: Adicionar proteção de autenticação em rotas expostas

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature ID** | 018-auth-guards |
| **Branch** | `fix/018-auth-guards` |
| **Prioridade** | 🟠 Média |
| **Data** | 2026-04-04 |
| **Status** | Ready for Implementation |

---

## 1. Resumo

Várias rotas da API estão acessíveis sem autenticação, expondo dados de projetos, sprints, developers e pull requests. Esta feature adiciona guards JWT em todas as rotas que requerem autenticação.

---

## 2. Motivação

### Problema
Rotas críticas acessíveis sem auth:
- `GET /projects` — Lista todos os projetos
- `GET /projects/:id` — Detalhes de qualquer projeto
- `DELETE /projects/:id` — Deletar qualquer projeto (!)
- `GET /projects/:projectId/sprints` — Sprints de qualquer projeto
- `GET /projects/:projectId/developers` — Developers de qualquer projeto
- `GET /projects/:projectId/pullrequests` — PRs de qualquer projeto
- `POST /projects/:projectId/sync/*` — Triggers de sync

### Impacto
- **Vazamento de dados** — Qualquer pessoa pode ver projetos
- **Sabotagem** — Qualquer pessoa pode deletar projetos
- **Custos** — Qualquer pessoa pode triggerar syncs (API calls)

### Métricas de Sucesso
- [ ] 100% das rotas sensíveis protegidas
- [ ] 401 para requests sem token
- [ ] 403 para requests sem permissão
- [ ] Role-based access funcionando

---

## 3. User Stories

### Story 1: Proteção de Dados
**Como** owner de uma organização  
**Eu quero** que apenas membros autenticados vejam meus projetos  
**Para que** dados da empresa não vazem

#### Critérios de Aceite
- [ ] GET /projects retorna 401 sem token
- [ ] GET /projects/:id retorna 401 sem token
- [ ] Usuário só vê projetos da própria organização

### Story 2: Controle de Acesso por Role
**Como** owner  
**Eu quero** que apenas eu possa deletar projetos  
**Para que** PMs e viewers não causem danos

#### Critérios de Aceite
- [ ] DELETE /projects/:id requer role OWNER
- [ ] POST /projects requer role OWNER
- [ ] PM vê apenas projetos atribuídos a ele
- [ ] VIEWER tem acesso read-only

---

## 4. Requisitos Funcionais

### 4.1 Rotas a Proteger

| Rota | Auth | Role Mínimo |
|------|------|-------------|
| `GET /projects` | ✅ Required | Any (filtered by org) |
| `GET /projects/mine` | ✅ Required | Any |
| `GET /projects/:id` | ✅ Required | Any (own org only) |
| `POST /projects` | ✅ Required | OWNER |
| `DELETE /projects/:id` | ✅ Required | OWNER |
| `GET /projects/:id/sprints` | ✅ Required | Any |
| `GET /projects/:id/sprints/current` | ✅ Required | Any |
| `GET /projects/:id/developers` | ✅ Required | Any |
| `GET /projects/:id/developers/:devId/cards` | ✅ Required | Any |
| `GET /projects/:id/overview` | ✅ Required | Any |
| `GET /projects/:id/pullrequests` | ✅ Required | Any |
| `GET /projects/:id/pullrequests/stats` | ✅ Required | Any |
| `POST /projects/:id/sync/*` | ✅ Required | OWNER, PM |

### 4.2 Rotas que Permanecem Públicas

| Rota | Motivo |
|------|--------|
| `GET /health` | Health check para load balancers |
| `POST /auth/login` | Login |
| `POST /auth/register` | Registro |
| `POST /billing/webhook` | Stripe webhook (usa signature) |
| `GET /portal/:token` | Portal público (usa token próprio) |

---

## 5. Implementação Técnica

### Auth Guard Middleware

```typescript
// apps/api/src/middleware/authGuard.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { OrgRole } from '@prisma/client';

type RoleGuard = OrgRole[] | 'any';

export function authGuard(roles: RoleGuard = 'any') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // 1. Verificar JWT
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ 
        error: 'Unauthorized',
        message: 'Token inválido ou expirado' 
      });
    }

    // 2. Verificar Role (se especificado)
    if (roles !== 'any') {
      const user = request.user as { role: OrgRole };
      if (!roles.includes(user.role)) {
        return reply.status(403).send({ 
          error: 'Forbidden',
          message: 'Você não tem permissão para esta ação' 
        });
      }
    }

    // 3. Verificar se projeto pertence à org do usuário
    const projectId = (request.params as any)?.projectId || (request.params as any)?.id;
    if (projectId) {
      const hasAccess = await verifyProjectAccess(request.user, projectId);
      if (!hasAccess) {
        return reply.status(403).send({ 
          error: 'Forbidden',
          message: 'Você não tem acesso a este projeto' 
        });
      }
    }
  };
}
```

### Aplicando nos Routes

```typescript
// apps/api/src/modules/projects/route.ts

// ANTES (vulnerável):
app.get('/projects', async (request, reply) => { ... });

// DEPOIS (protegido):
app.get('/projects', {
  preHandler: [authGuard('any')],
  handler: async (request, reply) => { ... }
});

app.delete('/projects/:id', {
  preHandler: [authGuard(['OWNER'])],
  handler: async (request, reply) => { ... }
});
```

---

## 6. Arquivos a Modificar

```
apps/api/src/
├── middleware/
│   └── authGuard.ts          # NEW: middleware de auth
├── modules/
│   ├── projects/route.ts     # Adicionar preHandler
│   ├── sprints/route.ts      # Adicionar preHandler
│   ├── developers/route.ts   # Adicionar preHandler
│   ├── overview/route.ts     # Adicionar preHandler
│   ├── pullrequests/route.ts # Adicionar preHandler
│   └── sync/route.ts         # Adicionar preHandler
└── plugins/jwt.ts            # Verificar config existente
```

---

## 7. Casos de Borda

| Cenário | Comportamento |
|---------|---------------|
| Token expirado | 401 + mensagem clara |
| Token válido, org errada | 403 + "Sem acesso a este projeto" |
| PM tentando deletar | 403 + "Sem permissão" |
| VIEWER tentando editar | 403 + "Acesso read-only" |
| Projeto não existe | 404 (após auth check) |

---

## 8. Testes de Verificação

```bash
# Sem token → 401
curl http://localhost:3010/projects
# Expected: {"error":"Unauthorized","message":"Token inválido ou expirado"}

# Com token válido → 200
curl -H "Authorization: Bearer $TOKEN" http://localhost:3010/projects
# Expected: [array de projetos da org]

# PM tentando deletar → 403
curl -X DELETE -H "Authorization: Bearer $PM_TOKEN" http://localhost:3010/projects/xxx
# Expected: {"error":"Forbidden","message":"Sem permissão"}
```

---

## 9. Definition of Done

- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings
- [ ] Todas rotas listadas retornam 401 sem token
- [ ] Role checks funcionando (OWNER vs PM vs VIEWER)
- [ ] Org isolation funcionando (user só vê própria org)
- [ ] CLAUDE.md atualizado

---

## 10. Estimativa

| Fase | Tempo |
|------|-------|
| Criar authGuard middleware | 1h |
| Aplicar em todas rotas | 1.5h |
| Testes manuais | 1h |
| **Total** | ~3.5h |
