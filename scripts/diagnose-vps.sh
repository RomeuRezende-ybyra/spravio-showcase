#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Spravio — VPS Diagnostic Script
# Diagnóstico completo para resolver problema de rotas 404
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPORT_FILE="diagnostic-report-$(date +%Y%m%d_%H%M%S).txt"

echo "🔍 Spravio VPS Diagnostic Report" | tee "$REPORT_FILE"
echo "Generated: $(date)" | tee -a "$REPORT_FILE"
echo "========================================" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 1. Docker Images
echo "📦 1. Docker Images:" | tee -a "$REPORT_FILE"
echo "─────────────────────────────────────────" | tee -a "$REPORT_FILE"
docker compose images | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 2. Running Containers
echo "🐳 2. Running Containers:" | tee -a "$REPORT_FILE"
echo "─────────────────────────────────────────" | tee -a "$REPORT_FILE"
docker compose ps | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 3. API Container Details
echo "🔧 3. API Container Build Info:" | tee -a "$REPORT_FILE"
echo "─────────────────────────────────────────" | tee -a "$REPORT_FILE"
docker compose exec -T api node --version | tee -a "$REPORT_FILE"
docker compose exec -T api cat /app/package.json | grep '"version"' | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 4. Compiled Routes
echo "📁 4. Compiled Routes Directory:" | tee -a "$REPORT_FILE"
echo "─────────────────────────────────────────" | tee -a "$REPORT_FILE"
docker compose exec -T api ls -la /app/dist/routes/ 2>&1 | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 5. Main Server File
echo "📄 5. Server Entry Point:" | tee -a "$REPORT_FILE"
echo "─────────────────────────────────────────" | tee -a "$REPORT_FILE"
docker compose exec -T api ls -la /app/dist/server.js 2>&1 | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 6. App File
echo "📄 6. App Build File:" | tee -a "$REPORT_FILE"
echo "─────────────────────────────────────────" | tee -a "$REPORT_FILE"
docker compose exec -T api ls -la /app/dist/app.js 2>&1 | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 7. Environment Variables (sanitized)
echo "🔐 7. Environment Variables (sanitized):" | tee -a "$REPORT_FILE"
echo "─────────────────────────────────────────" | tee -a "$REPORT_FILE"
echo "Checking critical env vars exist (not showing values):" | tee -a "$REPORT_FILE"
docker compose exec -T api sh -c 'env | grep -E "^(DATABASE_URL|REDIS_URL|JWT_SECRET|ENCRYPTION_KEY|PORTAL_SECRET|PORT|NODE_ENV)=" | sed "s/=.*/=***REDACTED***/"' | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 8. API Logs (last 50 lines)
echo "📋 8. API Logs (last 50 lines):" | tee -a "$REPORT_FILE"
echo "─────────────────────────────────────────" | tee -a "$REPORT_FILE"
docker compose logs api --tail 50 2>&1 | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 9. Test Routes
echo "🧪 9. Route Tests:" | tee -a "$REPORT_FILE"
echo "─────────────────────────────────────────" | tee -a "$REPORT_FILE"
echo "Testing /health:" | tee -a "$REPORT_FILE"
curl -s http://localhost:3010/health 2>&1 | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"
echo "Testing /live:" | tee -a "$REPORT_FILE"
curl -s http://localhost:3010/live 2>&1 | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"
echo "Testing / (root):" | tee -a "$REPORT_FILE"
curl -s http://localhost:3010/ 2>&1 | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 10. Docker Compose File in Use
echo "📝 10. Docker Compose Config:" | tee -a "$REPORT_FILE"
echo "─────────────────────────────────────────" | tee -a "$REPORT_FILE"
echo "Checking which docker-compose file is used:" | tee -a "$REPORT_FILE"
ls -la docker-compose*.yml 2>&1 | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 11. Dist directory structure
echo "🗂️  11. Dist Directory Structure:" | tee -a "$REPORT_FILE"
echo "─────────────────────────────────────────" | tee -a "$REPORT_FILE"
docker compose exec -T api find /app/dist -type f -name "*.js" | head -30 | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 12. Check if routes are actually imported
echo "🔎 12. Checking route imports in app.js:" | tee -a "$REPORT_FILE"
echo "─────────────────────────────────────────" | tee -a "$REPORT_FILE"
docker compose exec -T api grep -i "health" /app/dist/app.js | head -5 2>&1 | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

echo "========================================" | tee -a "$REPORT_FILE"
echo "✅ Diagnostic complete!" | tee -a "$REPORT_FILE"
echo "Report saved to: $REPORT_FILE" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"
echo "📤 Send this file to Claude for analysis" | tee -a "$REPORT_FILE"
