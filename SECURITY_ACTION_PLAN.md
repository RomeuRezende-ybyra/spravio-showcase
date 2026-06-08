# 🚨 Plano de Ação Imediato — Segurança Spravio

**Status**: PRÉ-PRODUÇÃO
**Prioridade**: CRÍTICA
**Prazo**: Antes do deploy definitivo

---

## ⚡ AÇÕES CRÍTICAS (Fazer AGORA)

### 1. Atualizar Next.js (5 CVEs) — 10 minutos
```bash
# No diretório raiz do projeto
pnpm --filter @spravio/web add next@latest @sentry/nextjs@latest

# Testar localmente
pnpm --filter @spravio/web build
pnpm --filter @spravio/web typecheck
```

**Verificar**: Build sem erros

---

### 2. Gerar Secrets Fortes — 5 minutos

```bash
# Gerar todos os secrets de uma vez
node -e "
const crypto = require('crypto');
console.log('# ─── Copie estes valores para o .env de PRODUÇÃO ───');
console.log('');
console.log('JWT_SECRET=' + crypto.randomBytes(64).toString('base64'));
console.log('NEXTAUTH_SECRET=' + crypto.randomBytes(64).toString('base64'));
console.log('PORTAL_SECRET=' + crypto.randomBytes(32).toString('base64'));
console.log('POSTGRES_PASSWORD=' + crypto.randomBytes(24).toString('base64url'));
console.log('REDIS_PASSWORD=' + crypto.randomBytes(24).toString('base64url'));
console.log('ENCRYPTION_KEY=' + crypto.randomBytes(64).toString('base64'));
"
```

**Ação**: Copie AGORA e salve em local seguro (1Password, Bitwarden, etc.)

---

### 3. Atualizar .env de Produção no VPS — 5 minutos

SSH no servidor:
```bash
ssh root@your-server.example.com
cd /opt/spravio
nano .env
```

**Substituir** os valores:
```bash
JWT_SECRET=<valor gerado acima>
NEXTAUTH_SECRET=<valor gerado acima>
PORTAL_SECRET=<valor gerado acima>
POSTGRES_PASSWORD=<valor gerado acima>
REDIS_PASSWORD=<valor gerado acima>
ENCRYPTION_KEY=<valor gerado acima>
```

**Salvar**: Ctrl+O, Enter, Ctrl+X

---

### 4. Atualizar Validação de JWT — 5 minutos

Editar `apps/api/src/config/env.ts`:

```typescript
// ANTES:
JWT_SECRET: z.string().min(8),

// DEPOIS:
JWT_SECRET: z.string().min(32).regex(/^[A-Za-z0-9+/=]{32,}$/,
  "JWT_SECRET must be a strong base64 string (32+ chars)"),
```

Adicionar após linha 79:
```typescript
// Encryption key para tokens sensíveis
ENCRYPTION_KEY: z.string().min(64).regex(/^[A-Za-z0-9+/=]{64,}$/,
  "ENCRYPTION_KEY must be a strong base64 string (64+ bytes)"),
```

---

### 5. Corrigir CORS — 2 minutos

Editar `apps/api/src/plugins/cors.ts`:

```typescript
// ANTES:
origin: env.NODE_ENV === 'production' ? env.ALLOWED_ORIGINS : true,

// DEPOIS:
const allowedOrigins = env.NODE_ENV === 'production'
  ? env.ALLOWED_ORIGINS
  : ['http://localhost:3011', 'http://localhost:3000', 'http://127.0.0.1:3011']

// E depois:
origin: allowedOrigins,
```

---

### 6. Adicionar HSTS — 3 minutos

Editar `apps/api/src/plugins/helmet.ts`, adicionar após linha 22:

```typescript
// HSTS - Force HTTPS
hsts: env.NODE_ENV === 'production' ? {
  maxAge: 31536000, // 1 ano
  includeSubDomains: true,
  preload: true,
} : false,

// Prevenir MIME sniffing
noSniff: true,

// Prevenir clickjacking
frameguard: { action: 'deny' },

// Remover X-Powered-By
hidePoweredBy: true,
```

---

## ✅ TESTE LOCAL (15 minutos)

```bash
# 1. Typecheck
pnpm -r typecheck

# 2. Lint (se houver)
pnpm -r lint

# 3. Build tudo
pnpm --filter @spravio/types build
pnpm --filter @spravio/utils build
pnpm --filter @spravio/api build
pnpm --filter @spravio/web build

# 4. Subir local com Docker
docker compose down
docker compose up -d

# 5. Testar endpoints
curl http://localhost:3010/health
curl http://localhost:3011
```

**Verificar**:
- ✅ Todos os builds passam
- ✅ API responde /health
- ✅ Web carrega
- ✅ Login funciona

---

## 🚀 COMMIT E DEPLOY (10 minutos)

```bash
# Commit as mudanças
git add .
git commit -m "security: fix critical vulnerabilities and update Next.js

- Update Next.js from 14.2.35 to latest (fixes 5 CVEs)
- Strengthen JWT_SECRET validation (min 32 chars)
- Add ENCRYPTION_KEY for token encryption
- Fix CORS to not be permissive in dev
- Add HSTS, noSniff, frameguard headers
- Update security audit documentation

BREAKING CHANGE: Requires new environment variables in production
"

# Push para deploy automático
git push origin main

# Monitorar deploy
gh run watch
```

---

## 📊 VERIFICAÇÃO PÓS-DEPLOY (5 minutos)

```bash
# 1. Verificar health
curl https://api.spravio.io/health

# 2. Verificar headers de segurança
curl -I https://api.spravio.io/health | grep -i "strict-transport-security\|x-frame-options\|x-content-type-options"

# 3. Verificar CORS
curl -H "Origin: https://malicious.com" https://api.spravio.io/health -v

# 4. Testar login na UI
open https://spravio.io/login
```

**Esperado**:
- ✅ HSTS header presente
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ CORS bloqueia origens não autorizadas
- ✅ Login funciona

---

## 🔐 AÇÕES COMPLEMENTARES (Esta Semana)

### 1. Implementar Criptografia de Tokens (4 horas)
📄 Ver guia completo em: `docs/IMPLEMENT_TOKEN_ENCRYPTION.md`

### 2. Configurar Backup Automático (30 minutos)
```bash
# No servidor VPS
ssh root@your-server.example.com
bash /opt/spravio/scripts/setup-postgres-backup.sh
```

### 3. Testar Restore de Backup (15 minutos)
```bash
# Listar backups
ls -lh /opt/spravio/backups/

# Testar restore (em staging primeiro!)
/opt/spravio/restore-postgres.sh /opt/spravio/backups/spravio_backup_XXXXXXXX.sql.gz
```

---

## 📋 CHECKLIST FINAL

Antes de marcar como "Produção Definitiva":

- [ ] ✅ Next.js atualizado para ≥15.5.15
- [ ] ✅ Secrets fortes gerados e salvos
- [ ] ✅ .env de produção atualizado no VPS
- [ ] ✅ JWT_SECRET validation atualizada
- [ ] ✅ ENCRYPTION_KEY adicionada
- [ ] ✅ CORS corrigido
- [ ] ✅ HSTS e security headers adicionados
- [ ] ✅ Build local sem erros
- [ ] ✅ Testes locais passando
- [ ] ✅ Deploy em produção bem-sucedido
- [ ] ✅ Headers de segurança verificados
- [ ] ✅ Login e funcionalidades críticas testadas
- [ ] 🟡 Criptografia de tokens implementada (recomendado)
- [ ] 🟡 Backup automático configurado (recomendado)
- [ ] 🟡 Teste de restore realizado (recomendado)

---

## 🆘 Em Caso de Problemas

### Build Falha
```bash
# Limpar cache
pnpm store prune
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### Deploy Falha
```bash
# Ver logs do GitHub Actions
gh run view --web

# Ver logs no servidor
ssh root@your-server.example.com
docker compose logs --tail 100 api web
```

### Rollback Necessário
```bash
# Reverter commit
git revert HEAD
git push origin main

# Ou voltar para versão anterior
git reset --hard <commit-hash-anterior>
git push --force origin main  # ⚠️  Usar com cuidado
```

---

## 📞 Contatos

- **Relatório Completo**: `SECURITY_AUDIT_REPORT.md`
- **Criptografia de Tokens**: `docs/IMPLEMENT_TOKEN_ENCRYPTION.md`
- **Backup Setup**: `scripts/setup-postgres-backup.sh`
- **Security Headers**: `scripts/add-hsts-security.ts`

---

**Tempo Total Estimado**: ~1-2 horas
**Próxima Auditoria**: 30 dias após deploy definitivo
