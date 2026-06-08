#!/bin/bash
# Setup automated backups using cron
# Usage: ./scripts/setup-backup-cron.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}⏰ Setting up automated database backups${NC}"
echo ""

# Get the absolute path to the backup script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup-database.sh"

# Make scripts executable
chmod +x "$BACKUP_SCRIPT"

echo -e "${YELLOW}Current crontab:${NC}"
crontab -l 2>/dev/null || echo "No crontab currently configured"
echo ""

# Cron job: Daily backup at 2 AM
CRON_JOB="0 2 * * * cd ${PROJECT_DIR} && ${BACKUP_SCRIPT} production >> ${PROJECT_DIR}/logs/backup.log 2>&1"

echo -e "${YELLOW}Proposed cron job:${NC}"
echo "$CRON_JOB"
echo ""
echo -e "${YELLOW}This will run daily at 2:00 AM${NC}"
echo ""

read -p "Add this cron job? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo -e "${YELLOW}⚠️  Cancelled${NC}"
  exit 0
fi

# Add cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo ""
echo -e "${GREEN}✅ Cron job added successfully${NC}"
echo ""
echo -e "${BLUE}To verify:${NC}"
echo "  crontab -l"
echo ""
echo -e "${BLUE}To edit:${NC}"
echo "  crontab -e"
echo ""
echo -e "${BLUE}To remove:${NC}"
echo "  crontab -r"
echo ""

# Create logs directory
mkdir -p "${PROJECT_DIR}/logs"
echo -e "${GREEN}✅ Logs directory created at ${PROJECT_DIR}/logs${NC}"
