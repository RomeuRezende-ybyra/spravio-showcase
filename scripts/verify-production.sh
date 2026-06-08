#!/bin/bash
# Production Verification and Setup Script
# This script verifies and configures everything needed for production

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 Spravio Production Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if running on VPS
if [ ! -d "/opt/spravio" ]; then
  echo -e "${RED}❌ Not running on production server (/opt/spravio not found)${NC}"
  exit 1
fi

cd /opt/spravio

# Phase 1: Check Infrastructure
echo -e "${BLUE}📦 Phase 1: Infrastructure Check${NC}"
echo ""

echo -n "  Docker installed: "
if command -v docker &> /dev/null; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  exit 1
fi

echo -n "  Docker running: "
if docker info &> /dev/null; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  exit 1
fi

echo -n "  Docker Compose installed: "
if docker compose version &> /dev/null; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  exit 1
fi

echo -n "  Network 'proxy' exists: "
if docker network ls | grep -q proxy; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${YELLOW}⚠${NC} Creating..."
  docker network create proxy
  echo -e "    ${GREEN}Created${NC}"
fi

echo ""

# Phase 2: Check Environment Configuration
echo -e "${BLUE}🔧 Phase 2: Environment Configuration${NC}"
echo ""

echo -n "  .env file exists: "
if [ -f .env ]; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${YELLOW}⚠${NC} Creating from example..."
  if [ -f .env.production.example ]; then
    cp .env.production.example .env
    echo -e "    ${YELLOW}⚠ REQUIRED: Edit .env with production values${NC}"
  else
    echo -e "${RED}✗ .env.production.example not found${NC}"
    exit 1
  fi
fi

# Check critical env vars
echo -n "  JWT_SECRET configured: "
if grep -q "^JWT_SECRET=.\{32,\}" .env 2>/dev/null && ! grep -q "CHANGE_ME" .env; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  echo -e "    ${YELLOW}Run: openssl rand -hex 32${NC}"
fi

echo -n "  DATABASE_URL configured: "
if grep -q "^DATABASE_URL=postgresql://" .env 2>/dev/null && ! grep -q "CHANGE_ME" .env; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
fi

echo -n "  GHCR credentials configured: "
if grep -q "^GHCR_USER=" .env 2>/dev/null && grep -q "^GHCR_TOKEN=" .env 2>/dev/null; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${YELLOW}⚠${NC} Adding..."
  if [ -n "$GHCR_USER" ] && [ -n "$GHCR_TOKEN" ]; then
    echo "" >> .env
    echo "# GitHub Container Registry" >> .env
    echo "GHCR_USER=$GHCR_USER" >> .env
    echo "GHCR_TOKEN=$GHCR_TOKEN" >> .env
    echo -e "    ${GREEN}Added from environment${NC}"
  else
    echo -e "    ${RED}✗ GHCR_USER and GHCR_TOKEN not in environment${NC}"
  fi
fi

echo ""

# Phase 3: GHCR Login
echo -e "${BLUE}🔑 Phase 3: GitHub Container Registry${NC}"
echo ""

# Source env vars
set -a
source .env 2>/dev/null || true
set +a

echo -n "  GHCR login: "
if [ -n "$GHCR_TOKEN" ] && [ -n "$GHCR_USER" ]; then
  if echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
  else
    echo -e "${RED}✗${NC}"
    echo -e "    ${RED}Failed to login to GHCR${NC}"
  fi
else
  echo -e "${RED}✗ Missing GHCR_USER or GHCR_TOKEN${NC}"
fi

echo ""

# Phase 4: Check Containers
echo -e "${BLUE}🐳 Phase 4: Container Status${NC}"
echo ""

if [ -f docker-compose.yml ]; then
  CONTAINERS=$(docker compose ps -q 2>/dev/null | wc -l)
  if [ "$CONTAINERS" -gt 0 ]; then
    echo "  Running containers:"
    docker compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"
  else
    echo -e "  ${YELLOW}⚠ No containers running${NC}"
    echo -e "    ${BLUE}Run: ./deploy.sh latest${NC}"
  fi
else
  echo -e "  ${RED}✗ docker-compose.yml not found${NC}"
fi

echo ""

# Phase 5: Health Checks
echo -e "${BLUE}🏥 Phase 5: Health Checks${NC}"
echo ""

# Check if API is running
API_CONTAINER=$(docker compose ps -q api 2>/dev/null)
if [ -n "$API_CONTAINER" ]; then
  echo -n "  API container: "
  if docker ps | grep -q "$API_CONTAINER"; then
    echo -e "${GREEN}✓ Running${NC}"

    echo -n "  Health endpoint: "
    sleep 2  # Give it a moment to be ready
    if curl -sf http://localhost:3010/health > /dev/null 2>&1; then
      echo -e "${GREEN}✓ Responding${NC}"

      # Detailed health
      HEALTH=$(curl -sf http://localhost:3010/health/detailed 2>/dev/null || echo "{}")
      DB_STATUS=$(echo "$HEALTH" | jq -r '.checks.database.status // "unknown"' 2>/dev/null || echo "unknown")
      REDIS_STATUS=$(echo "$HEALTH" | jq -r '.checks.redis.status // "unknown"' 2>/dev/null || echo "unknown")

      echo -n "  Database: "
      if [ "$DB_STATUS" = "healthy" ]; then
        echo -e "${GREEN}✓ Healthy${NC}"
      else
        echo -e "${YELLOW}⚠ $DB_STATUS${NC}"
      fi

      echo -n "  Redis: "
      if [ "$REDIS_STATUS" = "healthy" ]; then
        echo -e "${GREEN}✓ Healthy${NC}"
      else
        echo -e "${YELLOW}⚠ $REDIS_STATUS${NC}"
      fi
    else
      echo -e "${RED}✗ Not responding${NC}"
    fi
  else
    echo -e "${RED}✗ Not running${NC}"
  fi
else
  echo -e "  ${YELLOW}⚠ API container not found${NC}"
fi

echo ""

# Phase 6: Backups
echo -e "${BLUE}💾 Phase 6: Backup Configuration${NC}"
echo ""

echo -n "  Backup scripts: "
if [ -x scripts/backup-database.sh ] && [ -x scripts/restore-database.sh ]; then
  echo -e "${GREEN}✓ Present and executable${NC}"
else
  echo -e "${YELLOW}⚠ Making executable...${NC}"
  chmod +x scripts/*.sh 2>/dev/null || true
fi

echo -n "  Backup directory: "
if [ -d backups ]; then
  BACKUP_COUNT=$(find backups -name "*.sql.gz" 2>/dev/null | wc -l)
  echo -e "${GREEN}✓ $BACKUP_COUNT backup(s)${NC}"
else
  echo -e "${YELLOW}⚠ Creating...${NC}"
  mkdir -p backups
fi

echo -n "  Cron job configured: "
if crontab -l 2>/dev/null | grep -q "backup-database.sh"; then
  echo -e "${GREEN}✓ Configured${NC}"
else
  echo -e "${YELLOW}⚠ Not configured${NC}"
  echo -e "    ${BLUE}Run: ./scripts/setup-backup-cron.sh${NC}"
fi

echo ""

# Phase 7: Logs Check
echo -e "${BLUE}📋 Phase 7: Recent Logs${NC}"
echo ""

if [ -n "$API_CONTAINER" ]; then
  echo "  Last 5 API log entries:"
  docker compose logs --tail=5 api 2>/dev/null | sed 's/^/    /'
else
  echo -e "  ${YELLOW}⚠ No containers to check logs${NC}"
fi

echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Verification Complete${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Action items
echo -e "${YELLOW}📝 Action Items:${NC}"
echo ""

ACTION_NEEDED=0

# Check if containers are running
if [ "$CONTAINERS" -eq 0 ]; then
  echo -e "  ${RED}1.${NC} Deploy application: ${BLUE}./deploy.sh latest${NC}"
  ACTION_NEEDED=1
fi

# Check if env is configured
if grep -q "CHANGE_ME" .env 2>/dev/null; then
  echo -e "  ${RED}2.${NC} Configure .env with production secrets: ${BLUE}nano .env${NC}"
  echo -e "      Generate secrets: ${BLUE}openssl rand -hex 32${NC}"
  ACTION_NEEDED=1
fi

# Check if cron is configured
if ! crontab -l 2>/dev/null | grep -q "backup-database.sh"; then
  echo -e "  ${RED}3.${NC} Setup automated backups: ${BLUE}./scripts/setup-backup-cron.sh${NC}"
  ACTION_NEEDED=1
fi

if [ $ACTION_NEEDED -eq 0 ]; then
  echo -e "  ${GREEN}✅ No action items - system is fully configured!${NC}"
fi

echo ""
