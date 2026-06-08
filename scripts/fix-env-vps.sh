#!/bin/bash
# Quick fix to update .env on VPS with correct image names

set -e

cd /opt/spravio

echo "🔧 Updating .env with correct Docker image registry paths..."

# Backup current .env
cp .env .env.backup.$(date +%s)

# Remove old image entries if they exist
sed -i '/^API_IMAGE=/d' .env 2>/dev/null || true
sed -i '/^WEB_IMAGE=/d' .env 2>/dev/null || true
sed -i '/^IMAGE_TAG=/d' .env 2>/dev/null || true

# Add correct GHCR registry paths
cat >> .env <<'EOF'

# Docker Images (GHCR)
API_IMAGE=ghcr.io/your-org/spravio-api
WEB_IMAGE=ghcr.io/your-org/spravio-web
IMAGE_TAG=latest
EOF

echo "✅ .env updated successfully"
echo ""
echo "Current image configuration:"
grep -E "^(API_IMAGE|WEB_IMAGE|IMAGE_TAG)=" .env || true
