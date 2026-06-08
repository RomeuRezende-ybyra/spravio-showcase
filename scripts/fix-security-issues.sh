#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Spravio — Security Fixes Script
# Correções automáticas das vulnerabilidades identificadas
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

echo "🔒 Spravio Security Fixes"
echo "=========================="
echo ""

# ─── 1. Atualizar Next.js para versão segura ─────────────────────────────────
echo "📦 [1/4] Atualizando Next.js para versão segura..."
cd "$(dirname "$0")/.."
pnpm --filter @spravio/web add next@latest @sentry/nextjs@latest
echo "✅ Next.js atualizado"
echo ""

# ─── 2. Gerar secrets fortes ─────────────────────────────────────────────────
echo "🔐 [2/4] Gerando secrets fortes..."
echo ""
echo "Cole estes valores no seu .env de PRODUÇÃO:"
echo "─────────────────────────────────────────────────────────────────"
echo ""

JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")
NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")
PORTAL_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
POSTGRES_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))")
REDIS_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))")

echo "# ─── Auth Secrets (64 bytes cada) ───────────────────────────────"
echo "JWT_SECRET=$JWT_SECRET"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo "PORTAL_SECRET=$PORTAL_SECRET"
echo ""
echo "# ─── Database Passwords ─────────────────────────────────────────"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo "REDIS_PASSWORD=$REDIS_PASSWORD"
echo ""
echo "─────────────────────────────────────────────────────────────────"
echo ""
echo "⚠️  IMPORTANTE: Copie estes valores AGORA e guarde em local seguro!"
echo "⚠️  Após fechar este terminal, os valores serão perdidos."
echo ""
read -p "Pressione ENTER depois de copiar os secrets..."

# ─── 3. Atualizar validação de JWT_SECRET ────────────────────────────────────
echo ""
echo "🔧 [3/4] Atualizando validação de secrets..."

# Backup do arquivo original
cp apps/api/src/config/env.ts apps/api/src/config/env.ts.bak

# Atualizar validação do JWT_SECRET
sed -i 's/JWT_SECRET: z\.string()\.min(8)/JWT_SECRET: z.string().min(32).regex(\/^[A-Za-z0-9+\/=]{32,}$\/, "JWT_SECRET must be a strong base64 string (32+ chars)")/' apps/api/src/config/env.ts || echo "⚠️  Atualização manual necessária em env.ts"

echo "✅ Validação de secrets atualizada"
echo ""

# ─── 4. Atualizar CORS ───────────────────────────────────────────────────────
echo "🌐 [4/4] Corrigindo configuração de CORS..."

# Backup
cp apps/api/src/plugins/cors.ts apps/api/src/plugins/cors.ts.bak

# Atualizar CORS para não ser permissivo
cat > apps/api/src/plugins/cors.ts <<'EOF'
import cors from '@fastify/cors'
import fp from 'fastify-plugin'
import { env } from '../config/env.js'

export default fp(async (fastify) => {
  const allowedOrigins = env.NODE_ENV === 'production'
    ? env.ALLOWED_ORIGINS
    : ['http://localhost:3011', 'http://localhost:3000', 'http://127.0.0.1:3011']

  await fastify.register(cors, {
    origin: allowedOrigins,
    credentials: true,
  })

  fastify.log.info(
    {
      mode: env.NODE_ENV === 'production' ? 'restricted' : 'development',
      origins: allowedOrigins,
    },
    'CORS configured'
  )
})
EOF

echo "✅ CORS configurado com segurança"
echo ""

# ─── Resumo ──────────────────────────────────────────────────────────────────
echo "════════════════════════════════════════════════════════════════"
echo "✅ Correções automáticas concluídas!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 PRÓXIMOS PASSOS MANUAIS:"
echo ""
echo "1. ✅ Atualizar .env de produção com os secrets gerados acima"
echo "2. ⚠️  Implementar criptografia de tokens no banco (ver SECURITY_AUDIT_REPORT.md seção 2)"
echo "3. ⚠️  Configurar backup automático do PostgreSQL"
echo "4. ✅ Adicionar HSTS headers (ver script abaixo)"
echo "5. ✅ Testar a aplicação localmente: pnpm dev"
echo "6. ✅ Fazer commit das mudanças"
echo "7. ✅ Deploy em produção"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📄 Arquivos modificados (backups criados com .bak):"
echo "  - apps/api/src/config/env.ts"
echo "  - apps/api/src/plugins/cors.ts"
echo "  - apps/web/package.json (Next.js atualizado)"
echo ""
echo "Para reverter as mudanças: git checkout apps/api/src/"
echo ""
