# Feature Specification: Data Retention & Deletion

> 🟠 ALTA: Implementar política de retenção automática, soft delete e direito ao esquecimento (LGPD Art. 16)

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature ID** | 026-data-retention-deletion |
| **Branch** | `feat/026-data-retention-deletion` |
| **Prioridade** | 🟠 Alta |
| **Data** | 2026-04-21 |
| **Status** | Ready for Implementation |
| **LGPD** | Art. 15, Art. 16, Art. 18 |
| **Dependências** | 023 (token encryption) |

---

## 1. Resumo

Hoje o Spravio retém dados indefinidamente. Esta spec implementa:
- **Soft delete** em todos os models relevantes (com campo `deletedAt`)
- **Hard delete automático** após 30 dias de soft delete (job diário)
- **Retenção configurável** por tipo de dado (issues antigas, burndown histórico)
- **Endpoint de direito ao esquecimento**: cliente solicita exclusão → 30 dias para recuperação → purga total
- **Exclusão em cascata** respeitando integridade referencial

---

## 2. Motivação

### Problema
- Dados de projetos ficam no banco indefinidamente mesmo após cliente parar de usar
- Não há mecanismo para cliente solicitar exclusão
- Backup de histórico ocupa espaço e aumenta superfície de exposição
- Viola Art. 15 LGPD (término do tratamento) e Art. 16 (eliminação dos dados)

### Impacto
- **Compliance**: cliente exige por contrato ou ANPD questiona
- **Custo**: armazenamento cresce sem limite
- **Exposição**: quanto mais dados retidos, maior o dano em caso de incidente
- **Contratual**: DPA com enterprise vai exigir prazos explícitos de retenção e exclusão

### Métricas de Sucesso
- [ ] 100% dos models multi-tenant têm soft delete
- [ ] Job de hard delete roda diariamente e purga registros expirados
- [ ] Endpoint `DELETE /organizations/:id/data` funciona e documenta processo
- [ ] Logs de exclusão guardados por 5 anos (metadata apenas, não conteúdo)

---

## 3. User Stories

### Story 1: Cancelar conta e ter dados apagados
**Como** cliente do Spravio cancelando contrato
**Eu quero** solicitar exclusão de todos os meus dados
**Para que** a LGPD seja respeitada e meus dados não fiquem retidos

#### Critérios de Aceite
- [ ] Endpoint para solicitar exclusão total
- [ ] Confirmação por e-mail com janela de 30 dias para cancelar
- [ ] Após 30 dias, dados são hard-deletados
- [ ] E-mail de confirmação final enviado
- [ ] Log de auditoria mantido (sem dados pessoais)

### Story 2: Remover um projeto específico
**Como** gerente de projeto
**Eu quero** remover um projeto obsoleto
**Para que** ele não apareça no dashboard e dados relacionados sejam limpos

#### Critérios de Aceite
- [ ] Soft delete imediato (projeto some da UI)
- [ ] Hard delete em 30 dias se não restaurado
- [ ] Restauração possível dentro da janela
- [ ] Dados relacionados (issues, sprints) seguem o mesmo ciclo

### Story 3: Política de retenção automática
**Como** operador do Spravio
**Eu quero** que dados muito antigos sejam purgados automaticamente
**Para que** não acumulamos dados além do necessário

#### Critérios de Aceite
- [ ] Burndown points com mais de 2 anos são hard-deletados
- [ ] Issues fechadas há mais de 1 ano têm body/descrição removidos, apenas metadata
- [ ] Logs de webhook/sync com mais de 90 dias são purgados
- [ ] Política documentada publicamente

---

## 4. Requisitos Funcionais

### 4.1 Soft Delete
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-01 | Campo `deletedAt` em models: Organization, Project, Sprint, Issue, Developer, ProjectAssignment | Must Have |
| RF-02 | Queries default filtram `deletedAt: null` | Must Have |
| RF-03 | Operação DELETE seta `deletedAt = now()` em vez de remover | Must Have |
| RF-04 | Endpoint `POST /projects/:id/restore` para recuperar dentro da janela | Must Have |

### 4.2 Hard Delete Automático
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-05 | Job diário (BullMQ) purga registros com `deletedAt < now() - 30 days` | Must Have |
| RF-06 | Exclusão em cascata: project deletado → issues, sprints, assignments deletados | Must Have |
| RF-07 | Logs de hard delete: timestamp, tipo, orgId, contagem (sem conteúdo) | Must Have |

### 4.3 Direito ao Esquecimento (Organization-level)
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-08 | Endpoint `POST /organizations/:id/request-deletion` — inicia processo | Must Have |
| RF-09 | E-mail de confirmação obrigatória (link com token de 48h) | Must Have |
| RF-10 | Organization fica em estado `PENDING_DELETION` por 30 dias | Must Have |
| RF-11 | Endpoint `POST /organizations/:id/cancel-deletion` — dentro da janela | Must Have |
| RF-12 | Após 30 dias: purga total (org + todos os models relacionados + tokens revogados) | Must Have |
| RF-13 | Backups com dados do cliente purgados em 90 dias após solicitação | Should Have |

### 4.4 Retenção por Tipo de Dado
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-14 | BurndownPoint: 2 anos após sprint encerrada | Should Have |
| RF-15 | Issue body/description: 1 ano após fechamento (metadata preservada) | Should Have |
| RF-16 | Webhook payloads: 90 dias | Should Have |
| RF-17 | Audit logs (spec 028): 5 anos | Should Have |
| RF-18 | Política configurável via variáveis de ambiente | Nice to Have |

---

## 5. Requisitos Não-Funcionais

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-01 | Job de hard delete | Completa em < 10min para DB de 1M registros |
| RNF-02 | Transacional | Hard delete de org é atômico ou falha |
| RNF-03 | Observabilidade | Cada execução do job registra sucesso/falha |
| RNF-04 | Idempotência | Job pode rodar múltiplas vezes sem erro |

---

## 6. API Design

### Novos Endpoints

#### `POST /organizations/:id/request-deletion`
**Auth**: OWNER apenas

**Request**:
```typescript
{
  reason?: string;           // Opcional: motivo
  confirmationEmail: string; // Deve bater com email do OWNER
}
```

**Response 202**:
```typescript
{
  requestId: string;
  scheduledDeletionAt: string; // ISO date, now + 30 days
  confirmationEmailSent: boolean;
}
```

**Comportamento**:
- Gera token de confirmação (48h de validade)
- Envia e-mail ao OWNER com link
- Organization entra em estado `PENDING_CONFIRMATION`
- Após confirmação via link: estado `PENDING_DELETION`, timer de 30 dias inicia

#### `GET /organizations/:id/confirm-deletion?token=xxx`
**Auth**: Token no query param (não JWT)

Confirma a intenção. Org passa a `PENDING_DELETION`.

#### `POST /organizations/:id/cancel-deletion`
**Auth**: OWNER apenas, dentro da janela de 30 dias

Cancela exclusão. Org volta a `ACTIVE`.

#### `DELETE /projects/:id`
**Auth**: OWNER ou PM

Soft delete. Body não requerido.

**Response 200**:
```typescript
{
  id: string;
  deletedAt: string;
  scheduledHardDeleteAt: string; // deletedAt + 30 days
}
```

#### `POST /projects/:id/restore`
**Auth**: OWNER ou PM, dentro da janela de 30 dias

Restaura soft-deleted project.

---

## 7. Data Model

### Alterações em Models Existentes

```prisma
model Organization {
  deletedAt              DateTime?
  deletionStatus         DeletionStatus @default(ACTIVE)
  deletionRequestedAt    DateTime?
  deletionScheduledAt    DateTime?
  deletionRequestedBy    String?        // userId
  deletionConfirmedAt    DateTime?
}

enum DeletionStatus {
  ACTIVE
  PENDING_CONFIRMATION
  PENDING_DELETION
  DELETED
}

model Project {
  deletedAt              DateTime?
  @@index([deletedAt])
}

model Sprint {
  deletedAt              DateTime?
  @@index([deletedAt])
}

model Issue {
  deletedAt              DateTime?
  bodyRedactedAt         DateTime?  // Quando body foi limpo por retenção
  @@index([deletedAt])
}

model Developer {
  deletedAt              DateTime?
  @@index([deletedAt])
}

model ProjectAssignment {
  deletedAt              DateTime?
}
```

### Novos Models

```prisma
model DataDeletionRequest {
  id                  String   @id @default(cuid())
  organizationId      String
  requestedBy         String   // userId
  requestedAt         DateTime @default(now())
  scheduledDeletionAt DateTime
  confirmationToken   String   @unique
  confirmationExpiresAt DateTime
  confirmedAt         DateTime?
  cancelledAt         DateTime?
  cancelledBy         String?
  completedAt         DateTime?
  reason              String?

  @@index([scheduledDeletionAt])
  @@index([organizationId])
}

model DeletionLog {
  id                String   @id @default(cuid())
  organizationId    String   // Guardado mesmo após org ser deletada
  organizationName  String   // Snapshot
  requestedAt       DateTime
  completedAt       DateTime @default(now())
  recordsDeleted    Json     // { projects: 5, issues: 1200, ... }
  requestedBy       String

  @@index([organizationId])
}
```

---

## 8. Implementação

### 8.1 Prisma Extension: Default Filter

**Localização:** `apps/api/src/shared/prisma/soft-delete.extension.ts`

```typescript
import { Prisma } from '@prisma/client';

const MODELS_WITH_SOFT_DELETE = [
  'Organization', 'Project', 'Sprint', 'Issue', 'Developer', 'ProjectAssignment',
];

export const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  query: {
    $allModels: {
      async findMany({ model, args, query }) {
        if (MODELS_WITH_SOFT_DELETE.includes(model)) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
      async findFirst({ model, args, query }) {
        if (MODELS_WITH_SOFT_DELETE.includes(model)) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
      async delete({ model, args, query }) {
        if (MODELS_WITH_SOFT_DELETE.includes(model)) {
          // Intercepta delete → update deletedAt
          return (prisma as any)[model.charAt(0).toLowerCase() + model.slice(1)].update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        }
        return query(args);
      },
    },
  },
});
```

### 8.2 Serviço de Retenção

**Localização:** `apps/api/src/modules/retention/retention.service.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { logger } from '../../shared/logger/logger';

export class RetentionService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Purga registros com soft-delete > 30 dias
   */
  async hardDeleteExpired(): Promise<{ deleted: Record<string, number> }> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const counts: Record<string, number> = {};

    // Ordem importa: filhos antes de pais
    const tables = [
      { model: 'burndownPoint', where: { sprint: { deletedAt: { lt: cutoff } } } },
      { model: 'issue', where: { deletedAt: { lt: cutoff } } },
      { model: 'sprint', where: { deletedAt: { lt: cutoff } } },
      { model: 'projectAssignment', where: { deletedAt: { lt: cutoff } } },
      { model: 'developer', where: { deletedAt: { lt: cutoff } } },
      { model: 'project', where: { deletedAt: { lt: cutoff } } },
    ];

    for (const { model, where } of tables) {
      // $unsafeScope já que estamos em cleanup admin
      const result = await (this.prisma as any)[model].deleteMany({ where });
      counts[model] = result.count;
    }

    logger.info({ counts }, 'hard_delete_expired_completed');
    return { deleted: counts };
  }

  /**
   * Redaciona conteúdo de issues antigas (mantém metadata)
   */
  async redactOldIssueContent(): Promise<{ redacted: number }> {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);

    const result = await this.prisma.issue.updateMany({
      where: {
        status: { in: ['CLOSED', 'DONE'] },
        closedAt: { lt: cutoff },
        bodyRedactedAt: null,
      },
      data: {
        title: '[REDACTED]',
        description: null,
        bodyRedactedAt: new Date(),
      },
    });

    logger.info({ redacted: result.count }, 'issue_content_redacted');
    return { redacted: result.count };
  }

  /**
   * Purga burndown points antigos
   */
  async purgeOldBurndown(): Promise<{ purged: number }> {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 2);

    const result = await this.prisma.burndownPoint.deleteMany({
      where: {
        sprint: { completedAt: { lt: cutoff } },
      },
    });

    logger.info({ purged: result.count }, 'burndown_purged');
    return { purged: result.count };
  }
}
```

### 8.3 Job Diário (BullMQ)

**Localização:** `apps/api/src/jobs/retention.job.ts`

```typescript
import { Queue, Worker } from 'bullmq';
import { RetentionService } from '../modules/retention/retention.service';

export const retentionQueue = new Queue('retention', {
  connection: { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT!) },
});

// Agenda diária: 03:00 UTC
export async function scheduleRetention() {
  await retentionQueue.add(
    'daily-cleanup',
    {},
    {
      repeat: { pattern: '0 3 * * *' },
      removeOnComplete: 30,
      removeOnFail: 90,
    },
  );
}

export function createRetentionWorker(service: RetentionService) {
  return new Worker(
    'retention',
    async (job) => {
      if (job.name === 'daily-cleanup') {
        await service.hardDeleteExpired();
        await service.redactOldIssueContent();
        await service.purgeOldBurndown();
        await service.processOrgDeletionRequests();
      }
    },
    { connection: { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT!) } },
  );
}
```

### 8.4 Org Deletion Processor

```typescript
async processOrgDeletionRequests(): Promise<void> {
  const due = await this.prisma.dataDeletionRequest.findMany({
    where: {
      scheduledDeletionAt: { lte: new Date() },
      completedAt: null,
      cancelledAt: null,
      confirmedAt: { not: null },
    },
  });

  for (const req of due) {
    await this.executeOrgDeletion(req);
  }
}

async executeOrgDeletion(req: DataDeletionRequest): Promise<void> {
  const org = await this.prisma.organization.findUnique({
    where: { id: req.organizationId },
  });

  if (!org) return;

  const counts: Record<string, number> = {};

  await this.prisma.$transaction(async (tx) => {
    // Revogar tokens externos (quando possível, ver spec 027)
    // ... revogação via APIs externas

    // Purgar em cascata (ordem importa)
    counts.burndownPoints = (await tx.burndownPoint.deleteMany({
      where: { sprint: { project: { organizationId: org.id } } },
    })).count;

    counts.issues = (await tx.issue.deleteMany({
      where: { project: { organizationId: org.id } },
    })).count;

    counts.sprints = (await tx.sprint.deleteMany({
      where: { project: { organizationId: org.id } },
    })).count;

    counts.projectAssignments = (await tx.projectAssignment.deleteMany({
      where: { project: { organizationId: org.id } },
    })).count;

    counts.developers = (await tx.developer.deleteMany({
      where: { organizationId: org.id },
    })).count;

    counts.projects = (await tx.project.deleteMany({
      where: { organizationId: org.id },
    })).count;

    counts.integrations = (await tx.organizationSettings.deleteMany({
      where: { organizationId: org.id },
    })).count;

    counts.memberships = (await tx.organizationUser.deleteMany({
      where: { organizationId: org.id },
    })).count;

    // Snapshot antes de deletar org
    await tx.deletionLog.create({
      data: {
        organizationId: org.id,
        organizationName: org.name,
        requestedAt: req.requestedAt,
        recordsDeleted: counts,
        requestedBy: req.requestedBy,
      },
    });

    // Finalmente, deletar org
    await tx.organization.delete({ where: { id: org.id } });

    // Marcar request como completo
    await tx.dataDeletionRequest.update({
      where: { id: req.id },
      data: { completedAt: new Date() },
    });
  });

  // Enviar email de confirmação final
  await sendDeletionCompletedEmail(req.requestedBy, counts);

  logger.info({ organizationId: org.id, counts }, 'organization_deleted');
}
```

### 8.5 E-mail de Confirmação

```typescript
async sendDeletionConfirmationEmail(
  request: DataDeletionRequest,
  userEmail: string,
): Promise<void> {
  const confirmUrl = `${process.env.APP_URL}/organizations/${request.organizationId}/confirm-deletion?token=${request.confirmationToken}`;
  const cancelUrl = `${process.env.APP_URL}/organizations/${request.organizationId}/cancel-deletion`;

  await emailService.send({
    to: userEmail,
    subject: '[Spravio] Confirmação de exclusão de dados',
    html: `
      <h1>Confirmação de exclusão de dados</h1>
      <p>Você solicitou a exclusão completa dos dados da organização.</p>
      <p><strong>Após confirmação, todos os dados serão removidos em 30 dias.</strong></p>
      <p>Você pode cancelar a qualquer momento durante este período.</p>
      <p><a href="${confirmUrl}">Confirmar exclusão</a></p>
      <p>Este link expira em 48 horas.</p>
      <p>Se você não fez esta solicitação, ignore este e-mail.</p>
    `,
  });
}
```

---

## 9. Casos de Borda

| Cenário | Comportamento Esperado |
|---------|----------------------|
| User deleta project e depois restaura | `deletedAt = null` restaura, job não purga |
| User solicita deleção, depois cancela | Estado volta a ACTIVE, timer cancela |
| Job de hard delete falha no meio | Transação reverte, retry no próximo dia |
| Usuário único de org deletada ainda tenta login | 403 explicando que org foi deletada |
| Token de confirmação expira | Erro 410 Gone, precisa solicitar novamente |
| Múltiplos OWNERs, um solicita deleção | Email a todos, qualquer OWNER pode cancelar |
| Foreign key constraint falha | Revisar ordem de deleção, transação aborta |

---

## 10. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Deleção indevida de cliente pagante | Média | Crítico | Confirmação dupla + janela 30d + email OWNER |
| Hard delete antes da hora | Baixa | Crítico | Cutoff explícito + testes + dry-run em staging |
| Queries legítimas retornam soft-deleted | Média | Médio | Extension Prisma, endpoint `includeDeleted: true` explícito |
| Job falha silenciosamente | Média | Médio | Alertas no Sentry + métricas no dashboard |
| Backup retém dados após exclusão | Alta | Médio | Política de backup rotation + documentação |
| Cascata quebra por FK | Média | Alto | Testes de integração + ordem revisada |

---

## 11. Fora de Escopo

- Backup retention policy (infraestrutura separada)
- Exclusão de dados em integrações externas (não controlamos)
- Anonimização científica (manter estatísticas sem PII) — futuro
- Export antes de excluir — spec 030 trata disso
- Direito ao esquecimento por titular individual (funcionário do cliente) — complexidade B2B, discussão separada

---

## 12. Dependências

### Dependências de Features
- **023** (Token Encryption) — tokens precisam ser revogados no processo de deleção

### Dependências Técnicas
- [ ] BullMQ + Redis configurados (já em uso)
- [ ] Serviço de e-mail configurado (SendGrid/Resend)
- [ ] Prisma >= 5.x com extensions

---

## 13. Definition of Done

- [ ] Campos `deletedAt` adicionados em todos os models relevantes
- [ ] Prisma extension filtra `deletedAt: null` por default
- [ ] Endpoint DELETE vira soft delete
- [ ] Endpoint POST /restore funciona na janela de 30 dias
- [ ] Job diário de hard delete implementado e agendado
- [ ] Endpoint de solicitação de exclusão org-level implementado
- [ ] Fluxo de confirmação por e-mail funciona
- [ ] Endpoint de cancelamento funciona
- [ ] Job processa exclusões agendadas
- [ ] `DeletionLog` guarda metadata pós-exclusão
- [ ] Testes automatizados de cada fluxo
- [ ] Documentação pública: `/help/data-retention` ou similar
- [ ] Política de retenção documentada em `docs/security/retention.md`
- [ ] CLAUDE.md atualizado
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings

---

## 14. Estimativa

| Fase | Tempo |
|------|-------|
| Schema Prisma + migration | 1h |
| Prisma extension soft delete | 1.5h |
| RetentionService + testes | 2h |
| Job BullMQ + scheduler | 1h |
| Endpoints de request/confirm/cancel deletion | 2h |
| Fluxo de e-mail | 1h |
| Testes end-to-end | 2h |
| Documentação | 1.5h |
| **Total** | ~12h |
