# Feature Specification: Audit Log

> 🟠 ALTA: Trilha de auditoria completa para acessos sensíveis, ações administrativas e eventos de segurança

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature ID** | 028-audit-log |
| **Branch** | `feat/028-audit-log` |
| **Prioridade** | 🟠 Alta |
| **Data** | 2026-04-21 |
| **Status** | Ready for Implementation |
| **LGPD** | Art. 37, Art. 48 |
| **Dependências** | 025 (Tenant Isolation) |

---

## 1. Resumo

O Spravio não possui trilha de auditoria sistemática. Esta spec implementa um sistema de audit log com:
- **Eventos capturados**: login, logout, falhas de auth, acesso a dados sensíveis, mudanças de config, conexões/desconexões de integrações, ações administrativas, exclusões de dados
- **Storage dedicado**: tabela separada com TTL de 5 anos
- **Consulta pelo cliente**: OWNER pode ver logs da própria org
- **Imutabilidade**: append-only, sem UPDATE/DELETE
- **Integração com Sentry**: eventos críticos geram alertas

---

## 2. Motivação

### Problema
- Sem forma de reconstruir "quem fez o quê e quando" em caso de incidente
- LGPD Art. 48 exige comunicação de incidentes, mas sem log não há como investigar
- Cliente enterprise pede audit log em due diligence
- Sem detecção de padrões suspeitos (tentativas de login falhadas em sequência, por exemplo)

### Impacto
- **Compliance**: incidente sem trilha = multa pesada da ANPD
- **Forense**: impossível determinar escopo de um incidente
- **Confiança**: cliente enterprise não contrata sem audit log
- **Operacional**: support pede histórico e não temos

### Métricas de Sucesso
- [ ] Todos os eventos críticos são registrados
- [ ] Performance do sistema não degrada com audit log
- [ ] Cliente OWNER consegue consultar logs da própria org
- [ ] Logs são imutáveis (tentativa de update falha)
- [ ] Retenção de 5 anos configurada

---

## 3. User Stories

### Story 1: Investigar incidente
**Como** administrador do Spravio investigando um incidente
**Eu quero** ver todas as ações de um usuário em um período
**Para que** eu possa determinar escopo e comunicar à ANPD se necessário

#### Critérios de Aceite
- [ ] Query por `userId` + range de datas
- [ ] Retorna timestamps, IPs, ações e recursos afetados
- [ ] Export em CSV/JSON para forense

### Story 2: Cliente consulta própria trilha
**Como** OWNER de uma organização
**Eu quero** ver quem da minha equipe acessou quais dados
**Para que** eu tenha controle sobre minha organização

#### Critérios de Aceite
- [ ] Endpoint `GET /organizations/:id/audit-logs`
- [ ] Filtros: user, tipo de evento, range de datas
- [ ] Somente eventos da própria org (nunca cross-tenant)
- [ ] Paginação (100 por página)

### Story 3: Alertas automáticos
**Como** operador de segurança
**Eu quero** receber alertas em eventos suspeitos
**Para que** eu possa reagir rápido

#### Critérios de Aceite
- [ ] 5+ falhas de login em 5min → alerta Sentry
- [ ] Desconexão de integração → alerta (audit, não real-time)
- [ ] Mudança de papel de usuário para OWNER → alerta
- [ ] Tentativa de acesso cross-tenant (spec 025) → alerta

---

## 4. Requisitos Funcionais

### 4.1 Eventos a Capturar
| ID | Categoria | Eventos |
|----|-----------|---------|
| RF-01 | Auth | `user.login`, `user.logout`, `user.login_failed`, `user.password_reset`, `user.password_changed` |
| RF-02 | Org | `org.created`, `org.updated`, `org.deletion_requested`, `org.deletion_confirmed`, `org.deletion_cancelled`, `org.deleted` |
| RF-03 | Members | `member.invited`, `member.role_changed`, `member.removed` |
| RF-04 | Integrations | `integration.connected`, `integration.disconnected`, `integration.token_updated`, `integration.sync_triggered` |
| RF-05 | Projects | `project.created`, `project.updated`, `project.deleted`, `project.restored` |
| RF-06 | Data Access | `data.export_requested`, `data.export_downloaded` |
| RF-07 | Security | `security.tenant_isolation_violation`, `security.rate_limit_exceeded`, `security.suspicious_login` |
| RF-08 | Admin | `admin.impersonated_user`, `admin.queried_data`, `admin.unsafe_scope_used` |

### 4.2 Estrutura do Evento
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-09 | Cada evento tem: id, timestamp, type, actor (userId), targetOrg, targetResource, metadata, ip, userAgent | Must Have |
| RF-10 | Metadata é JSON estruturado por tipo de evento | Must Have |
| RF-11 | Sem conteúdo sensível (tokens, senhas, bodies completos) | Must Have |

### 4.3 Armazenamento
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-12 | Tabela `AuditLog` dedicada, append-only | Must Have |
| RF-13 | Trigger SQL bloqueia UPDATE e DELETE em `AuditLog` | Must Have |
| RF-14 | Particionamento por mês (performance em alto volume) | Should Have |
| RF-15 | Retenção de 5 anos (purgar após, via job) | Must Have |

### 4.4 Consulta
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-16 | OWNER consulta logs da própria org | Must Have |
| RF-17 | Admin Spravio consulta qualquer org (com audit próprio) | Must Have |
| RF-18 | Filtros: type, actor, dateRange | Must Have |
| RF-19 | Export CSV/JSON | Should Have |
| RF-20 | Paginação cursor-based | Must Have |

### 4.5 Alertas
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-21 | 5+ `user.login_failed` para mesmo email em 5min → Sentry | Must Have |
| RF-22 | `security.tenant_isolation_violation` → Sentry imediato | Must Have |
| RF-23 | `member.role_changed` para OWNER → e-mail a todos OWNERs | Must Have |

---

## 5. Requisitos Não-Funcionais

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-01 | Overhead de escrita | < 5ms por evento |
| RNF-02 | Escrita não bloqueia request | Async via queue |
| RNF-03 | Volume estimado | 100K eventos/dia por org ativa |
| RNF-04 | Query p95 | < 500ms para range de 30 dias |

---

## 6. API Design

#### `GET /organizations/:id/audit-logs`
**Auth**: OWNER

**Query Params**:
```
?type=user.login&actorId=xxx&from=2026-01-01&to=2026-04-21&limit=100&cursor=xxx
```

**Response 200**:
```typescript
{
  events: Array<{
    id: string;
    type: string;
    timestamp: string;
    actor: { userId: string; email: string; name: string } | null;
    targetResource?: { type: string; id: string };
    metadata: Record<string, unknown>;
    ip: string;
    userAgent: string;
  }>;
  nextCursor: string | null;
}
```

#### `POST /organizations/:id/audit-logs/export`
**Auth**: OWNER

**Request**:
```typescript
{
  from: string;  // ISO date
  to: string;
  format: 'csv' | 'json';
}
```

**Response 202**: Inicia job assíncrono, retorna `jobId`. Cliente polla `GET /jobs/:id`.

---

## 7. Data Model

```prisma
model AuditLog {
  id                String   @id @default(cuid())
  type              String
  organizationId    String?  // null para eventos pre-auth
  actorId           String?  // userId, null para system events
  actorEmail        String?  // snapshot
  targetResourceType String?
  targetResourceId   String?
  metadata          Json     // JSON estruturado, sem secrets
  ip                String?
  userAgent         String?
  createdAt         DateTime @default(now())

  @@index([organizationId, createdAt])
  @@index([actorId, createdAt])
  @@index([type, createdAt])
  @@index([createdAt]) // para purge
}
```

### Trigger SQL de Imutabilidade

```sql
-- Migration: 000_audit_log_immutable.sql
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_no_update
BEFORE UPDATE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

CREATE TRIGGER audit_log_no_delete
BEFORE DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

-- Exceção: role específico para retention job
CREATE ROLE audit_purger;
ALTER TRIGGER audit_log_no_delete ON "AuditLog"
  DEFERRABLE;
-- O job de retenção roda com SET LOCAL session_authorization = 'audit_purger'
```

---

## 8. Implementação

### 8.1 Audit Service

**Localização:** `apps/api/src/shared/audit/audit.service.ts`

```typescript
import { Queue } from 'bullmq';

export type AuditEventType =
  | 'user.login' | 'user.logout' | 'user.login_failed'
  | 'user.password_reset' | 'user.password_changed'
  | 'org.created' | 'org.updated' | 'org.deletion_requested'
  | 'org.deletion_confirmed' | 'org.deletion_cancelled' | 'org.deleted'
  | 'member.invited' | 'member.role_changed' | 'member.removed'
  | 'integration.connected' | 'integration.disconnected'
  | 'integration.token_updated' | 'integration.sync_triggered'
  | 'project.created' | 'project.updated' | 'project.deleted' | 'project.restored'
  | 'data.export_requested' | 'data.export_downloaded'
  | 'security.tenant_isolation_violation' | 'security.rate_limit_exceeded'
  | 'security.suspicious_login'
  | 'admin.impersonated_user' | 'admin.queried_data' | 'admin.unsafe_scope_used';

export interface AuditEvent {
  type: AuditEventType;
  organizationId?: string;
  actorId?: string;
  actorEmail?: string;
  targetResourceType?: string;
  targetResourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export class AuditService {
  private queue: Queue;

  constructor(private prisma: PrismaClient) {
    this.queue = new Queue('audit-log', {
      connection: { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT!) },
    });
  }

  /**
   * Escreve evento de forma assíncrona (não bloqueia request)
   */
  async log(event: AuditEvent): Promise<void> {
    // Sanitização: remover campos sensíveis do metadata
    const sanitized = this.sanitizeMetadata(event.metadata);

    await this.queue.add('write', { ...event, metadata: sanitized }, {
      removeOnComplete: 1000,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  /**
   * Escrita síncrona para eventos críticos (security)
   */
  async logSync(event: AuditEvent): Promise<void> {
    const sanitized = this.sanitizeMetadata(event.metadata);
    await this.prisma.auditLog.create({
      data: {
        type: event.type,
        organizationId: event.organizationId,
        actorId: event.actorId,
        actorEmail: event.actorEmail,
        targetResourceType: event.targetResourceType,
        targetResourceId: event.targetResourceId,
        metadata: sanitized as any,
        ip: event.ip,
        userAgent: event.userAgent,
      },
    });

    // Alertas síncronos para eventos críticos
    if (event.type.startsWith('security.')) {
      Sentry.captureMessage(`Audit: ${event.type}`, {
        level: 'warning',
        extra: { event },
      });
    }
  }

  private sanitizeMetadata(meta?: Record<string, unknown>): Record<string, unknown> {
    if (!meta) return {};
    const SENSITIVE = ['token', 'password', 'secret', 'apiKey', 'pat', 'authorization'];
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(meta)) {
      if (SENSITIVE.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof val === 'object' && val !== null) {
        sanitized[key] = this.sanitizeMetadata(val as Record<string, unknown>);
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }
}
```

### 8.2 Worker

**Localização:** `apps/api/src/jobs/audit.worker.ts`

```typescript
import { Worker } from 'bullmq';

export function createAuditWorker(prisma: PrismaClient) {
  return new Worker(
    'audit-log',
    async (job) => {
      if (job.name === 'write') {
        await prisma.auditLog.create({
          data: { ...job.data, metadata: job.data.metadata as any },
        });
      }
    },
    {
      connection: { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT!) },
      concurrency: 10,
    },
  );
}
```

### 8.3 Uso nos Endpoints

```typescript
// Exemplo: login
app.post('/auth/login', async (req, reply) => {
  const { email, password } = req.body;
  try {
    const user = await authService.login(email, password);
    await auditService.log({
      type: 'user.login',
      actorId: user.id,
      actorEmail: user.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return reply.send({ token: generateJwt(user) });
  } catch (err) {
    await auditService.logSync({  // sync para detectar bruteforce
      type: 'user.login_failed',
      actorEmail: email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { reason: 'invalid_credentials' },
    });
    return reply.code(401).send({ error: 'Unauthorized' });
  }
});
```

### 8.4 Detecção de Padrões (Rate Limit + Alertas)

**Localização:** `apps/api/src/shared/audit/pattern-detector.ts`

```typescript
export class PatternDetector {
  async checkBruteForce(email: string): Promise<boolean> {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const count = await prisma.auditLog.count({
      where: {
        type: 'user.login_failed',
        actorEmail: email,
        createdAt: { gt: fiveMinAgo },
      },
    });

    if (count >= 5) {
      await auditService.logSync({
        type: 'security.suspicious_login',
        actorEmail: email,
        metadata: { reason: 'bruteforce_detected', failedAttempts: count },
      });
      Sentry.captureMessage('Brute force detected', {
        level: 'warning',
        extra: { email, count },
      });
      return true;
    }
    return false;
  }
}
```

### 8.5 Retention Job (5 anos)

```typescript
async purgeOldAuditLogs(): Promise<{ purged: number }> {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 5);

  // Usar role especial que bypass trigger
  await prisma.$executeRaw`SET LOCAL session_authorization = 'audit_purger'`;
  const result = await prisma.$executeRaw`
    DELETE FROM "AuditLog" WHERE "createdAt" < ${cutoff}
  `;
  await prisma.$executeRaw`RESET session_authorization`;

  logger.info({ purged: result }, 'audit_log_purged');
  return { purged: result };
}
```

---

## 9. Endpoints de Consulta

### 9.1 GET /organizations/:id/audit-logs

```typescript
app.get(
  '/organizations/:id/audit-logs',
  { preHandler: [authGuard, tenantGuard, requireRole('OWNER')] },
  async (req, reply) => {
    const { type, actorId, from, to, limit = 100, cursor } = req.query;

    const events = await prisma.auditLog.findMany({
      where: {
        organizationId: req.organizationId,
        ...(type && { type }),
        ...(actorId && { actorId }),
        ...(from && { createdAt: { gte: new Date(from) } }),
        ...(to && { createdAt: { lte: new Date(to) } }),
        ...(cursor && { id: { lt: cursor } }),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
    });

    const nextCursor = events.length === limit ? events[events.length - 1].id : null;

    return reply.send({ events, nextCursor });
  },
);
```

---

## 10. Casos de Borda

| Cenário | Comportamento Esperado |
|---------|----------------------|
| Fila de audit falha | Eventos críticos (security) vão síncrono; resto perde com log de erro |
| Dev tenta UPDATE AuditLog | Erro PostgreSQL do trigger |
| Cliente consulta logs de outra org | tenantGuard bloqueia |
| Volume alto em uma org | Particionamento + índices + paginação cursor |
| Admin impersonando user | Evento `admin.impersonated_user` + todas as ações subsequentes marcadas |

---

## 11. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Audit log vira gargalo | Média | Alto | Queue async, writes batcheados, indexing |
| Metadata expõe dado sensível | Média | Alto | Sanitização + schema explícito por tipo |
| Logs são manipulados | Baixa | Crítico | Trigger immutable + role isolado para purge |
| Volume estoura storage | Média | Médio | Particionamento mensal + retenção 5 anos + monitoring |

---

## 12. Fora de Escopo

- SIEM integration (Splunk, Datadog) — após ter volume
- Real-time streaming de eventos (WebSocket) — use case não claro ainda
- Blockchain / write-once storage — overkill para nível atual
- Audit log de leituras (quem viu o quê) — custo alto, baixo valor inicial

---

## 13. Dependências

### Dependências de Features
- **025** — Tenant Isolation (eventos usam organizationId)

### Dependências Técnicas
- [ ] BullMQ + Redis
- [ ] Sentry configurado
- [ ] PostgreSQL >= 12 (triggers, session_authorization)

---

## 14. Definition of Done

- [ ] Model `AuditLog` criado com índices
- [ ] Trigger SQL de imutabilidade aplicado
- [ ] Role `audit_purger` configurado
- [ ] `AuditService.log()` async e `.logSync()` síncrono
- [ ] Sanitização de metadata testada
- [ ] Worker BullMQ consumindo fila
- [ ] Integração em todos endpoints críticos
- [ ] `PatternDetector` com detecção de bruteforce
- [ ] Endpoint de consulta com filtros
- [ ] Endpoint de export CSV/JSON
- [ ] Retention job (5 anos) funcionando
- [ ] Alertas Sentry para eventos security
- [ ] Testes: imutabilidade, sanitização, isolamento por org
- [ ] Documentação em `docs/security/audit-log.md`
- [ ] CLAUDE.md atualizado
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings

---

## 15. Estimativa

| Fase | Tempo |
|------|-------|
| Model + migration + trigger | 1h |
| AuditService + Worker | 2h |
| Sanitização + testes | 1h |
| Integração em endpoints críticos | 2h |
| Pattern detector | 1h |
| Endpoints de consulta + export | 1.5h |
| Retention job | 0.5h |
| Documentação | 1h |
| **Total** | ~10h |
