# 🔐 Guia de Rotação de Secrets

**Frequência Recomendada**: A cada 90 dias
**Próxima Rotação**: [Adicionar data 90 dias após deploy]

---

## 📋 Secrets que Devem Ser Rotacionados

### 🔴 Críticos (Rotacionar a cada 90 dias)
1. `JWT_SECRET` - Tokens de autenticação
2. `ENCRYPTION_KEY` - Criptografia de tokens no banco
3. `PORTAL_SECRET` - Tokens de portal público

### 🟡 Importantes (Rotacionar a cada 180 dias)
4. `NEXTAUTH_SECRET` - NextAuth.js
5. `STRIPE_WEBHOOK_SECRET` - Webhooks do Stripe
6. `POSTGRES_PASSWORD` - Senha do banco de dados
7. `REDIS_PASSWORD` - Senha do Redis

### 🟢 Opcionais (Rotacionar quando necessário)
8. Tokens de integração (Jira, GitHub, Azure, etc.)

---

## 🔄 Processo de Rotação

### ANTES DE COMEÇAR

✅ **Checklist Pré-Rotação**:
- [ ] Backup completo do banco de dados
- [ ] Horário de baixo tráfego (madrugada/fim de semana)
- [ ] Janela de manutenção comunicada aos usuários
- [ ] Teste de rollback preparado

---

## 1️⃣ ROTACIONAR JWT_SECRET

**Impacto**: Invalida todos os JWTs existentes (usuários precisam fazer login novamente)

### Passo 1: Gerar Novo Secret

```bash
node -e "console.log('JWT_SECRET_NEW=' + require('crypto').randomBytes(64).toString('base64'))"
```

### Passo 2: Adicionar Novo Secret ao .env

```bash
ssh root@your-server.example.com
cd /opt/spravio
nano .env
```

Adicionar:
```bash
# Keep old secret temporarily for graceful rotation
JWT_SECRET_OLD=<secret_atual>
JWT_SECRET=<secret_novo>
```

### Passo 3: Atualizar Código (Suporte a Múltiplos Secrets)

**⚠️ IMPORTANTE**: Este código precisa ser deployado ANTES da rotação real.

Editar `apps/api/src/plugins/auth.ts`:

```typescript
import fp from 'fastify-plugin'
import fjwt from '@fastify/jwt'
import { env } from '../config/env.js'
import type { UserSession } from '@spravio/types'

declare module 'fastify' {
  interface FastifyRequest {
    userSession: UserSession
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: UserSession
    user: UserSession
  }
}

export default fp(async (fastify) => {
  fastify.register(fjwt, {
    secret: env.JWT_SECRET,
    // Try old secret if new one fails (graceful rotation)
    trusted: (request, decodedToken) => {
      if (env.JWT_SECRET_OLD) {
        try {
          fastify.jwt.verify(request.headers.authorization?.replace('Bearer ', '') || '', {
            key: env.JWT_SECRET_OLD
          })
          return true
        } catch {
          // Old secret didn't work, continue with new
        }
      }
      return true
    }
  })
})
```

### Passo 4: Deploy

```bash
git add apps/api/src/plugins/auth.ts apps/api/src/config/env.ts
git commit -m "feat: support JWT_SECRET rotation with graceful fallback"
git push origin main
```

Aguardar deploy completar.

### Passo 5: Aguardar Expiração dos Tokens Antigos

JWTs têm expiração de 7 dias. Aguarde 7 dias antes de remover `JWT_SECRET_OLD`.

### Passo 6: Remover Secret Antigo (Após 7 dias)

```bash
ssh root@your-server.example.com
cd /opt/spravio
nano .env
```

Remover linha:
```bash
# JWT_SECRET_OLD=<remover>
```

Restart:
```bash
docker compose restart api
```

---

## 2️⃣ ROTACIONAR ENCRYPTION_KEY

**Impacto**: Requer re-criptografar todos os tokens no banco

**⚠️ PROCESSO COMPLEXO - Requer migração de dados**

### Passo 1: Gerar Novo Secret

```bash
node -e "console.log('ENCRYPTION_KEY_NEW=' + require('crypto').randomBytes(64).toString('base64'))"
```

### Passo 2: Adicionar Novo + Manter Antigo

```bash
ssh root@your-server.example.com
cd /opt/spravio
nano .env
```

```bash
ENCRYPTION_KEY_OLD=<secret_atual>
ENCRYPTION_KEY=<secret_novo>
```

### Passo 3: Atualizar Código para Suportar Dual-Key

Editar `apps/api/src/lib/crypto.ts`:

```typescript
// Try decrypt with new key first, fallback to old key
export function decrypt(ciphertext: string): string {
  try {
    return decryptWithKey(ciphertext, env.ENCRYPTION_KEY)
  } catch (error) {
    if (env.ENCRYPTION_KEY_OLD) {
      try {
        return decryptWithKey(ciphertext, env.ENCRYPTION_KEY_OLD)
      } catch {
        throw new Error('Failed to decrypt with both old and new keys')
      }
    }
    throw error
  }
}
```

### Passo 4: Criar Script de Re-criptografia

`scripts/rotate-encryption-key.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import { decrypt, encrypt } from '../apps/api/src/lib/crypto.js'

const prisma = new PrismaClient()

async function rotateEncryptionKey() {
  console.log('🔄 Starting encryption key rotation...')

  // 1. OrganizationSettings
  const settings = await prisma.organizationSettings.findMany()
  for (const s of settings) {
    if (s.jiraApiToken) {
      const decrypted = decrypt(s.jiraApiToken) // Uses old key
      const reEncrypted = encrypt(decrypted) // Uses new key
      await prisma.organizationSettings.update({
        where: { id: s.id },
        data: { jiraApiToken: reEncrypted }
      })
    }
    // Repeat for githubToken, azurePersonalAccessToken...
  }

  // 2. TempoConfig, ClockifyConfig, etc...

  console.log('✅ Encryption key rotation complete!')
}

rotateEncryptionKey()
```

### Passo 5: Executar Migração

```bash
tsx --env-file apps/api/.env scripts/rotate-encryption-key.ts
```

### Passo 6: Remover ENCRYPTION_KEY_OLD

Após confirmar que tudo funciona, remover a chave antiga.

---

## 3️⃣ ROTACIONAR PORTAL_SECRET

**Impacto**: Invalida todos os portal tokens existentes

### Simples - Mesmo Processo do JWT_SECRET

```bash
# 1. Gerar novo
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 2. Atualizar .env
PORTAL_SECRET=<novo_secret>

# 3. Restart
docker compose restart api
```

⚠️ **Aviso**: Todos os portal tokens compartilhados ficarão inválidos.
Usuários precisarão gerar novos tokens.

---

## 4️⃣ ROTACIONAR POSTGRES_PASSWORD

**Impacto**: Requer restart do banco + atualização de todas as conexões

### Passo 1: Gerar Nova Senha

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
```

### Passo 2: Conectar ao Postgres e Alterar

```bash
docker exec -it spravio-postgres-1 psql -U postgres
```

```sql
ALTER USER postgres WITH PASSWORD '<nova_senha>';
\q
```

### Passo 3: Atualizar .env

```bash
nano /opt/spravio/.env
```

```bash
POSTGRES_PASSWORD=<nova_senha>
```

Atualizar DATABASE_URL também:
```bash
DATABASE_URL=postgresql://postgres:<nova_senha_url_encoded>@postgres:5432/trackingproject
```

### Passo 4: Restart Todos os Serviços

```bash
docker compose down
docker compose up -d
```

### Passo 5: Verificar Conexão

```bash
docker compose logs api | grep "Database connected"
```

---

## 5️⃣ ROTACIONAR REDIS_PASSWORD

**Impacto**: Requer restart do Redis + atualização de todas as conexões

### Mesmo processo do Postgres

```bash
# 1. Gerar nova senha
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"

# 2. Atualizar .env
REDIS_PASSWORD=<nova_senha>
REDIS_URL=redis://:<nova_senha>@redis:6379

# 3. Restart
docker compose down
docker compose up -d

# 4. Verificar
docker compose logs api | grep "Redis"
```

---

## 📅 Calendário de Rotação

### Criar Lembretes

```bash
# Adicionar ao cron para lembrete mensal
0 9 1 * * echo "Reminder: Check if secrets rotation is due (every 90 days)" | mail -s "Spravio Security Reminder" admin@yourcompany.com
```

### Planilha de Tracking

| Secret | Último Rotacionado | Próxima Rotação | Status |
|--------|-------------------|-----------------|--------|
| JWT_SECRET | YYYY-MM-DD | YYYY-MM-DD | ⏰ |
| ENCRYPTION_KEY | YYYY-MM-DD | YYYY-MM-DD | ⏰ |
| PORTAL_SECRET | YYYY-MM-DD | YYYY-MM-DD | ⏰ |
| NEXTAUTH_SECRET | YYYY-MM-DD | YYYY-MM-DD | ⏰ |
| POSTGRES_PASSWORD | YYYY-MM-DD | YYYY-MM-DD | ⏰ |
| REDIS_PASSWORD | YYYY-MM-DD | YYYY-MM-DD | ⏰ |

---

## 🆘 Troubleshooting

### "Invalid JWT" após rotação

**Causa**: Usuários tentando usar tokens antigos
**Solução**: Esperado. Usuários precisam fazer login novamente.

### "Failed to decrypt token" após rotação ENCRYPTION_KEY

**Causa**: Script de re-criptografia não rodou ou falhou
**Solução**:
1. Reverter para ENCRYPTION_KEY_OLD temporariamente
2. Verificar logs do script de migração
3. Corrigir e rodar novamente

### "Database connection failed" após rotação POSTGRES_PASSWORD

**Causa**: DATABASE_URL não foi atualizada ou senha errada
**Solução**:
1. Verificar DATABASE_URL no .env
2. Verificar se URL encoding está correto (caracteres especiais)
3. Testar conexão: `docker exec spravio-postgres-1 psql -U postgres`

---

## ✅ Checklist Pós-Rotação

- [ ] Todos os serviços subiram corretamente
- [ ] Health check passando
- [ ] Login funciona
- [ ] API responde corretamente
- [ ] Sem erros nos logs
- [ ] Backup do .env antigo arquivado
- [ ] Documentação de rotação atualizada (datas)
- [ ] Próxima rotação agendada no calendário

---

## 📞 Emergência - Reverter Rotação

Se algo der errado após rotação:

```bash
# 1. SSH no servidor
ssh root@your-server.example.com

# 2. Restaurar .env antigo
cd /opt/spravio
cp .env.backup.YYYYMMDD .env

# 3. Restart
docker compose down
docker compose up -d

# 4. Verificar
curl https://api.spravio.io/health
```

---

**Criado**: 2026-04-20
**Última Atualização**: 2026-04-20
**Próxima Revisão**: 2026-07-20 (90 dias)
