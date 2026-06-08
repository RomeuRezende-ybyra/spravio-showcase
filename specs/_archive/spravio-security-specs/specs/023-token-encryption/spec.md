# Feature Specification: Token Encryption at Rest

> 🔴 CRÍTICA: Criptografar tokens de integração armazenados no banco com AES-256-GCM

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature ID** | 023-token-encryption |
| **Branch** | `feat/023-token-encryption` |
| **Prioridade** | 🔴 Crítica |
| **Data** | 2026-04-21 |
| **Status** | Ready for Implementation |
| **LGPD** | Art. 6º VII, Art. 46 |

---

## 1. Resumo

Atualmente, os tokens/credenciais das 14 integrações (Jira PAT, GitHub Token, Azure PAT, Slack Bot Token, Teams Webhook URL, Tempo Token, Clockify API Key, GitLab Token, Trello Key+Token, ClickUp Token, Linear Key, Asana Token, Monday Token) estão armazenados em **texto puro** nos models `OrganizationSettings`, `TeamsConfig`, `TempoConfig`, `ClockifyConfig` etc.

Esta spec implementa criptografia simétrica **AES-256-GCM** em repouso, com chave mestra derivada de variável de ambiente separada do banco, garantindo que um dump do banco não exponha credenciais dos clientes.

---

## 2. Motivação

### Problema
- Tokens de integração em texto puro no PostgreSQL
- Backup do banco = vazamento completo de acesso a Jira, GitHub, Azure etc. dos clientes
- Um token Jira PAT dá acesso total a todos os projetos do cliente
- Bot token do Slack pode ler mensagens do workspace inteiro
- Viola Art. 46 da LGPD (medidas técnicas de segurança)

### Impacto
- **Risco de reputação**: um incidente compromete não só dados do Spravio, mas acessos a sistemas de TODOS os clientes
- **Risco jurídico**: responsabilização solidária por vazamento de dados pessoais nos sistemas conectados
- **Bloqueio comercial**: clientes enterprise não aceitam sem criptografia em repouso

### Métricas de Sucesso
- [ ] 100% dos tokens de integração criptografados em repouso
- [ ] Dump do banco não expõe nenhum token legível
- [ ] Chave mestra rotacionável sem downtime
- [ ] Performance de decrypt < 5ms por token

---

## 3. User Stories

### Story 1: Armazenamento seguro ao configurar integração
**Como** gerente de agência configurando o Spravio
**Eu quero** ter certeza de que meus tokens de acesso não ficam visíveis no banco
**Para que** um eventual vazamento não comprometa meus sistemas externos

#### Critérios de Aceite
- [ ] Ao salvar token via UI, ele é criptografado antes de persistir
- [ ] Visualizando o banco diretamente, o campo mostra ciphertext (base64), não o token
- [ ] Campo de token na UI mostra máscara (`****1234`) após salvar

### Story 2: Uso transparente em jobs/sync
**Como** desenvolvedor do Spravio
**Eu quero** usar os tokens em chamadas às APIs externas
**Para que** integrações funcionem sem expor a lógica de criptografia

#### Critérios de Aceite
- [ ] Helper `decryptToken(ciphertext)` disponível nos services
- [ ] Integration clients (`JiraClient`, `GitHubClient` etc.) recebem token já decifrado
- [ ] Zero mudanças nas chamadas existentes aos clients

### Story 3: Rotação de chave mestra
**Como** administrador de segurança do Spravio
**Eu quero** poder rotacionar a chave mestra de criptografia
**Para que** posso responder a um comprometimento sem vazar tokens antigos

#### Critérios de Aceite
- [ ] Script/CLI para rotação: lê com chave antiga, grava com chave nova
- [ ] Suporte a múltiplas chaves ativas via versionamento (`kid`)
- [ ] Rollback possível se rotação falhar

---

## 4. Requisitos Funcionais

### 4.1 Criptografia
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-01 | Algoritmo AES-256-GCM (authenticated encryption) | Must Have |
| RF-02 | IV (nonce) único de 12 bytes por operação | Must Have |
| RF-03 | Auth tag de 16 bytes validado no decrypt | Must Have |
| RF-04 | Formato do ciphertext: `v1:{kid}:{iv_b64}:{tag_b64}:{ciphertext_b64}` | Must Have |
| RF-05 | Key Derivation Function (HKDF-SHA256) a partir de `ENCRYPTION_MASTER_KEY` | Must Have |
| RF-06 | Suporte a múltiplas chaves ativas (key rotation) | Should Have |

### 4.2 Migração de Dados Existentes
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-07 | Script de migração criptografa tokens existentes | Must Have |
| RF-08 | Migração idempotente (detecta se já está criptografado) | Must Have |
| RF-09 | Rollback possível se migração falhar | Must Have |

### 4.3 Uso em Runtime
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-10 | Service `CryptoService` com `encrypt()` e `decrypt()` | Must Have |
| RF-11 | Repository decripta automaticamente ao ler credenciais | Must Have |
| RF-12 | Repository criptografa automaticamente ao gravar | Must Have |
| RF-13 | Máscara `****{últimos 4 chars}` retornada em responses da API | Must Have |

---

## 5. Requisitos Não-Funcionais

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-01 | Performance encrypt | < 2ms p95 |
| RNF-02 | Performance decrypt | < 2ms p95 |
| RNF-03 | Segurança da chave | Nunca logada, nunca no código |
| RNF-04 | Entropia do IV | crypto.randomBytes (CSPRNG) |
| RNF-05 | Disponibilidade | Zero downtime na migração |

---

## 6. API Design

### Endpoints Afetados

#### `PUT /organizations/:id/settings/integrations/:source`
**Auth**: OWNER ou PM

**Request** (sem mudança externa):
```typescript
{
  apiToken: string;  // Token em texto puro, enviado via HTTPS
  baseUrl?: string;
}
```

**Response 200**:
```typescript
{
  source: string;
  baseUrl: string;
  apiTokenMasked: string;  // "****a1b2" — apenas últimos 4 chars
  updatedAt: string;
}
```

**Comportamento interno**:
- Backend criptografa `apiToken` com `CryptoService.encrypt()`
- Grava ciphertext no banco
- Retorna apenas máscara, nunca o token completo

**Errors**:
| Code | Descrição |
|------|-----------|
| 400 | Token inválido ou vazio |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 500 | Erro de criptografia (chave indisponível) |

---

## 7. Data Model

### Alterações em Models Existentes

```prisma
model OrganizationSettings {
  // ANTES (texto puro):
  // jiraApiToken    String?
  // githubToken     String?
  // azurePat        String?

  // DEPOIS (ciphertext):
  jiraApiTokenCiphertext    String?   @db.Text
  githubTokenCiphertext     String?   @db.Text
  azurePatCiphertext        String?   @db.Text
  gitlabTokenCiphertext     String?   @db.Text
  asanaTokenCiphertext      String?   @db.Text
  mondayTokenCiphertext     String?   @db.Text
  linearKeyCiphertext       String?   @db.Text
  clickupTokenCiphertext    String?   @db.Text
  trelloKeyCiphertext       String?   @db.Text
  trelloTokenCiphertext     String?   @db.Text
  slackBotTokenCiphertext   String?   @db.Text

  // Metadados (não sensíveis):
  encryptionKeyId           String?   // "v1" — identificador da chave usada
  migratedToEncryption      Boolean   @default(false)
}

model TeamsConfig {
  webhookUrlCiphertext      String    @db.Text
  encryptionKeyId           String?
}

model TempoConfig {
  apiTokenCiphertext        String    @db.Text
  encryptionKeyId           String?
}

model ClockifyConfig {
  apiKeyCiphertext          String    @db.Text
  workspaceId               String    // não sensível
  encryptionKeyId           String?
}
```

### Novo Model: Controle de Chaves

```prisma
model EncryptionKey {
  id            String   @id  // "v1", "v2" etc.
  status        KeyStatus
  createdAt     DateTime @default(now())
  retiredAt     DateTime?

  @@map("encryption_keys")
}

enum KeyStatus {
  ACTIVE        // Usada para encrypt + decrypt
  DECRYPT_ONLY  // Só decrypt (durante rotação)
  RETIRED       // Não mais usada (após migração completa)
}
```

---

## 8. Implementação

### 8.1 CryptoService

**Localização:** `apps/api/src/shared/crypto/crypto.service.ts`

```typescript
import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export class CryptoService {
  private keys: Map<string, Buffer> = new Map();
  private activeKeyId: string;

  constructor() {
    // Carrega chaves de env vars
    // ENCRYPTION_MASTER_KEY_V1=base64(32 bytes)
    // ENCRYPTION_MASTER_KEY_V2=base64(32 bytes) [opcional durante rotação]
    // ENCRYPTION_ACTIVE_KEY=v1
    this.loadKeys();
  }

  private loadKeys(): void {
    const activeId = process.env.ENCRYPTION_ACTIVE_KEY;
    if (!activeId) {
      throw new Error('ENCRYPTION_ACTIVE_KEY not configured');
    }
    this.activeKeyId = activeId;

    // Carrega todas as chaves disponíveis (V1, V2, ...)
    for (const [envKey, envVal] of Object.entries(process.env)) {
      const match = envKey.match(/^ENCRYPTION_MASTER_KEY_(v\d+)$/i);
      if (match && envVal) {
        const keyId = match[1].toLowerCase();
        const keyBytes = Buffer.from(envVal, 'base64');
        if (keyBytes.length !== KEY_LENGTH) {
          throw new Error(`Key ${keyId} must be 32 bytes (base64)`);
        }
        this.keys.set(keyId, this.deriveKey(keyBytes, keyId));
      }
    }

    if (!this.keys.has(this.activeKeyId)) {
      throw new Error(`Active key ${this.activeKeyId} not found in env`);
    }
  }

  private deriveKey(masterKey: Buffer, keyId: string): Buffer {
    // HKDF para derivar chave específica por contexto
    return crypto.hkdfSync(
      'sha256',
      masterKey,
      Buffer.from(keyId),
      Buffer.from('spravio-token-encryption-v1'),
      KEY_LENGTH
    ) as Buffer;
  }

  encrypt(plaintext: string): string {
    if (!plaintext) throw new Error('Plaintext required');

    const key = this.keys.get(this.activeKeyId)!;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // Formato: v1:{kid}:{iv_b64}:{tag_b64}:{ciphertext_b64}
    return [
      'v1',
      this.activeKeyId,
      iv.toString('base64'),
      authTag.toString('base64'),
      ciphertext.toString('base64'),
    ].join(':');
  }

  decrypt(encoded: string): string {
    if (!encoded) throw new Error('Ciphertext required');

    const parts = encoded.split(':');
    if (parts.length !== 5 || parts[0] !== 'v1') {
      throw new Error('Invalid ciphertext format');
    }

    const [, keyId, ivB64, tagB64, ctB64] = parts;
    const key = this.keys.get(keyId);
    if (!key) {
      throw new Error(`Key ${keyId} not available`);
    }

    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(tagB64, 'base64');
    const ciphertext = Buffer.from(ctB64, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return plaintext.toString('utf8');
  }

  mask(plaintext: string): string {
    if (!plaintext || plaintext.length < 4) return '****';
    return `****${plaintext.slice(-4)}`;
  }
}
```

### 8.2 Integration Credentials Repository

**Localização:** `apps/api/src/modules/organization-settings/repository.ts`

```typescript
async updateIntegrationToken(
  orgId: string,
  source: IntegrationSource,
  plainToken: string,
): Promise<void> {
  const ciphertext = this.crypto.encrypt(plainToken);
  const fieldMap = {
    jira: 'jiraApiTokenCiphertext',
    github: 'githubTokenCiphertext',
    azure: 'azurePatCiphertext',
    // ... outros
  };
  await this.prisma.organizationSettings.update({
    where: { organizationId: orgId },
    data: {
      [fieldMap[source]]: ciphertext,
      encryptionKeyId: this.crypto.activeKeyId,
      migratedToEncryption: true,
    },
  });
}

async getDecryptedToken(
  orgId: string,
  source: IntegrationSource,
): Promise<string | null> {
  const settings = await this.prisma.organizationSettings.findUnique({
    where: { organizationId: orgId },
  });
  if (!settings) return null;

  const ciphertext = settings[`${source}TokenCiphertext`];
  if (!ciphertext) return null;

  return this.crypto.decrypt(ciphertext);
}
```

### 8.3 Geração da Chave Mestra

```bash
# Gerar chave de 32 bytes em base64
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Exemplo de saída:
# <REDACTED_EXAMPLE_KEY_base64_32_bytes>

# Adicionar ao .env:
# ENCRYPTION_MASTER_KEY_V1=<REDACTED_EXAMPLE_KEY_base64_32_bytes>
# ENCRYPTION_ACTIVE_KEY=v1
```

### 8.4 Script de Migração

**Localização:** `apps/api/scripts/migrate-tokens-to-encrypted.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { CryptoService } from '../src/shared/crypto/crypto.service';

async function migrate() {
  const prisma = new PrismaClient();
  const crypto = new CryptoService();

  const allSettings = await prisma.organizationSettings.findMany({
    where: { migratedToEncryption: false },
  });

  console.log(`Migrating ${allSettings.length} orgs...`);

  for (const settings of allSettings) {
    const updates: Record<string, string | boolean | null> = {
      migratedToEncryption: true,
      encryptionKeyId: 'v1',
    };

    // Para cada campo plaintext, criptografa e move para *_Ciphertext
    if (settings.jiraApiToken) {
      updates.jiraApiTokenCiphertext = crypto.encrypt(settings.jiraApiToken);
      updates.jiraApiToken = null; // Limpar plaintext
    }
    // ... repetir para cada integração

    await prisma.organizationSettings.update({
      where: { id: settings.id },
      data: updates,
    });
    console.log(`✓ Migrated org ${settings.organizationId}`);
  }

  console.log('Migration complete!');
}

migrate().catch(console.error);
```

---

## 9. Fluxo de Rotação de Chave

```
1. Gerar nova chave V2:
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

2. Adicionar ao env:
   ENCRYPTION_MASTER_KEY_V2=<nova chave>
   ENCRYPTION_ACTIVE_KEY=v1  # ainda na V1

3. Deploy — serviço agora conhece V1 e V2, mas criptografa com V1

4. Mudar env:
   ENCRYPTION_ACTIVE_KEY=v2

5. Deploy — serviço agora criptografa com V2, mas descriptografa V1 e V2

6. Rodar script de re-encrypt:
   pnpm --filter api script:reencrypt-tokens

7. Após 100% migrado:
   Remover ENCRYPTION_MASTER_KEY_V1 do env
   Deploy
```

---

## 10. Casos de Borda

| Cenário | Comportamento Esperado |
|---------|----------------------|
| Chave mestra ausente no boot | Aplicação falha ao iniciar (fail-fast) |
| Ciphertext corrompido | Retorna null + log error + alerta Sentry |
| Auth tag inválido | Decrypt falha — possível tampering, log crítico |
| Key ID desconhecido no ciphertext | Erro explícito "Key not available" |
| Token vazio no encrypt | Erro de validação 400 |
| Rotação interrompida no meio | Script é idempotente, pode re-rodar |

---

## 11. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Chave mestra vaza (commit, log) | Baixa | Crítico | `.env` no gitignore, redact em logs (spec 024), pre-commit hook |
| Perda da chave mestra | Baixa | Crítico | Backup offline em cofre físico, key escrow |
| Migração falha parcialmente | Média | Alto | Script idempotente, transações por org, rollback documentado |
| Performance degradada | Baixa | Médio | Benchmark em staging, cache de tokens decifrados com TTL curto |
| Dev copia token de prod | Média | Alto | Chaves diferentes por ambiente, audit log (spec 028) |

---

## 12. Fora de Escopo

Explicitamente NÃO será implementado nesta feature:
- Integração com KMS externo (AWS KMS, Vault) — futuro, após validar AES local
- Hardware Security Module (HSM) — enterprise tier
- Criptografia de outros campos (issue titles, PR bodies) — spec separada se necessário
- 2FA para acesso admin — spec separada
- Client-side encryption — overkill para o modelo atual

---

## 13. Dependências

### Dependências de Features
- Nenhuma — esta é a primeira spec de segurança e não depende de outras

### Dependências Técnicas
- [ ] Node.js crypto module (nativo, sem lib externa)
- [ ] Variáveis de ambiente configuradas em todos os ambientes
- [ ] Backup do banco antes da migração

---

## 14. Definition of Done

- [ ] `CryptoService` implementado com encrypt/decrypt/mask
- [ ] Testes unitários: encrypt → decrypt round-trip, IV único, auth tag validação
- [ ] Testes unitários: rotação de chave (V1 → V2)
- [ ] Schema Prisma atualizado com campos `*Ciphertext` e `encryptionKeyId`
- [ ] Migration formal criada em `prisma/migrations/`
- [ ] Repository atualizado para criptografar no write e decifrar no read
- [ ] Integration clients continuam funcionando sem mudança
- [ ] API retorna apenas máscara (`****1234`) em responses
- [ ] Script de migração testado em staging
- [ ] Script de migração executado em produção
- [ ] Chave mestra configurada em `.env.local`, staging e produção
- [ ] Chave mestra **nunca** commitada no git
- [ ] `.env.example` atualizado com placeholders
- [ ] Documentação de rotação em `docs/security/key-rotation.md`
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings
- [ ] CLAUDE.md atualizado com seção de segurança

---

## 15. Estimativa

| Fase | Tempo |
|------|-------|
| Implementar `CryptoService` + testes | 2h |
| Atualizar schema Prisma + migration | 1h |
| Atualizar repositories (encrypt/decrypt automático) | 2h |
| Script de migração + teste em staging | 1.5h |
| Atualizar API responses (máscaras) | 0.5h |
| Documentação + `docs/security/` | 1h |
| **Total** | ~8h |
