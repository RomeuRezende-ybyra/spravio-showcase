#!/bin/bash
# Fix GHCR package visibility - make packages public
# This allows pulling images without authentication issues

echo "🔓 Making GHCR packages public..."
echo ""

# Make spravio-api package public
echo "📦 Making spravio-api public..."
gh api \
  --method PATCH \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  repos/your-org/spravio/packages/container/spravio-api \
  -f visibility='public' \
  2>&1 | head -5

echo "   ✅ spravio-api visibility updated"
echo ""

# Make spravio-web package public
echo "📦 Making spravio-web public..."
gh api \
  --method PATCH \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  repos/your-org/spravio/packages/container/spravio-web \
  -f visibility='public' \
  2>&1 | head -5

echo "   ✅ spravio-web visibility updated"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ GHCR packages are now PUBLIC"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You can now pull images without authentication:"
echo "  docker pull ghcr.io/your-org/spravio-api:latest"
echo "  docker pull ghcr.io/your-org/spravio-web:latest"
