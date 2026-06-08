# Implementação de Criptografia de Tokens no Banco de Dados

## Problema
Atualmente, tokens sensíveis (Jira, Azure, GitHub, Slack, etc.) são armazenados em **plaintext** no PostgreSQL, apesar do comentário `// encrypted at rest` no schema.

## Solução Recomendada: Criptografia em Nível de Aplicação

Vamos usar **AES-256-GCM** (Galois/Counter Mode) para criptografar tokens antes de salvar no banco.

---

## Passo 1: Criar Módulo de Criptografia

Crie o arquivo `apps/api/src/lib/crypto.ts`:

```typescript
import crypto from 'node:crypto'
import { env } from '../config/env.js'

// Algoritmo de criptografia
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // Initialization Vector
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 64

/**
 * Deriva uma chave de criptografia a partir do secret
 * Usa PBKDF2 para tornar brute-force mais difícil
 */
function deriveKey(secret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    secret,
    salt,
    100000, // 100k iterações
    32,     // 32 bytes = 256 bits
    'sha512'
  )
}

/**
 * Encripta um valor usando AES-256-GCM
 * Formato de saída: salt:iv:authTag:encryptedData (tudo em base64)
 */
export function encrypt(plaintext: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH)
  const key = deriveKey(env.ENCRYPTION_KEY, salt)
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  // Formato: salt:iv:authTag:encryptedData
  return [
    salt.toString('base64'),
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':')
}

/**
 * Decripta um valor criptografado com encrypt()
 */
export function decrypt(ciphertext: string): string {
  const [saltB64, ivB64, authTagB64, encryptedB64] = ciphertext.split(':')

  if (!saltB64 || !ivB64 || !authTagB64 || !encryptedB64) {
    throw new Error('Invalid encrypted format')
  }

  const salt = Buffer.from(saltB64, 'base64')
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(authTagB64, 'base64')
  const encrypted = Buffer.from(encryptedB64, 'base64')

  const key = deriveKey(env.ENCRYPTION_KEY, salt)

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

/**
 * Verifica se um valor está criptografado
 */
export function isEncrypted(value: string): boolean {
  return value.includes(':') && value.split(':').length === 4
}
```

---

## Passo 2: Adicionar ENCRYPTION_KEY ao .env

**apps/api/.env** e **.env.example**:
```bash
# ─── Encryption ─────────────────────────────────────────
ENCRYPTION_KEY=change-me-to-64-bytes-random-base64
```

**Gerar chave forte**:
```bash
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(64).toString('base64'))"
```

**apps/api/src/config/env.ts**:
```typescript
const envSchema = z.object({
  // ... existing fields ...

  // Encryption key para tokens sensíveis
  ENCRYPTION_KEY: z.string().min(64).regex(/^[A-Za-z0-9+/=]+$/),
})
```

---

## Passo 3: Criar Helpers para Tokens Criptografados

Crie `apps/api/src/lib/secure-tokens.ts`:

```typescript
import { encrypt, decrypt, isEncrypted } from './crypto.js'

/**
 * Salva um token de forma segura (criptografado)
 */
export function secureToken(plainToken: string | null | undefined): string | null {
  if (!plainToken) return null
  return encrypt(plainToken)
}

/**
 * Lê um token de forma segura (decriptografa se necessário)
 */
export function readToken(encryptedToken: string | null | undefined): string | null {
  if (!encryptedToken) return null

  // Se já está criptografado, decripta
  if (isEncrypted(encryptedToken)) {
    return decrypt(encryptedToken)
  }

  // Se não está criptografado (legacy), retorna como está
  // Isso permite migração gradual
  return encryptedToken
}
```

---

## Passo 4: Atualizar Repositories/Services

### Exemplo: OrganizationSettings

**apps/api/src/modules/organizations/service.ts**:

```typescript
import { secureToken, readToken } from '../../lib/secure-tokens.js'

// Ao SALVAR configurações
async function updateSettings(orgId: string, data: SettingsInput) {
  return prisma.organizationSettings.upsert({
    where: { organizationId: orgId },
    create: {
      organizationId: orgId,
      jiraApiToken: secureToken(data.jiraApiToken),        // ✨ Encripta
      githubToken: secureToken(data.githubToken),          // ✨ Encripta
      azurePersonalAccessToken: secureToken(data.azurePat), // ✨ Encripta
      // ... outros campos
    },
    update: {
      jiraApiToken: secureToken(data.jiraApiToken),        // ✨ Encripta
      githubToken: secureToken(data.githubToken),          // ✨ Encripta
      azurePersonalAccessToken: secureToken(data.azurePat), // ✨ Encripta
      // ... outros campos
    },
  })
}

// Ao LER configurações
async function getSettings(orgId: string) {
  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId: orgId },
  })

  if (!settings) return null

  return {
    ...settings,
    jiraApiToken: readToken(settings.jiraApiToken),        // ✨ Decripta
    githubToken: readToken(settings.githubToken),          // ✨ Decripta
    azurePersonalAccessToken: readToken(settings.azurePersonalAccessToken), // ✨ Decripta
  }
}
```

---

## Passo 5: Migrar Dados Existentes (Se Houver)

Crie um script de migração `scripts/migrate-encrypt-tokens.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import { secureToken, readToken } from '../apps/api/src/lib/secure-tokens.js'

const prisma = new PrismaClient()

async function migrateTokens() {
  console.log('🔐 Migrando tokens para formato criptografado...')

  // 1. OrganizationSettings
  const settings = await prisma.organizationSettings.findMany()
  for (const s of settings) {
    await prisma.organizationSettings.update({
      where: { id: s.id },
      data: {
        jiraApiToken: s.jiraApiToken ? secureToken(readToken(s.jiraApiToken)) : null,
        githubToken: s.githubToken ? secureToken(readToken(s.githubToken)) : null,
        azurePersonalAccessToken: s.azurePersonalAccessToken
          ? secureToken(readToken(s.azurePersonalAccessToken))
          : null,
      },
    })
    console.log(`✅ Migrado OrganizationSettings ${s.id}`)
  }

  // 2. TempoConfig
  const tempoConfigs = await prisma.tempoConfig.findMany()
  for (const t of tempoConfigs) {
    await prisma.tempoConfig.update({
      where: { id: t.id },
      data: {
        apiToken: secureToken(readToken(t.apiToken)),
      },
    })
    console.log(`✅ Migrado TempoConfig ${t.id}`)
  }

  // 3. ClockifyConfig
  const clockifyConfigs = await prisma.clockifyConfig.findMany()
  for (const c of clockifyConfigs) {
    await prisma.clockifyConfig.update({
      where: { id: c.id },
      data: {
        apiKey: secureToken(readToken(c.apiKey)),
      },
    })
    console.log(`✅ Migrado ClockifyConfig ${c.id}`)
  }

  console.log('✅ Migração concluída!')
}

migrateTokens()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Executar**:
```bash
tsx --env-file apps/api/.env scripts/migrate-encrypt-tokens.ts
```

---

## Passo 6: Atualizar TODOS os Módulos

Aplique `secureToken()` e `readToken()` em:

- ✅ `OrganizationSettings` (jiraApiToken, githubToken, azurePat)
- ✅ `TempoConfig` (apiToken)
- ✅ `ClockifyConfig` (apiKey)
- ✅ `SlackConfig` (webhookUrl - se contiver secrets)
- ✅ `TeamsConfig` (webhookUrl - se contiver secrets)

---

## Passo 7: Testes

Crie `apps/api/src/lib/crypto.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, isEncrypted } from './crypto.js'

describe('Crypto', () => {
  it('should encrypt and decrypt correctly', () => {
    const plaintext = 'my-super-secret-api-token-12345'
    const encrypted = encrypt(plaintext)
    const decrypted = decrypt(encrypted)

    expect(decrypted).toBe(plaintext)
    expect(encrypted).not.toBe(plaintext)
    expect(isEncrypted(encrypted)).toBe(true)
  })

  it('should generate different ciphertext for same plaintext', () => {
    const plaintext = 'same-secret'
    const encrypted1 = encrypt(plaintext)
    const encrypted2 = encrypt(plaintext)

    expect(encrypted1).not.toBe(encrypted2)
    expect(decrypt(encrypted1)).toBe(plaintext)
    expect(decrypt(encrypted2)).toBe(plaintext)
  })

  it('should detect invalid format', () => {
    expect(() => decrypt('invalid-format')).toThrow()
  })
})
```

---

## Passo 8: Documentação

Adicione em `README.md`:

```markdown
## 🔐 Segurança de Tokens

Tokens de integração (Jira, Azure, GitHub, etc.) são criptografados usando **AES-256-GCM** antes de serem salvos no banco de dados.

**IMPORTANTE**: Nunca commite a variável `ENCRYPTION_KEY` no git. Use um valor diferente para produção.

Para gerar uma nova chave:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```
```

---

## Rotação de Chaves (Avançado)

Para rotacionar a `ENCRYPTION_KEY`:

1. Adicione `ENCRYPTION_KEY_OLD` ao .env
2. Modifique `decrypt()` para tentar ambas as chaves
3. Re-encripte todos os tokens com a nova chave
4. Remova `ENCRYPTION_KEY_OLD`

---

## Checklist de Implementação

- [ ] Criar `lib/crypto.ts`
- [ ] Criar `lib/secure-tokens.ts`
- [ ] Adicionar `ENCRYPTION_KEY` ao env schema
- [ ] Gerar `ENCRYPTION_KEY` forte para produção
- [ ] Atualizar todos os services que lidam com tokens
- [ ] Criar script de migração
- [ ] Executar migração em staging
- [ ] Testar integrations após migração
- [ ] Executar migração em produção
- [ ] Adicionar testes unitários
- [ ] Documentar no README

---

## Alternativas Consideradas

1. **Criptografia em Postgres**: Mais complexo, requer extensão `pgcrypto`
2. **HashiCorp Vault**: Overkill para este estágio, mas recomendado para escala
3. **AWS KMS/Secrets Manager**: Bom para AWS, mas adiciona latência
4. **Prisma Middleware**: Automático, mas menos transparente

**Escolhemos criptografia em aplicação** por ser:
- ✅ Simples de implementar
- ✅ Sem dependências externas
- ✅ Sem impacto de latência
- ✅ Fácil de testar
- ✅ Portável entre clouds

---

**Próxima Etapa**: Após implementar, auditar novamente e verificar score de segurança.
