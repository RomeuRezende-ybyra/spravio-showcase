#!/bin/bash
# Fix DATABASE_URL hostname in .env file
# This script fixes the common issue where DATABASE_URL uses wrong hostname

set -e

ENV_FILE="/opt/spravio/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env file not found at $ENV_FILE"
  exit 1
fi

echo "🔍 Checking DATABASE_URL in $ENV_FILE..."

# Check current DATABASE_URL
CURRENT_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d'=' -f2-)

if echo "$CURRENT_URL" | grep -q "@postgres:5432"; then
  echo "✅ DATABASE_URL already uses correct hostname (postgres)"
  echo "   Current: $(echo "$CURRENT_URL" | sed 's/:\/\/[^:]*:[^@]*/@USER:****@/')"
  exit 0
fi

echo "⚠️  DATABASE_URL uses incorrect hostname"
echo "   Current: $(echo "$CURRENT_URL" | sed 's/:\/\/[^:]*:[^@]*/@USER:****@/')"
echo ""

# Extract components
POSTGRES_USER=$(grep "^POSTGRES_USER=" "$ENV_FILE" | cut -d'=' -f2-)
POSTGRES_PASSWORD=$(grep "^POSTGRES_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2-)
POSTGRES_DB=$(grep "^POSTGRES_DB=" "$ENV_FILE" | cut -d'=' -f2-)

if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_DB" ]; then
  echo "❌ Missing POSTGRES_USER, POSTGRES_PASSWORD, or POSTGRES_DB in .env"
  exit 1
fi

# Build correct DATABASE_URL
NEW_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?connection_limit=20&pool_timeout=20&connect_timeout=10"

echo "📝 Updating DATABASE_URL..."
echo "   New: $(echo "$NEW_URL" | sed 's/:\/\/[^:]*:[^@]*/@USER:****@/')"

# Backup .env
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Update DATABASE_URL
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$NEW_URL|" "$ENV_FILE"

echo "✅ DATABASE_URL updated successfully"
echo "   Backup saved at ${ENV_FILE}.backup.*"
echo ""
echo "🔄 You may need to restart services:"
echo "   cd /opt/spravio && docker compose down && docker compose up -d"
