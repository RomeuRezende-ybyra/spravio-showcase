# 🔔 Sentry Setup Guide

## 📋 O que é Sentry?

Sentry é uma plataforma de monitoramento de erros que captura exceptions, erros de runtime e crashes em tempo real, permitindo debugar problemas em produção rapidamente.

## ✅ Status Atual

O Sentry **já está implementado** no código:
- ✅ Backend (API): `@sentry/node@^10.47.0` configurado
- ✅ Frontend (Web): `@sentry/nextjs@^10.47.0` configurado
- ✅ Error handlers prontos
- ✅ Source maps configurados
- ✅ Session replay habilitado (frontend)

**Falta apenas**: Configurar as credenciais (DSN).

---

## 🚀 Setup (15 minutos)

### Passo 1: Criar Conta no Sentry (5 min)

1. Acesse: https://sentry.io/signup/
2. Escolha plano **FREE** (até 5.000 erros/mês)
3. Crie uma organização (ex: "Spravio")

### Passo 2: Criar Projeto para API (3 min)

1. No dashboard Sentry, clique em **"Create Project"**
2. Escolha plataforma: **Node.js**
3. Nome do projeto: **spravio-api**
4. Clique em **"Create Project"**
5. **Copie o DSN** que aparece (formato: `https://xxxxx@o1234567.ingest.sentry.io/9876543`)

### Passo 3: Criar Projeto para Web (3 min)

1. Clique novamente em **"Create Project"**
2. Escolha plataforma: **Next.js**
3. Nome do projeto: **spravio-web**
4. Clique em **"Create Project"**
5. **Copie o DSN** (será diferente do API)

### Passo 4: Configurar Variáveis de Ambiente (4 min)

#### 4.1. Local (.env)

Para testar localmente, adicione ao `.env`:

```bash
# API
SENTRY_DSN_API=https://xxxxx@o1234567.ingest.sentry.io/API_PROJECT_ID

# Web
NEXT_PUBLIC_SENTRY_DSN=https://yyyyy@o1234567.ingest.sentry.io/WEB_PROJECT_ID
```

#### 4.2. Produção (VPS)

SSH na VPS e edite o `/opt/spravio/.env`:

```bash
ssh seu-usuario@vps-ip
cd /opt/spravio
nano .env
```

Adicione as mesmas variáveis acima e salve (Ctrl+O, Enter, Ctrl+X).

#### 4.3. Restart dos Serviços

```bash
cd /opt/spravio
docker compose down
docker compose up -d
```

---

## 🧪 Testar Captura de Erros

### Teste Backend (API)

1. Acesse a API e force um erro:
```bash
curl -X POST https://api.spravio.io/some-invalid-endpoint
```

2. Verifique no Sentry (https://sentry.io) → **spravio-api** → Issues
3. Você deve ver o erro capturado com stack trace completo

### Teste Frontend (Web)

1. Abra o console do navegador em https://spravio.io
2. Execute:
```javascript
throw new Error('Teste Sentry Frontend')
```

3. Verifique no Sentry → **spravio-web** → Issues
4. Você deve ver o erro + session replay (se disponível)

---

## 📊 O que o Sentry Captura

### Backend (API)
- ✅ Uncaught exceptions
- ✅ Unhandled promise rejections
- ✅ Request context (method, URL, headers)
- ✅ User context (via JWT)
- ✅ Environment (NODE_ENV)
- ✅ Stack traces completos

### Frontend (Web)
- ✅ JavaScript errors
- ✅ Unhandled promise rejections
- ✅ React component errors
- ✅ Network errors (fetch failures)
- ✅ Session replay (grava a sessão do usuário)
- ✅ Breadcrumbs (rastro de ações antes do erro)

---

## ⚙️ Configurações Avançadas (Opcional)

### Alertas por Email

1. No Sentry, vá em **Settings** → **Alerts**
2. Crie regra: "Send email when a new issue is seen"
3. Configure threshold (ex: alertar apenas se > 10 ocorrências)

### Integração com Slack

1. **Settings** → **Integrations** → **Slack**
2. Conecte workspace
3. Configure canal para receber alertas (ex: #errors)

### Release Tracking

Para rastrear erros por versão/commit, atualize os arquivos de config:

**API** (`apps/api/src/plugins/sentry.ts`):
```typescript
Sentry.init({
  dsn: env.SENTRY_DSN_API,
  environment: env.NODE_ENV,
  release: `spravio-api@${process.env.GIT_COMMIT || 'dev'}`,
  tracesSampleRate: 0.1,
})
```

**Web** (`apps/web/sentry.client.config.ts`):
```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: `spravio-web@${process.env.NEXT_PUBLIC_GIT_COMMIT || 'dev'}`,
  tracesSampleRate: 0.1,
})
```

Depois adicione no workflow de deploy (`.github/workflows/deploy-direct-build.yml`):
```yaml
- name: Build images
  run: |
    export GIT_COMMIT=$(git rev-parse --short HEAD)
    docker compose build \
      --build-arg NEXT_PUBLIC_API_URL=https://api.spravio.io \
      --build-arg GIT_COMMIT=$GIT_COMMIT \
      --build-arg NEXT_PUBLIC_GIT_COMMIT=$GIT_COMMIT
```

---

## 🎯 Métricas e Limites do Plano Free

| Recurso | Plano Free |
|---------|------------|
| Erros/mês | 5.000 |
| Membros da equipe | Ilimitado |
| Projetos | Ilimitado |
| Retenção de dados | 30 dias |
| Session replay | 50/mês |
| Performance monitoring | 10.000 transações/mês |

**Dica**: Se exceder o limite, Sentry apenas para de capturar novos erros no mês. Nada quebra.

---

## 🔍 Debugging com Sentry

### Ver Detalhes de um Erro

1. Acesse Issue no Sentry
2. Veja:
   - **Stack trace**: Linha exata do erro
   - **Breadcrumbs**: O que o usuário fez antes
   - **Tags**: Ambiente, versão, browser
   - **User**: Email/ID do usuário (se autenticado)
   - **Session replay**: Vídeo da sessão (frontend)

### Resolver um Erro

1. Clique em **"Resolve"** quando corrigir
2. Se o erro voltar a ocorrer, Sentry reabre automaticamente
3. Use **"Ignore"** para silenciar falsos positivos

---

## ✅ Checklist de Conclusão

- [ ] Conta Sentry criada
- [ ] Projeto **spravio-api** criado
- [ ] Projeto **spravio-web** criado
- [ ] DSNs copiados
- [ ] Variáveis adicionadas no `.env` da VPS
- [ ] Serviços reiniciados (`docker compose down && docker compose up -d`)
- [ ] Teste backend executado (erro capturado)
- [ ] Teste frontend executado (erro capturado)
- [ ] Alertas por email configurados (opcional)

---

## 📚 Recursos

- **Docs Sentry**: https://docs.sentry.io/
- **Sentry Node.js**: https://docs.sentry.io/platforms/node/
- **Sentry Next.js**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Dashboard**: https://sentry.io/organizations/YOUR_ORG/issues/
