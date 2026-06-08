# Feature Specification: Integration Disconnect Flow

> 🟠 ALTA: Fluxo completo ao desconectar integração — revogar token, purgar credenciais, marcar dados relacionados

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature ID** | 027-integration-disconnect-flow |
| **Branch** | `feat/027-integration-disconnect-flow` |
| **Prioridade** | 🟠 Alta |
| **Data** | 2026-04-21 |
| **Status** | Ready for Implementation |
| **LGPD** | Art. 15, Art. 16 |
| **Dependências** | 023 (Token Encryption), 026 (Data Retention) |

---

## 1. Resumo

Hoje, quando um cliente desconecta uma integração (ex: remove Jira do Spravio), o que acontece? Provavelmente nada explícito — os tokens continuam no banco, os dados sincronizados permanecem, e não há revogação na fonte.

Esta spec implementa um **fluxo formal de desconexão**:
1. Revogar token na fonte (quando a API permite)
2. Purgar credenciais criptografadas do banco
3. Soft-delete dos projetos/issues/sprints sincronizados daquela fonte
4. Option: preservar dados para histórico (mas imutáveis) ou purgar tudo
5. Log de auditoria (spec 028)
6. E-mail de confirmação ao OWNER

---

## 2. Motivação

### Problema
- Tokens permanecem no banco após desconexão → risco residual se houver vazamento
- Dados sincronizados ficam como "zumbis" — sem sync, desatualizados, mas persistentes
- Usuário não tem clareza do que acontece ao desconectar
- Viola princípio de minimização da LGPD (Art. 6º III)

### Impacto
- **Compliance**: cliente espera que desconectar = dados removidos
- **Confiança**: processo opaco mina credibilidade
- **Segurança**: credenciais ativas sem uso = risco desnecessário

### Métricas de Sucesso
- [ ] Desconexão purga 100% dos tokens relacionados
- [ ] Revogação na fonte funciona para Jira, GitHub, Slack, GitLab (APIs suportam)
- [ ] Cliente escolhe: "preservar histórico" ou "purgar tudo"
- [ ] E-mail de confirmação sempre enviado ao OWNER

---

## 3. User Stories

### Story 1: Desconectar Jira preservando histórico
**Como** gerente de projeto
**Eu quero** desconectar o Jira mas manter os dados históricos
**Para que** eu possa revisar projetos passados sem ter Jira ativo

#### Critérios de Aceite
- [ ] Opção "Preservar histórico (somente leitura)" disponível
- [ ] Tokens removidos do banco
- [ ] Dados sincronizados ficam marcados como `readOnly: true`
- [ ] Sync automático para aquela integração é desativado
- [ ] UI mostra banner "Desconectado — dados históricos preservados"

### Story 2: Desconectar e purgar tudo
**Como** cliente cancelando o uso de uma ferramenta
**Eu quero** desconectar e remover todos os dados sincronizados
**Para que** não fique histórico vinculado à integração

#### Critérios de Aceite
- [ ] Opção "Desconectar e apagar dados" disponível com warning
- [ ] Confirmação textual (digitar nome da fonte) obrigatória
- [ ] Soft delete imediato de projetos/issues/sprints daquela fonte
- [ ] Hard delete em 30 dias (usa spec 026)
- [ ] E-mail de confirmação

### Story 3: Revogação na fonte quando possível
**Como** operador preocupado com segurança
**Eu quero** que o Spravio revogue o token na fonte também
**Para que** o token antigo fique inútil mesmo se vazar de outro lugar

#### Critérios de Aceite
- [ ] Para Jira: chamar API de revogação de token (se disponível)
- [ ] Para GitHub: deletar OAuth app authorization via API
- [ ] Para Slack: `auth.revoke` endpoint
- [ ] Se revogação falha, log + aviso ao user (mas não bloqueia desconexão local)

---

## 4. Requisitos Funcionais

### 4.1 Fluxo de Desconexão
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-01 | Endpoint `DELETE /organizations/:id/integrations/:source` | Must Have |
| RF-02 | Query param `mode=preserve` ou `mode=purge` | Must Have |
| RF-03 | Modo `purge` requer confirmação textual no body | Must Have |
| RF-04 | Somente OWNER pode desconectar | Must Have |
| RF-05 | Operação é transacional — falha total ou total | Must Have |

### 4.2 Revogação na Fonte
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-06 | Jira: `DELETE /rest/api/3/mypermissions` ou similar | Should Have |
| RF-07 | GitHub OAuth: `DELETE /applications/:client_id/grant` | Should Have |
| RF-08 | Slack: `POST auth.revoke` | Should Have |
| RF-09 | GitLab: `POST /oauth/revoke` | Should Have |
| RF-10 | Azure DevOps PAT: documentar manualmente (não revogável via API) | Should Have |
| RF-11 | Falha de revogação não bloqueia desconexão local | Must Have |

### 4.3 Tratamento de Dados
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-12 | Modo `preserve`: dados mantidos com flag `readOnly`, sync desativado | Must Have |
| RF-13 | Modo `purge`: soft delete cascata (usa spec 026) | Must Have |
| RF-14 | Tokens criptografados do model `OrganizationSettings` são zerados | Must Have |
| RF-15 | Configs de webhook (Teams, Slack) zeradas | Must Have |
| RF-16 | BullMQ jobs pendentes para aquela integração cancelados | Must Have |

### 4.4 Comunicação
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-17 | E-mail ao OWNER com resumo da operação | Must Have |
| RF-18 | Resumo: fonte desconectada, modo, contagem de registros afetados | Must Have |
| RF-19 | Audit log registra operação (spec 028) | Must Have |

---

## 5. Requisitos Não-Funcionais

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-01 | Duração da desconexão | < 5s para `preserve`, < 30s para `purge` |
| RNF-02 | Transacional | Rollback completo se qualquer passo falhar |
| RNF-03 | Retry de revogação | 3 tentativas exponenciais antes de falhar |
| RNF-04 | Idempotência | Desconectar duas vezes não erra |

---

## 6. API Design

### Novos Endpoints

#### `DELETE /organizations/:id/integrations/:source`
**Auth**: OWNER apenas

**Path Params**:
- `source`: `jira | github | azure | gitlab | slack | teams | tempo | clockify | trello | clickup | linear | asana | monday`

**Query Params**:
- `mode`: `preserve` (default) | `purge`

**Request Body** (para modo `purge`):
```typescript
{
  confirmation: string;  // Deve ser exatamente o nome da source (ex: "jira")
}
```

**Response 200**:
```typescript
{
  source: string;
  mode: 'preserve' | 'purge';
  tokenRevokedAtSource: boolean;
  recordsAffected: {
    projects: number;
    issues: number;
    sprints: number;
    developers: number;
  };
  dataScheduledForHardDeleteAt?: string; // só se mode=purge
}
```

**Errors**:
| Code | Descrição |
|------|-----------|
| 400 | Confirmação textual incorreta no modo purge |
| 401 | Não autenticado |
| 403 | Não é OWNER |
| 404 | Integração não está conectada |
| 409 | Operação já em andamento |
| 502 | Falha em revogar na fonte (operação local prossegue) |

#### `GET /organizations/:id/integrations`

**Response 200**:
```typescript
{
  integrations: Array<{
    source: string;
    status: 'active' | 'disconnected' | 'readonly';
    connectedAt: string;
    lastSyncedAt: string | null;
    disconnectedAt: string | null;
    tokenMasked: string | null; // spec 023
  }>;
}
```

---

## 7. Data Model

### Alterações

```prisma
model Project {
  // Novos campos
  isReadOnly      Boolean   @default(false)
  syncDisabledAt  DateTime?
}

model OrganizationSettings {
  // Já tem fields de token (spec 023)
  // Novos metadados de conexão:
  jiraConnectedAt    DateTime?
  jiraDisconnectedAt DateTime?
  jiraLastSyncedAt   DateTime?
  // repetir para github, azure, gitlab...
}
```

### Novo Model

```prisma
model IntegrationDisconnectLog {
  id              String   @id @default(cuid())
  organizationId  String
  source          String
  mode            String   // 'preserve' | 'purge'
  requestedBy     String
  requestedAt     DateTime @default(now())
  completedAt     DateTime?
  tokenRevokedAtSource Boolean @default(false)
  revocationError String?
  recordsAffected Json     // { projects: 5, issues: 200, ... }

  @@index([organizationId])
}
```

---

## 8. Implementação

### 8.1 Revogação por Fonte

**Localização:** `apps/api/src/integrations/_shared/revocation.ts`

```typescript
export interface TokenRevoker {
  revoke(token: string, meta?: Record<string, unknown>): Promise<void>;
}

export class JiraRevoker implements TokenRevoker {
  async revoke(token: string): Promise<void> {
    // Jira PAT não tem endpoint de revogação via API (2026)
    // Documentar que o usuário deve revogar manualmente
    throw new Error('JIRA_MANUAL_REVOCATION_REQUIRED');
  }
}

export class GitHubRevoker implements TokenRevoker {
  async revoke(token: string, meta?: { clientId?: string }): Promise<void> {
    if (!meta?.clientId) throw new Error('clientId required');
    const response = await fetch(
      `https://api.github.com/applications/${meta.clientId}/grant`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${Buffer.from(`${meta.clientId}:${process.env.GITHUB_CLIENT_SECRET}`).toString('base64')}`,
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({ access_token: token }),
      },
    );
    if (!response.ok) throw new Error(`GitHub revocation failed: ${response.status}`);
  }
}

export class SlackRevoker implements TokenRevoker {
  async revoke(token: string): Promise<void> {
    const response = await fetch('https://slack.com/api/auth.revoke', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'test=false',
    });
    const data = await response.json();
    if (!data.ok) throw new Error(`Slack revocation failed: ${data.error}`);
  }
}

export class GitLabRevoker implements TokenRevoker {
  async revoke(token: string): Promise<void> {
    const response = await fetch('https://gitlab.com/oauth/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token,
        client_id: process.env.GITLAB_CLIENT_ID!,
        client_secret: process.env.GITLAB_CLIENT_SECRET!,
      }),
    });
    if (!response.ok) throw new Error(`GitLab revocation failed: ${response.status}`);
  }
}

// Factory
export function getRevoker(source: string): TokenRevoker {
  switch (source) {
    case 'jira': return new JiraRevoker();
    case 'github': return new GitHubRevoker();
    case 'slack': return new SlackRevoker();
    case 'gitlab': return new GitLabRevoker();
    // Fontes sem revogação via API (PAT manual)
    default: return new NoOpRevoker();
  }
}
```

### 8.2 Disconnect Service

**Localização:** `apps/api/src/modules/integrations/disconnect.service.ts`

```typescript
export class IntegrationDisconnectService {
  constructor(
    private prisma: PrismaClient,
    private crypto: CryptoService,
    private emailService: EmailService,
  ) {}

  async disconnect(
    organizationId: string,
    source: IntegrationSource,
    mode: 'preserve' | 'purge',
    requestedBy: string,
  ): Promise<DisconnectResult> {
    // 1. Buscar token atual
    const settings = await this.prisma.organizationSettings.findUnique({
      where: { organizationId },
    });

    const ciphertextField = `${source}TokenCiphertext` as keyof typeof settings;
    const ciphertext = settings?.[ciphertextField] as string | null;

    if (!ciphertext) {
      throw new HttpError(404, 'Integration not connected');
    }

    // 2. Tentar revogar na fonte
    let tokenRevokedAtSource = false;
    let revocationError: string | undefined;
    try {
      const token = this.crypto.decrypt(ciphertext);
      const revoker = getRevoker(source);
      await revoker.revoke(token);
      tokenRevokedAtSource = true;
    } catch (err) {
      revocationError = (err as Error).message;
      logger.warn({ source, error: revocationError }, 'source_revocation_failed');
    }

    // 3. Transação local
    const counts = await this.prisma.$transaction(async (tx) => {
      // Zerar tokens
      await tx.organizationSettings.update({
        where: { organizationId },
        data: {
          [ciphertextField]: null,
          [`${source}DisconnectedAt`]: new Date(),
        },
      });

      // Buscar projetos daquela fonte
      const projects = await tx.project.findMany({
        where: { organizationId, source },
        select: { id: true },
      });

      const projectIds = projects.map((p) => p.id);

      if (mode === 'preserve') {
        // Marcar readonly
        await tx.project.updateMany({
          where: { id: { in: projectIds } },
          data: { isReadOnly: true, syncDisabledAt: new Date() },
        });
        return {
          projects: projects.length,
          issues: 0,
          sprints: 0,
          developers: 0,
        };
      } else {
        // Soft delete (hard delete em 30d via spec 026)
        const now = new Date();
        const issues = await tx.issue.updateMany({
          where: { projectId: { in: projectIds } },
          data: { deletedAt: now },
        });
        const sprints = await tx.sprint.updateMany({
          where: { projectId: { in: projectIds } },
          data: { deletedAt: now },
        });
        const projectsDel = await tx.project.updateMany({
          where: { id: { in: projectIds } },
          data: { deletedAt: now },
        });
        // Developers daquela fonte
        const devs = await tx.developer.updateMany({
          where: { organizationId, [`${source}UserId`]: { not: null } },
          data: { deletedAt: now },
        });
        return {
          projects: projectsDel.count,
          issues: issues.count,
          sprints: sprints.count,
          developers: devs.count,
        };
      }
    });

    // 4. Log
    await this.prisma.integrationDisconnectLog.create({
      data: {
        organizationId,
        source,
        mode,
        requestedBy,
        completedAt: new Date(),
        tokenRevokedAtSource,
        revocationError,
        recordsAffected: counts,
      },
    });

    // 5. Cancelar jobs pendentes
    await this.cancelPendingJobs(organizationId, source);

    // 6. E-mail
    await this.sendDisconnectEmail(organizationId, source, mode, counts);

    return {
      source,
      mode,
      tokenRevokedAtSource,
      recordsAffected: counts,
      dataScheduledForHardDeleteAt:
        mode === 'purge'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
    };
  }

  private async cancelPendingJobs(organizationId: string, source: string) {
    const queues = ['sync-issues', 'sync-sprints', 'webhook-processor'];
    for (const queueName of queues) {
      const queue = new Queue(queueName, {
        connection: { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT!) },
      });
      const jobs = await queue.getJobs(['waiting', 'delayed']);
      for (const job of jobs) {
        if (job.data.organizationId === organizationId && job.data.source === source) {
          await job.remove();
        }
      }
    }
  }
}
```

### 8.3 Route Handler

**Localização:** `apps/api/src/modules/integrations/route.ts`

```typescript
app.delete<{
  Params: { id: string; source: IntegrationSource };
  Querystring: { mode?: 'preserve' | 'purge' };
  Body: { confirmation?: string };
}>(
  '/organizations/:id/integrations/:source',
  { preHandler: [authGuard, tenantGuard, requireRole('OWNER')] },
  async (req, reply) => {
    const { id, source } = req.params;
    const mode = req.query.mode ?? 'preserve';

    if (id !== req.organizationId) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    if (mode === 'purge' && req.body?.confirmation !== source) {
      return reply.code(400).send({
        error: 'Confirmation required',
        message: `Body must contain { confirmation: "${source}" } to purge data`,
      });
    }

    const result = await disconnectService.disconnect(
      id,
      source,
      mode,
      req.userId!,
    );

    return reply.code(200).send(result);
  },
);
```

---

## 9. UI/UX

### Componentes Necessários
- [ ] `DisconnectIntegrationModal` — com escolha de modo e confirmação textual
- [ ] `IntegrationCard` — mostra status (active/readonly/disconnected) + botão desconectar
- [ ] `DisconnectConfirmation` — warning visual sobre consequências

### Fluxo UI
```
Settings → Integrations tab
  │
  ▼
[Jira] (Connected • Last synced 5min ago) [⚙️] [Disconnect]
  │
  ▼ (click Disconnect)
  │
  ┌─────────────────────────────────────┐
  │ Desconectar Jira                    │
  │                                     │
  │ ○ Preservar histórico (recomendado) │
  │   Dados ficam em modo somente       │
  │   leitura. Sync é desativado.       │
  │                                     │
  │ ○ Apagar todos os dados do Jira     │
  │   Projetos, issues e sprints serão  │
  │   removidos em 30 dias.             │
  │                                     │
  │   [Digite "jira" para confirmar]    │
  │   _________________                 │
  │                                     │
  │ [Cancelar] [Desconectar]            │
  └─────────────────────────────────────┘
```

---

## 10. Casos de Borda

| Cenário | Comportamento Esperado |
|---------|----------------------|
| Token já expirou na fonte | Revogação falha silenciosamente, operação local prossegue |
| Reconectar após desconectar com preserve | Sync reativado, dados existentes não duplicam |
| Reconectar após desconectar com purge | Setup do zero, dados antigos não voltam |
| Desconexão durante sync em andamento | Sync aborta na próxima verificação de token |
| Dois OWNERs clicam simultâneo | Segundo recebe 409 Conflict |
| Integração nunca foi conectada | 404 Not Found |

---

## 11. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Purge acidental por OWNER | Média | Alto | Confirmação textual + e-mail + janela 30d |
| Revogação falha em massa | Baixa | Médio | Timeout + retry + não bloqueia local |
| Jobs BullMQ não cancelados | Média | Médio | Sweep de jobs + verificação no worker |
| Dados órfãos após desconexão | Média | Médio | Testes de integridade + cleanup job |

---

## 12. Fora de Escopo

- Export antes de desconectar (cobertura pela spec 030)
- Reconexão automática (requer fluxo específico)
- Desconexão parcial (só um projeto de N) — todos projetos da source juntos
- Revogação de tokens OAuth individuais — model atual usa credencial da org

---

## 13. Dependências

### Dependências de Features
- **023** — Token Encryption (decrypt antes de revogar)
- **026** — Data Retention (mode purge usa soft delete)

### Dependências Técnicas
- [ ] Rotas e permissões OWNER funcionando
- [ ] BullMQ com acesso a remover jobs

---

## 14. Definition of Done

- [ ] Endpoint DELETE /organizations/:id/integrations/:source implementado
- [ ] Modos `preserve` e `purge` funcionam
- [ ] Confirmação textual obrigatória no modo purge
- [ ] Revokers implementados para GitHub, Slack, GitLab
- [ ] Documentação para fontes que não suportam revogação API
- [ ] Jobs BullMQ pendentes cancelados
- [ ] E-mail de confirmação ao OWNER
- [ ] Audit log (via spec 028 se já implementada, stub caso contrário)
- [ ] UI `DisconnectIntegrationModal` funcional
- [ ] Testes: `preserve` mantém dados com readonly
- [ ] Testes: `purge` soft-deleta e agenda hard delete
- [ ] Testes: falha de revogação não bloqueia operação local
- [ ] Documentação em `docs/security/integration-disconnect.md`
- [ ] CLAUDE.md atualizado
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings

---

## 15. Estimativa

| Fase | Tempo |
|------|-------|
| Revokers (Jira, GitHub, Slack, GitLab) | 2h |
| DisconnectService | 2h |
| Route + validação | 1h |
| UI modal + integração | 2h |
| Testes end-to-end | 1h |
| **Total** | ~8h |
