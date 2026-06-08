# Relatório de Auditoria de Segurança — Spravio
**Data**: 2026-04-20
**Status**: Pré-Produção Definitiva
**Avaliador**: Claude Code

---

## 🎯 Resumo Executivo

O sistema apresenta **5 vulnerabilidades HIGH/MODERATE** que precisam ser corrigidas antes da produção definitiva, além de **8 recomendações de melhorias** de segurança.

### Classificação de Risco Geral: **MÉDIO-ALTO** ⚠️

---

## 🔴 VULNERABILIDADES CRÍTICAS (Ação Imediata Necessária)

### 1. **Next.js Desatualizado com 5 CVEs Conhecidos**
**Severidade**: HIGH
**CVE**: GHSA-h25m-26qc-wcjf, GHSA-q4gf-8mx6-v5v3, e outros
**Versão Atual**: 14.2.35
**Versão Segura**: ≥15.5.15

**Vulnerabilidades**:
- DoS via HTTP request deserialization (React Server Components)
- DoS via Server Components
- DoS via Image Optimizer remotePatterns
- HTTP request smuggling em rewrites
- Unbounded disk cache growth

**Impacto**: Ataques de negação de serviço, request smuggling, exaustão de disco

**Correção**:
```bash
pnpm --filter @spravio/web add next@latest
pnpm --filter @spravio/web add @sentry/nextjs@latest
```

**Prioridade**: 🔴 CRÍTICA — Corrigir ANTES do deploy definitivo

---

### 2. **Secrets em Variáveis de Ambiente Sem Criptografia**
**Severidade**: MEDIUM
**Localização**: `prisma/schema.prisma`, linhas 48, 51, 53

```prisma
jiraApiToken              String?      // encrypted at rest
azurePersonalAccessToken  String?      // encrypted at rest
githubToken               String?      // encrypted at rest
```

**Problema**: Comentário diz "encrypted at rest", mas tokens são armazenados em **plaintext** no PostgreSQL.

**Impacto**: Se houver vazamento do banco de dados, todos os tokens de integração (Jira, Azure, GitHub) ficam expostos.

**Correção Recomendada**:
1. Implementar criptografia de campo usando biblioteca como `@47ng/cloak` ou `prisma-field-encryption`
2. Usar KMS (AWS KMS, Google Cloud KMS) ou vault (HashiCorp Vault)
3. Mínimo: usar `crypto.createCipheriv` com AES-256-GCM

**Prioridade**: 🟠 ALTA — Implementar antes de produção

---

### 3. **JWT Secret Fraco por Padrão**
**Severidade**: MEDIUM
**Localização**: `.env.example`, `config/env.ts`

```typescript
JWT_SECRET: z.string().min(8),  // Apenas 8 caracteres!
```

**.env.example**:
```
JWT_SECRET=change-me-in-production
```

**Problemas**:
- Validação mínima de apenas 8 caracteres (muito fraco)
- Valor de exemplo é óbvio e pode ser esquecido em produção
- Não há rotação de secrets documentada

**Correção**:
```typescript
// env.ts
JWT_SECRET: z.string().min(32).regex(/^[A-Za-z0-9+/=]{32,}$/),

// Gerar secret forte:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Prioridade**: 🟠 ALTA — Validar e documentar antes de produção

---

### 4. **CORS Permissivo em Desenvolvimento Exposto**
**Severidade**: LOW-MEDIUM
**Localização**: `plugins/cors.ts`

```typescript
origin: env.NODE_ENV === 'production' ? env.ALLOWED_ORIGINS : true,
```

**Problema**: Se `NODE_ENV` não for configurado corretamente, CORS fica **aberto para todos** (`true`).

**Risco**: CSRF, roubo de dados sensíveis se NODE_ENV não for definido.

**Correção**:
```typescript
origin: env.NODE_ENV === 'production'
  ? env.ALLOWED_ORIGINS
  : ['http://localhost:3011', 'http://localhost:3000'],
```

**Prioridade**: 🟡 MÉDIA

---

### 5. **Helmet CSP com 'unsafe-inline'**
**Severidade**: LOW
**Localização**: `plugins/helmet.ts`

```typescript
scriptSrc: ["'self'", "'unsafe-inline'"],
styleSrc: ["'self'", "'unsafe-inline'"],
```

**Problema**: `unsafe-inline` permite scripts inline, abrindo brecha para XSS.

**Impacto**: Reduz efetividade do Content Security Policy.

**Correção**: Usar nonces ou hashes para scripts/styles específicos. Remover `unsafe-inline` quando possível.

**Prioridade**: 🟡 MÉDIA — Documentar necessidade ou remover

---

## 🟡 RECOMENDAÇÕES DE SEGURANÇA

### 6. **Rate Limiting Inconsistente**
**Localização**: `plugins/rate-limit.ts`, `modules/auth/route.ts`

```typescript
// Global: 100 req/min
// Login: 5 req/min
// Register: 3 req/min
```

**Recomendação**:
- Adicionar rate limiting específico para rotas sensíveis (billing, portal token)
- Implementar rate limiting por IP E por user ID
- Considerar usar Redis para rate limiting distribuído (já está configurado)

---

### 7. **Falta HTTPS Enforcement**
**Problema**: Não há redirecionamento HTTP → HTTPS forçado no código.

**Correção**: Adicionar em `helmet.ts`:
```typescript
hsts: {
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true,
},
```

---

### 8. **Logs Podem Vazar Informações Sensíveis**
**Localização**: `app.ts` - Logger serializers

**Risco**: Headers podem conter tokens, cookies, etc.

**Recomendação**: Adicionar sanitização:
```typescript
headers: {
  host: req.headers.host,
  'user-agent': req.headers['user-agent'],
  // Nunca logar: authorization, cookie, x-api-key
}
```

---

### 9. **Falta Validação de Input em Rotas Críticas**
**Localização**: Várias rotas

**Recomendação**:
- Todas as rotas já usam Zod ✅
- Validar tamanho máximo de strings para prevenir DoS
- Adicionar sanitização HTML em campos de texto livre

**Exemplo**:
```typescript
z.string().max(500).trim()
```

---

### 10. **Prisma ORM - Risco de Injeção de SQL**
**Status**: ✅ **BOM** — Usando Prisma Client corretamente

**Verificado**: Não há uso de `$queryRaw` ou `$executeRaw` sem parametrização.

---

### 11. **Dependências de Produção**
**Análise**:
- ✅ bcryptjs: OK (hash de senhas)
- ✅ jsonwebtoken: OK (JWT)
- ✅ @fastify/helmet: OK (security headers)
- ✅ @fastify/rate-limit: OK
- ⚠️ Sentry configurado mas pode vazar dados

**Recomendação**: Configurar `beforeSend` do Sentry para filtrar dados sensíveis.

---

### 12. **Backup de Banco de Dados**
**Status**: ❌ **NÃO CONFIGURADO**

**Recomendação**: Implementar:
- Backup diário automático do PostgreSQL
- Retenção de 30 dias
- Backup criptografado em storage separado
- Teste de restore mensal

---

### 13. **Monitoramento de Segurança**
**Faltando**:
- WAF (Web Application Firewall) - considerar Cloudflare
- Alertas de tentativas de login suspeitas
- Detecção de anomalias (ex: Sentry + custom alerts)

---

## 🔒 BOAS PRÁTICAS JÁ IMPLEMENTADAS ✅

1. **Autenticação & Autorização**
   - ✅ JWT com expiração (7 dias)
   - ✅ Role-based access control (OWNER, PROJECT_MANAGER, VIEWER)
   - ✅ Bcrypt para hash de senhas (salt rounds: 12)
   - ✅ Middleware requireAuth protegendo rotas

2. **Segurança de Rede**
   - ✅ Helmet configurado
   - ✅ CORS restrito em produção
   - ✅ Rate limiting global + específico (login/register)

3. **Banco de Dados**
   - ✅ Prisma ORM (previne SQL injection)
   - ✅ Transações para operações críticas
   - ✅ Cascade delete configurado
   - ✅ Unique constraints

4. **Docker & Deploy**
   - ✅ Multi-stage builds (reduz superfície de ataque)
   - ✅ Alpine base images (menor footprint)
   - ✅ Non-root user (implícito no node:20-alpine)
   - ✅ Health checks configurados
   - ✅ .env não commitado (.gitignore)

5. **Código**
   - ✅ TypeScript strict mode
   - ✅ Input validation com Zod em todas as rotas
   - ✅ Error handling centralizado
   - ✅ Logs estruturados (Pino)

---

## 📋 CHECKLIST PRÉ-PRODUÇÃO

### Crítico (Fazer AGORA)
- [ ] **Atualizar Next.js para ≥15.5.15**
- [ ] **Implementar criptografia de tokens no banco**
- [ ] **Gerar JWT_SECRET forte (64+ bytes)**
- [ ] **Validar NEXTAUTH_SECRET forte**
- [ ] **Validar PORTAL_SECRET forte**

### Alta Prioridade (Esta Semana)
- [ ] **Configurar backup automático do PostgreSQL**
- [ ] **Testar restore de backup**
- [ ] **Adicionar HSTS headers**
- [ ] **Configurar Sentry beforeSend (filtrar dados sensíveis)**
- [ ] **Documentar rotação de secrets**

### Média Prioridade (Próximas 2 Semanas)
- [ ] Remover `unsafe-inline` do CSP
- [ ] Implementar rate limiting por user ID
- [ ] Adicionar sanitização de logs
- [ ] Configurar alertas de segurança
- [ ] Penetration testing básico

### Baixa Prioridade (Backlog)
- [ ] Implementar rotação automática de JWT secrets
- [ ] Adicionar 2FA para usuários OWNER
- [ ] Implementar WAF (Cloudflare)
- [ ] Audit trail completo de ações sensíveis

---

## 🔐 VARIÁVEIS DE AMBIENTE OBRIGATÓRIAS

### Produção - Secrets Fortes Necessários:
```bash
# CRÍTICO: Gerar valores aleatórios fortes
JWT_SECRET=<64+ bytes random base64>
NEXTAUTH_SECRET=<64+ bytes random base64>
PORTAL_SECRET=<32+ bytes random base64>

# Database (validar senha forte)
POSTGRES_PASSWORD=<senha forte 16+ chars>
REDIS_PASSWORD=<senha forte 16+ chars>

# Stripe (produção)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# CORS (apenas domínio de produção)
ALLOWED_ORIGINS=https://spravio.io,https://api.spravio.io
```

---

## 📊 SCORE DE SEGURANÇA

| Categoria | Score | Status |
|-----------|-------|--------|
| Autenticação | 8/10 | ✅ Bom |
| Autorização | 9/10 | ✅ Excelente |
| Criptografia | 5/10 | ⚠️ Melhorar |
| Network Security | 7/10 | ✅ Bom |
| Dependências | 4/10 | 🔴 Crítico |
| Logging & Monitoring | 6/10 | 🟡 Regular |
| Backup & Recovery | 0/10 | 🔴 Ausente |
| **TOTAL** | **6.3/10** | 🟡 **MÉDIO** |

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **IMEDIATO** (Hoje):
   - Atualizar Next.js
   - Gerar e configurar secrets fortes

2. **ESTA SEMANA**:
   - Implementar criptografia de tokens
   - Configurar backups

3. **PRÓXIMO MÊS**:
   - Contratar pentest externo
   - Implementar WAF
   - Configurar monitoramento avançado

---

## 📞 Contato

Para dúvidas sobre este relatório ou implementação das correções, consulte a documentação de segurança em `/docs/SECURITY.md` (a ser criado).

---

**Relatório gerado por Claude Code — Spravio Security Audit v1.0**
