#!/bin/bash
# Generate secure random secrets for Spravio production deployment

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔐 Spravio Secret Generator${NC}"
echo ""
echo -e "${YELLOW}Copy these values to your .env.production file${NC}"
echo ""

echo -e "${GREEN}# ─── SECRETS ──────────────────────────────────────────────────────────────────${NC}"
echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "PORTAL_SECRET=$(openssl rand -hex 16)"
echo "NEXTAUTH_SECRET=$(openssl rand -hex 16)"
echo ""

echo -e "${GREEN}# ─── DATABASE ─────────────────────────────────────────────────────────────────${NC}"
POSTGRES_PASSWORD=$(openssl rand -hex 16)
echo "POSTGRES_USER=spravio"
echo "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}"
echo "POSTGRES_DB=spravio_production"
echo "DATABASE_URL=postgresql://spravio:${POSTGRES_PASSWORD}@postgres:5432/spravio_production"
echo ""

echo -e "${GREEN}# ─── REDIS ────────────────────────────────────────────────────────────────────${NC}"
echo "REDIS_PASSWORD=$(openssl rand -hex 16)"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⚠️  IMPORTANT: Store these secrets securely!${NC}"
echo -e "${YELLOW}   • Never commit them to git${NC}"
echo -e "${YELLOW}   • Use a password manager (1Password, Bitwarden, etc.)${NC}"
echo -e "${YELLOW}   • Keep a backup in a secure location${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
