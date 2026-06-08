#!/bin/bash
# PostgreSQL Backup Script for Spravio
# Usage: ./scripts/backup-database.sh [production|local-test]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

echo -e "${BLUE}🗄️  Spravio Database Backup${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Load environment variables
if [ "$ENVIRONMENT" = "production" ]; then
  if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production file not found${NC}"
    exit 1
  fi
  source .env.production
  BACKUP_FILE="spravio_prod_${TIMESTAMP}.sql.gz"
elif [ "$ENVIRONMENT" = "local-test" ]; then
  POSTGRES_USER="spravio"
  POSTGRES_PASSWORD="testpassword123"
  POSTGRES_DB="spravio_prod_test"
  POSTGRES_HOST="localhost"
  POSTGRES_PORT="5435"
  BACKUP_FILE="spravio_local_${TIMESTAMP}.sql.gz"
else
  echo -e "${RED}❌ Invalid environment. Use 'production' or 'local-test'${NC}"
  exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📦 Creating backup: ${BACKUP_FILE}${NC}"

# Perform backup
export PGPASSWORD="$POSTGRES_PASSWORD"
pg_dump -h "${POSTGRES_HOST:-localhost}" \
        -p "${POSTGRES_PORT:-5432}" \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        --format=plain \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"

# Check if backup was successful
if [ $? -eq 0 ]; then
  BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
  echo -e "${GREEN}✅ Backup created successfully${NC}"
  echo -e "${GREEN}   File: ${BACKUP_DIR}/${BACKUP_FILE}${NC}"
  echo -e "${GREEN}   Size: ${BACKUP_SIZE}${NC}"
else
  echo -e "${RED}❌ Backup failed${NC}"
  exit 1
fi

# Cleanup old backups
echo ""
echo -e "${YELLOW}🧹 Cleaning up backups older than ${RETENTION_DAYS} days...${NC}"
find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
REMAINING=$(find "$BACKUP_DIR" -name "*.sql.gz" -type f | wc -l)
echo -e "${GREEN}✅ Cleanup complete. ${REMAINING} backup(s) remaining.${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Backup process completed${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Optional: Upload to S3 or cloud storage
# Uncomment and configure if needed:
# if [ "$ENVIRONMENT" = "production" ]; then
#   echo -e "${YELLOW}☁️  Uploading to S3...${NC}"
#   aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}" "s3://your-bucket/spravio-backups/${BACKUP_FILE}"
#   echo -e "${GREEN}✅ Uploaded to S3${NC}"
# fi
