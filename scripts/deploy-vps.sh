#!/bin/bash

# Spravio VPS Deploy Script
# Usage: ./scripts/deploy-vps.sh

set -e  # Exit on error

echo "🚀 Starting Spravio VPS Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Copy .env.production to .env and fill with real values"
    exit 1
fi

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code from Git...${NC}"
git pull origin main

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down

# Remove old images to force rebuild
echo -e "${YELLOW}🗑️  Removing old images...${NC}"
docker-compose rm -f api web

# Rebuild and start containers
echo -e "${YELLOW}🏗️  Building containers...${NC}"
docker-compose build --no-cache api web

echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker-compose up -d

# Wait for containers to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check container status
echo -e "${YELLOW}📊 Container status:${NC}"
docker-compose ps

# Show logs
echo -e "${YELLOW}📝 Recent logs:${NC}"
docker-compose logs --tail=50

# Health check
echo -e "${YELLOW}🏥 Running health checks...${NC}"

# Check API
if curl -f http://localhost:3010/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}❌ API health check failed${NC}"
fi

# Check Web
if curl -f http://localhost:3011 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Web is healthy${NC}"
else
    echo -e "${RED}❌ Web health check failed${NC}"
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📍 Services:"
echo "   - Web: https://spravio.io"
echo "   - API: https://api.spravio.io"
echo ""
echo "📊 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Restart: docker-compose restart"
echo "   - Stop: docker-compose down"
