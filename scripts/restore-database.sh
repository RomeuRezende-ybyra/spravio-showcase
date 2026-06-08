#!/bin/bash
# PostgreSQL Restore Script for Spravio
# Usage: ./scripts/restore-database.sh [backup_file.sql.gz] [production|local-test]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BACKUP_FILE=$1
ENVIRONMENT=${2:-production}

if [ -z "$BACKUP_FILE" ]; then
  echo -e "${RED}❌ Usage: ./scripts/restore-database.sh [backup_file.sql.gz] [production|local-test]${NC}"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}❌ Backup file not found: ${BACKUP_FILE}${NC}"
  exit 1
fi

echo -e "${BLUE}🗄️  Spravio Database Restore${NC}"
echo -e "${BLUE}File: ${BACKUP_FILE}${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Load environment variables
if [ "$ENVIRONMENT" = "production" ]; then
  if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production file not found${NC}"
    exit 1
  fi
  source .env.production
elif [ "$ENVIRONMENT" = "local-test" ]; then
  POSTGRES_USER="spravio"
  POSTGRES_PASSWORD="testpassword123"
  POSTGRES_DB="spravio_prod_test"
  POSTGRES_HOST="localhost"
  POSTGRES_PORT="5435"
else
  echo -e "${RED}❌ Invalid environment. Use 'production' or 'local-test'${NC}"
  exit 1
fi

# Confirm restore
echo -e "${YELLOW}⚠️  WARNING: This will replace all data in the database!${NC}"
echo -e "${YELLOW}Database: ${POSTGRES_DB}${NC}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo -e "${RED}❌ Restore cancelled${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}📦 Restoring from backup...${NC}"

# Perform restore
export PGPASSWORD="$POSTGRES_PASSWORD"
gunzip -c "$BACKUP_FILE" | psql -h "${POSTGRES_HOST:-localhost}" \
                                 -p "${POSTGRES_PORT:-5432}" \
                                 -U "$POSTGRES_USER" \
                                 -d "$POSTGRES_DB" \
                                 --quiet

# Check if restore was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Database restored successfully${NC}"
else
  echo -e "${RED}❌ Restore failed${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Restore process completed${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to run migrations if needed:${NC}"
echo -e "  docker-compose exec api npx prisma migrate deploy"
