#!/bin/bash
# Pre-deployment checklist validator for Spravio
# Run this before deploying to production

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

check() {
  local message=$1
  local command=$2

  if eval "$command" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} $message"
  else
    echo -e "  ${RED}✗${NC} $message"
    ((ERRORS++))
  fi
}

warn() {
  local message=$1
  local command=$2

  if eval "$command" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} $message"
  else
    echo -e "  ${YELLOW}⚠${NC} $message"
    ((WARNINGS++))
  fi
}

info() {
  echo -e "  ${BLUE}ℹ${NC} $1"
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 Spravio Pre-Deployment Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Code Quality
echo -e "${BLUE}📝 Code Quality${NC}"
check "Lint passes" "pnpm lint"
check "Type check passes" "pnpm typecheck"
check "Tests pass" "pnpm test"
echo ""

# Environment
echo -e "${BLUE}⚙️  Environment${NC}"
check ".env.production.example exists" "test -f .env.production.example"
warn ".env.production exists" "test -f .env.production"
check "Docker is installed" "command -v docker"
check "Docker Compose is available" "docker compose version"
echo ""

# Docker Images
echo -e "${BLUE}🐳 Docker Images${NC}"
check "API Dockerfile exists" "test -f apps/api/Dockerfile"
check "Web Dockerfile exists" "test -f apps/web/Dockerfile"
check "docker-compose.prod.yml exists" "test -f docker-compose.prod.yml"

if command -v docker > /dev/null 2>&1; then
  info "Attempting to build images..."
  if docker build -f apps/api/Dockerfile -t spravio-api:test . > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} API image builds successfully"
  else
    echo -e "  ${RED}✗${NC} API image build failed"
    ((ERRORS++))
  fi

  if docker build -f apps/web/Dockerfile -t spravio-web:test . > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Web image builds successfully"
  else
    echo -e "  ${RED}✗${NC} Web image build failed"
    ((ERRORS++))
  fi
fi
echo ""

# Scripts
echo -e "${BLUE}📜 Deployment Scripts${NC}"
check "deploy.sh exists" "test -f scripts/deploy.sh"
check "backup-database.sh exists" "test -f scripts/backup-database.sh"
check "restore-database.sh exists" "test -f scripts/restore-database.sh"
check "deploy.sh is executable" "test -x scripts/deploy.sh"
echo ""

# Documentation
echo -e "${BLUE}📚 Documentation${NC}"
check "PRODUCTION.md exists" "test -f docs/PRODUCTION.md"
check "LOGGING.md exists" "test -f docs/LOGGING.md"
warn "README.md exists" "test -f README.md"
echo ""

# GitHub Workflows
echo -e "${BLUE}🔄 CI/CD${NC}"
check "CI workflow exists" "test -f .github/workflows/ci.yml"
check "Deploy workflow exists" "test -f .github/workflows/deploy.yml"
warn "Security scan workflow exists" "test -f .github/workflows/security.yml"
echo ""

# Database
echo -e "${BLUE}🗄️  Database${NC}"
check "Prisma schema exists" "test -f apps/api/prisma/schema.prisma"
check "Migrations directory exists" "test -d apps/api/prisma/migrations"
MIGRATION_COUNT=$(find apps/api/prisma/migrations -name "migration.sql" 2>/dev/null | wc -l)
if [ "$MIGRATION_COUNT" -gt 0 ]; then
  echo -e "  ${GREEN}✓${NC} $MIGRATION_COUNT migrations found"
else
  echo -e "  ${YELLOW}⚠${NC} No migrations found"
  ((WARNINGS++))
fi
echo ""

# Security
echo -e "${BLUE}🔒 Security${NC}"
check "CORS plugin exists" "test -f apps/api/src/plugins/cors.ts"
check "Helmet plugin exists" "test -f apps/api/src/plugins/helmet.ts"
check "Rate limit plugin exists" "test -f apps/api/src/plugins/rate-limit.ts"
check "Auth plugin exists" "test -f apps/api/src/plugins/auth.ts"

# Check for common security issues
if grep -r "origin: true" apps/api/src/plugins/cors.ts > /dev/null 2>&1; then
  if grep -r "NODE_ENV === 'production'" apps/api/src/plugins/cors.ts > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} CORS properly configured for production"
  else
    echo -e "  ${RED}✗${NC} CORS allows all origins (security risk)"
    ((ERRORS++))
  fi
fi
echo ""

# Monitoring
echo -e "${BLUE}📊 Monitoring & Observability${NC}"
check "Health routes exist" "test -f apps/api/src/routes/health.ts"
check "Sentry plugin exists" "test -f apps/api/src/plugins/sentry.ts"
warn "Monitoring docker-compose exists" "test -f docker-compose.monitoring.yml"
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Ready to deploy.${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  $WARNINGS warnings found, but no blocking issues.${NC}"
  echo -e "${YELLOW}   Review warnings above before deploying.${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS errors found. Fix them before deploying.${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}   Also $WARNINGS warnings to review.${NC}"
  fi
  exit 1
fi
