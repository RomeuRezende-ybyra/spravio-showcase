# Feature Specification: Data Export & Portability

> 🟡 MÉDIA: Permitir que o cliente exporte todos os seus dados em formato legível (LGPD Art. 18)

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature ID** | 030-data-export-portability |
| **Branch** | `feat/030-data-export-portability` |
| **Prioridade** | 🟡 Média |
| **Data** | 2026-04-21 |
| **Status** | Ready for Implementation |
| **LGPD** | Art. 18 (direitos do titular — portabilidade) |
| **Dependências** | 026 (Data Retention), 028 (Audit Log) |

---

## 1. Resumo

A LGPD (Art. 18, V) garante ao titular o direito de **portabilidade dos dados**. Para o Spravio como operador B2B, isso significa: o cliente (OWNER da Organization) deve poder exportar **todos** os dados que armazenamos sobre ele em formato estruturado e legível por máquina.

Esta spec implementa:
- Endpoint assíncrono para solicitar export
- Job BullMQ que compila JSON com todos os dados do tenant
- Empacotamento em ZIP
- Link de download temporário (24h) via URL assinada
- Exclusão automática do ZIP após 7 dias
- Audit log de cada solicitação (spec 028)

---

## 2. Motivação

### Problema
- Cliente não tem forma de sair do Spravio levando seus dados
- Em caso de cancelamento, cliente perde histórico de projetos/sprints
- Viola Art. 18 V da LGPD (portabilidade dos dados a outro fornecedor)
- Cliente enterprise exige por contrato

### Impacto
- **Compliance**: ANPD pode exigir e não temos resposta
- **Contratual**: DPA com cliente enterprise vai mencionar portabilidade
- **Confiança**: cliente pode testar antes de comprar ("quero ver o que vocês guardam sobre mim")
- **Vendor lock-in negativo**: impossibilidade de export gera desconfiança, não retenção

### Métricas de Sucesso
- [ ] Endpoint de export disponível para OWNER
- [ ] Export completo gerado em < 5min para 100K registros
- [ ] Formato JSON documentado e estável
- [ ] Link de download expira em 24h
- [ ] Audit log registra cada solicitação

---

## 3. User Stories

### Story 1: Cliente quer cópia completa dos dados
**Como** OWNER de uma Organization
**Eu quero** baixar um arquivo com todos os meus dados
**Para que** eu possa arquivar localmente ou migrar para outra ferramenta

#### Critérios de Aceite
- [ ] Botão "Exportar dados" em Settings
- [ ] Ao clicar: processamento assíncrono
- [ ] E-mail enviado quando pronto com link de download
- [ ] ZIP contém JSON estruturado com todos os recursos

### Story 2: Antes de cancelar, quero ver o que tenho
**Como** cliente pensando em cancelar
**Eu quero** inspecionar o que o Spravio tem sobre mim
**Para que** eu tome uma decisão informada

#### Critérios de Aceite
- [ ] Export pode ser solicitado a qualquer momento
- [ ] Sem limite de exports por mês (razoável: 1 por dia para evitar abuso)
- [ ] Manifesto no ZIP lista o que está incluído

### Story 3: Due diligence de cliente enterprise
**Como** prospect enterprise avaliando o Spravio
**Eu quero** ver a estrutura exata dos dados exportados
**Para que** meu time de compliance valide

#### Critérios de Aceite
- [ ] Documentação pública do schema do export
- [ ] Export sample disponível (dados fictícios)
- [ ] Formato estável com versionamento

---

## 4. Requisitos Funcionais

### 4.1 Conteúdo do Export
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-01 | Organization: metadata, settings (SEM tokens — apenas máscaras) | Must Have |
| RF-02 | Members: users vinculados à org, roles, datas | Must Have |
| RF-03 | Projects: todos os projetos + source metadata | Must Have |
| RF-04 | Sprints: sprints com datas, status, burndown | Must Have |
| RF-05 | Issues: issues sincronizadas (ID, título, status, assignee, datas) | Must Have |
| RF-06 | Developers: mapeamento dev ↔ jira/github/azure IDs | Must Have |
| RF-07 | ProjectAssignments: histórico de atribuições | Must Have |
| RF-08 | BurndownPoints: pontos históricos de burndown | Must Have |
| RF-09 | Audit logs da própria org (últimos 12 meses) | Should Have |
| RF-10 | Configs de integração (webhooks, configs — sem tokens) | Must Have |

### 4.2 Formato
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-11 | JSON estruturado, um arquivo por model | Must Have |
| RF-12 | Arquivo `manifest.json` descrevendo conteúdo e versão do schema | Must Have |
| RF-13 | `README.md` explicando estrutura em português | Must Have |
| RF-14 | ZIP como container | Must Have |
| RF-15 | Versão do schema (ex: `schema_version: "1.0"`) para estabilidade | Must Have |

### 4.3 Fluxo
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-16 | Endpoint `POST /organizations/:id/exports` cria solicitação | Must Have |
| RF-17 | Job BullMQ processa em background | Must Have |
| RF-18 | ZIP salvo em storage (S3 ou similar) com nome aleatório | Must Have |
| RF-19 | URL assinada com TTL de 24h gerada | Must Have |
| RF-20 | E-mail enviado ao OWNER com link | Must Have |
| RF-21 | Job de cleanup remove ZIPs após 7 dias | Must Have |

### 4.4 Segurança
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-22 | Somente OWNER pode solicitar | Must Have |
| RF-23 | Rate limit: 1 export por org a cada 24h | Must Have |
| RF-24 | Tokens/credenciais NUNCA incluídos (apenas máscaras) | Must Have |
| RF-25 | URL de download não é pública — requer token de acesso único | Must Have |
| RF-26 | Audit log registra solicitação e download | Must Have |

---

## 5. Requisitos Não-Funcionais

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-01 | Performance | < 5min para org com 100K registros |
| RNF-02 | Tamanho máximo | Suportar até 500MB (acima disso, dividir em partes) |
| RNF-03 | Storage | S3-compatible com encryption at rest |
| RNF-04 | URL TTL | 24h, não configurável pelo user |
| RNF-05 | Retenção do ZIP | 7 dias, purga automática |

---

## 6. API Design

### Novos Endpoints

#### `POST /organizations/:id/exports`
**Auth**: OWNER

**Request**: vazio (ou opcionalmente `{ include: ["audit_logs"] }`)

**Response 202**:
```typescript
{
  exportId: string;
  status: 'pending';
  estimatedCompletionAt: string;
  message: 'Você receberá um email quando o export estiver pronto';
}
```

**Response 429** (rate limit):
```typescript
{
  error: 'RateLimitExceeded';
  message: 'Aguarde antes de solicitar novo export';
  retryAfter: string; // ISO date
}
```

#### `GET /organizations/:id/exports`
**Auth**: OWNER

Lista exports recentes.

**Response 200**:
```typescript
{
  exports: Array<{
    id: string;
    status: 'pending' | 'processing' | 'ready' | 'expired' | 'failed';
    requestedAt: string;
    completedAt: string | null;
    downloadUrl: string | null; // só se status=ready
    expiresAt: string | null;
    sizeBytes: number | null;
    recordCounts: Record<string, number> | null;
  }>;
}
```

#### `GET /organizations/:id/exports/:exportId/download?token=xxx`
**Auth**: Token via query param (URL assinada)

Download direto do ZIP. Audit log registra.

---

## 7. Data Model

```prisma
model DataExport {
  id               String       @id @default(cuid())
  organizationId   String
  requestedBy      String       // userId
  requestedAt      DateTime     @default(now())
  status           ExportStatus @default(PENDING)
  startedAt        DateTime?
  completedAt      DateTime?
  failedAt         DateTime?
  errorMessage     String?

  // Artefato
  storageKey       String?      // chave no S3
  downloadToken    String?      @unique // token para URL assinada
  downloadExpiresAt DateTime?
  sizeBytes        BigInt?
  recordCounts     Json?        // { projects: 15, issues: 342, ... }

  // Lifecycle
  downloadedAt     DateTime?
  downloadCount    Int          @default(0)
  purgedAt         DateTime?    // quando ZIP foi removido do storage

  @@index([organizationId, status])
  @@index([requestedAt])
  @@index([downloadExpiresAt])
}

enum ExportStatus {
  PENDING
  PROCESSING
  READY
  EXPIRED
  FAILED
}
```

---

## 8. Implementação

### 8.1 Export Service

**Localização:** `apps/api/src/modules/data-export/export.service.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import crypto from 'node:crypto';

export class DataExportService {
  private queue: Queue;

  constructor(
    private prisma: PrismaClient,
    private auditService: AuditService,
  ) {
    this.queue = new Queue('data-export', {
      connection: { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT!) },
    });
  }

  async requestExport(
    organizationId: string,
    requestedBy: string,
  ): Promise<DataExport> {
    // Rate limit: 1 export por 24h
    const recentExport = await this.prisma.dataExport.findFirst({
      where: {
        organizationId,
        requestedAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        status: { notIn: ['FAILED'] },
      },
    });

    if (recentExport) {
      const retryAfter = new Date(recentExport.requestedAt.getTime() + 24 * 60 * 60 * 1000);
      throw new HttpError(429, 'RateLimitExceeded', { retryAfter });
    }

    // Criar registro
    const dataExport = await this.prisma.dataExport.create({
      data: {
        organizationId,
        requestedBy,
        status: 'PENDING',
      },
    });

    // Enqueue job
    await this.queue.add(
      'generate-export',
      { exportId: dataExport.id },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 60_000 },
        removeOnComplete: 100,
      },
    );

    // Audit
    await this.auditService.log({
      type: 'data.export_requested',
      organizationId,
      actorId: requestedBy,
      targetResourceType: 'DataExport',
      targetResourceId: dataExport.id,
    });

    return dataExport;
  }
}
```

### 8.2 Worker — Geração do Export

**Localização:** `apps/api/src/jobs/data-export.worker.ts`

```typescript
import { Worker } from 'bullmq';
import archiver from 'archiver';
import { PassThrough } from 'node:stream';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.EXPORT_BUCKET!;
const SCHEMA_VERSION = '1.0';

export function createDataExportWorker(
  prisma: PrismaClient,
  crypto: CryptoService,
) {
  return new Worker(
    'data-export',
    async (job) => {
      const { exportId } = job.data;
      const dataExport = await prisma.dataExport.findUniqueOrThrow({
        where: { id: exportId },
      });

      try {
        await prisma.dataExport.update({
          where: { id: exportId },
          data: { status: 'PROCESSING', startedAt: new Date() },
        });

        const result = await generateExport(prisma, crypto, dataExport.organizationId);

        // Token aleatório para URL
        const downloadToken = crypto.randomBytes(32).toString('base64url');
        const storageKey = `exports/${dataExport.organizationId}/${exportId}.zip`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Upload para S3
        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: storageKey,
            Body: result.buffer,
            ContentType: 'application/zip',
            ServerSideEncryption: 'AES256',
          }),
        );

        await prisma.dataExport.update({
          where: { id: exportId },
          data: {
            status: 'READY',
            completedAt: new Date(),
            storageKey,
            downloadToken,
            downloadExpiresAt: expiresAt,
            sizeBytes: BigInt(result.buffer.length),
            recordCounts: result.recordCounts,
          },
        });

        // Enviar e-mail
        await sendExportReadyEmail({
          organizationId: dataExport.organizationId,
          requestedBy: dataExport.requestedBy,
          exportId,
          downloadToken,
          expiresAt,
        });
      } catch (err) {
        await prisma.dataExport.update({
          where: { id: exportId },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            errorMessage: (err as Error).message,
          },
        });
        throw err;
      }
    },
    {
      connection: { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT!) },
      concurrency: 2,
    },
  );
}

async function generateExport(
  prisma: PrismaClient,
  crypto: CryptoService,
  organizationId: string,
): Promise<{ buffer: Buffer; recordCounts: Record<string, number> }> {
  const recordCounts: Record<string, number> = {};

  // Buscar todos os dados
  const org = await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId },
    include: {
      settings: true,
      members: { include: { user: true } },
    },
  });

  // IMPORTANTE: Remover ciphertext e substituir por máscaras
  const settingsSanitized = sanitizeSettingsForExport(org.settings, crypto);
  const membersSanitized = org.members.map((m) => ({
    userId: m.userId,
    email: m.user.email,
    name: m.user.name,
    role: m.role,
    joinedAt: m.createdAt,
  }));
  recordCounts.members = membersSanitized.length;

  const projects = await prisma.project.findMany({
    where: { organizationId },
  });
  recordCounts.projects = projects.length;

  const sprints = await prisma.sprint.findMany({
    where: { project: { organizationId } },
  });
  recordCounts.sprints = sprints.length;

  const issues = await prisma.issue.findMany({
    where: { project: { organizationId } },
  });
  recordCounts.issues = issues.length;

  const developers = await prisma.developer.findMany({
    where: { organizationId },
  });
  recordCounts.developers = developers.length;

  const assignments = await prisma.projectAssignment.findMany({
    where: { project: { organizationId } },
  });
  recordCounts.projectAssignments = assignments.length;

  const burndownPoints = await prisma.burndownPoint.findMany({
    where: { sprint: { project: { organizationId } } },
  });
  recordCounts.burndownPoints = burndownPoints.length;

  // Audit logs (últimos 12 meses)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
  const auditLogs = await prisma.auditLog.findMany({
    where: { organizationId, createdAt: { gt: twelveMonthsAgo } },
    orderBy: { createdAt: 'desc' },
  });
  recordCounts.auditLogs = auditLogs.length;

  // Manifesto
  const manifest = {
    schema_version: SCHEMA_VERSION,
    organization_id: organizationId,
    organization_name: org.name,
    generated_at: new Date().toISOString(),
    record_counts: recordCounts,
    files: [
      'organization.json',
      'settings.json',
      'members.json',
      'projects.json',
      'sprints.json',
      'issues.json',
      'developers.json',
      'project_assignments.json',
      'burndown_points.json',
      'audit_logs.json',
    ],
    notes: [
      'Tokens e credenciais de integração NÃO estão incluídos neste export.',
      'Apenas máscaras (ex: ****1234) aparecem em settings.json.',
      'Para migrar tokens, reconecte as integrações no sistema de destino.',
    ],
  };

  // README em português
  const readme = `# Export de Dados — ${org.name}

Gerado em: ${manifest.generated_at}
Schema version: ${SCHEMA_VERSION}

## Conteúdo

- \`manifest.json\` — metadata deste export
- \`organization.json\` — dados da organização
- \`settings.json\` — configurações (SEM tokens de integração)
- \`members.json\` — membros da organização
- \`projects.json\` — projetos
- \`sprints.json\` — sprints
- \`issues.json\` — issues sincronizadas
- \`developers.json\` — desenvolvedores e mapeamentos
- \`project_assignments.json\` — atribuições históricas
- \`burndown_points.json\` — pontos de burndown
- \`audit_logs.json\` — logs de auditoria (últimos 12 meses)

## Importante

- Tokens e credenciais NÃO estão incluídos por razões de segurança.
- Ao migrar para outro sistema, você precisará reconectar as integrações.
- Este arquivo foi gerado conforme LGPD Art. 18, V (portabilidade).

## Suporte

Dúvidas sobre o formato: contato@spravio.com.br
`;

  // Criar ZIP em memória
  const chunks: Buffer[] = [];
  const stream = new PassThrough();
  stream.on('data', (chunk) => chunks.push(chunk));

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(stream);

  archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });
  archive.append(readme, { name: 'README.md' });
  archive.append(JSON.stringify(org, replacer, 2), { name: 'organization.json' });
  archive.append(JSON.stringify(settingsSanitized, replacer, 2), { name: 'settings.json' });
  archive.append(JSON.stringify(membersSanitized, replacer, 2), { name: 'members.json' });
  archive.append(JSON.stringify(projects, replacer, 2), { name: 'projects.json' });
  archive.append(JSON.stringify(sprints, replacer, 2), { name: 'sprints.json' });
  archive.append(JSON.stringify(issues, replacer, 2), { name: 'issues.json' });
  archive.append(JSON.stringify(developers, replacer, 2), { name: 'developers.json' });
  archive.append(JSON.stringify(assignments, replacer, 2), { name: 'project_assignments.json' });
  archive.append(JSON.stringify(burndownPoints, replacer, 2), { name: 'burndown_points.json' });
  archive.append(JSON.stringify(auditLogs, replacer, 2), { name: 'audit_logs.json' });

  await archive.finalize();
  await new Promise((resolve) => stream.on('end', resolve));

  return { buffer: Buffer.concat(chunks), recordCounts };
}

// JSON replacer — lida com BigInt (Prisma retorna BigInt em alguns campos)
function replacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString();
  return value;
}

function sanitizeSettingsForExport(
  settings: OrganizationSettings | null,
  crypto: CryptoService,
): unknown {
  if (!settings) return null;

  const clone: Record<string, unknown> = { ...settings };

  // Substituir todos os campos *Ciphertext por máscaras
  for (const key of Object.keys(clone)) {
    if (key.endsWith('Ciphertext') && clone[key]) {
      try {
        const decrypted = crypto.decrypt(clone[key] as string);
        const maskedKey = key.replace('Ciphertext', 'Masked');
        clone[maskedKey] = crypto.mask(decrypted);
      } catch {
        clone[key.replace('Ciphertext', 'Masked')] = '****';
      }
      delete clone[key];
    }
  }

  // Remover IDs internos que não têm sentido fora
  delete clone.id;
  delete clone.encryptionKeyId;

  return clone;
}
```

### 8.3 Download Endpoint

**Localização:** `apps/api/src/modules/data-export/route.ts`

```typescript
app.get<{
  Params: { id: string; exportId: string };
  Querystring: { token: string };
}>(
  '/organizations/:id/exports/:exportId/download',
  async (req, reply) => {
    const { exportId } = req.params;
    const { token } = req.query;

    const dataExport = await prisma.dataExport.findUnique({
      where: { id: exportId },
    });

    if (!dataExport || dataExport.downloadToken !== token) {
      return reply.code(404).send({ error: 'Not found' });
    }

    if (dataExport.status !== 'READY') {
      return reply.code(409).send({ error: 'Export not ready' });
    }

    if (dataExport.downloadExpiresAt && dataExport.downloadExpiresAt < new Date()) {
      return reply.code(410).send({ error: 'Download link expired' });
    }

    // Gerar URL assinada do S3 com TTL curto (5min)
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: dataExport.storageKey! }),
      { expiresIn: 300 },
    );

    // Atualizar contadores + audit
    await prisma.dataExport.update({
      where: { id: exportId },
      data: {
        downloadedAt: new Date(),
        downloadCount: { increment: 1 },
      },
    });

    await auditService.log({
      type: 'data.export_downloaded',
      organizationId: dataExport.organizationId,
      targetResourceType: 'DataExport',
      targetResourceId: exportId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return reply.redirect(302, signedUrl);
  },
);
```

### 8.4 Cleanup Job

**Localização:** `apps/api/src/jobs/export-cleanup.worker.ts`

```typescript
// Roda diariamente: remove ZIPs com mais de 7 dias do S3
export async function cleanupOldExports(prisma: PrismaClient) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const expired = await prisma.dataExport.findMany({
    where: {
      status: 'READY',
      completedAt: { lt: cutoff },
      purgedAt: null,
      storageKey: { not: null },
    },
  });

  for (const exp of expired) {
    try {
      await s3.send(
        new DeleteObjectCommand({ Bucket: BUCKET, Key: exp.storageKey! }),
      );
      await prisma.dataExport.update({
        where: { id: exp.id },
        data: {
          status: 'EXPIRED',
          purgedAt: new Date(),
          storageKey: null,
          downloadToken: null,
        },
      });
    } catch (err) {
      logger.error({ err, exportId: exp.id }, 'export_cleanup_failed');
    }
  }
}
```

---

## 9. UI/UX

### Settings → Privacy & Data tab

```
┌────────────────────────────────────────────────────────┐
│ Seus dados                                             │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Você pode exportar todos os dados da sua organização   │
│ em formato JSON estruturado. Conforme LGPD Art. 18.    │
│                                                        │
│ O arquivo contém: projetos, sprints, issues,           │
│ desenvolvedores, burndown e logs. NÃO inclui tokens.   │
│                                                        │
│ [📦 Exportar meus dados]                               │
│                                                        │
│ Exports recentes:                                      │
│ ┌──────────────────────────────────────────────────┐  │
│ │ 20/04/2026 14:23  ·  42 MB  ·  Pronto            │  │
│ │ [⬇ Baixar]  Expira em: 21/04/2026 14:23          │  │
│ ├──────────────────────────────────────────────────┤  │
│ │ 10/03/2026 09:15  ·  38 MB  ·  Expirado          │  │
│ └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 10. Casos de Borda

| Cenário | Comportamento Esperado |
|---------|----------------------|
| Org com volume imenso (>500MB) | Dividir em partes: `export-part-1.zip`, `export-part-2.zip` |
| Job falha no meio | Retry 3x, depois status FAILED + email de erro |
| User tenta baixar após 24h | 410 Gone com link para solicitar novo |
| User solicita 2 exports seguidos | 429 Too Many Requests |
| Export feito durante deleção pendente | Permitir (cliente pode querer dados antes de apagar) |
| S3 falha | Retry + alerta Sentry |
| Usuário não é mais OWNER quando export fica pronto | Enviar apenas para email no registro, com warning |

---

## 11. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| URL de download vaza e vira pública | Baixa | Alto | Token único + TTL 24h + audit de downloads |
| Token incluído acidentalmente no export | Baixa | Crítico | Teste automatizado que faz grep por "Ciphertext" no ZIP |
| Abuso (export constante para DoS) | Média | Baixo | Rate limit 1/24h + quota por plano |
| ZIP muito grande, stala UI | Média | Baixo | Processamento assíncrono + notificação por email |
| Storage S3 fica caro | Média | Baixo | Cleanup em 7 dias + lifecycle policy S3 |

---

## 12. Fora de Escopo

- Export em CSV (possível no futuro, JSON cobre o caso principal)
- Export de dados de APIs externas (não são nossos, cliente pega direto)
- Migração automática para outro fornecedor (caso de negócio futuro)
- Export contínuo / streaming (webhook push) — overkill para MVP

---

## 13. Dependências

### Dependências de Features
- **026** — Data Retention (entende o lifecycle dos dados)
- **028** — Audit Log (registra solicitações e downloads)

### Dependências Técnicas
- [ ] S3-compatible storage configurado (ou MinIO em dev)
- [ ] `@aws-sdk/client-s3` e `@aws-sdk/s3-request-presigner` instalados
- [ ] `archiver` para criação de ZIP
- [ ] BullMQ + Redis
- [ ] Serviço de e-mail configurado

---

## 14. Definition of Done

- [ ] Model `DataExport` criado com migration
- [ ] Endpoint `POST /organizations/:id/exports` implementado
- [ ] Endpoint `GET /organizations/:id/exports` (lista)
- [ ] Endpoint de download com token
- [ ] Worker BullMQ gera ZIP completo
- [ ] Tokens NUNCA aparecem no ZIP (teste automatizado)
- [ ] Manifesto `manifest.json` + `README.md` incluídos
- [ ] URL de download expira em 24h
- [ ] Rate limit 1 export por org a cada 24h
- [ ] Cleanup job remove ZIPs após 7 dias
- [ ] E-mail ao OWNER quando export fica pronto
- [ ] E-mail de falha se job falhar 3x
- [ ] Audit log registra request e download
- [ ] UI em Settings → Privacy & Data
- [ ] Documentação pública do schema em `/security/data-export-schema`
- [ ] Testes: export completo, sem tokens no ZIP, rate limit, expiração
- [ ] CLAUDE.md atualizado
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings

---

## 15. Estimativa

| Fase | Tempo |
|------|-------|
| Model + migration | 0.5h |
| Export service + rate limit | 1h |
| Worker de geração do ZIP | 2.5h |
| S3 integration + URLs assinadas | 1h |
| Endpoints + download | 1h |
| Cleanup job | 0.5h |
| UI em Settings | 1h |
| Testes (especialmente: sem tokens) | 1h |
| Documentação + schema público | 0.5h |
| **Total** | ~8h |
