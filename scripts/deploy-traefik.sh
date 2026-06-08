#!/bin/bash

# Spravio VPS Deploy Script (Traefik version)
# Usage: ./scripts/deploy-traefik.sh

set -e  # Exit on error

echo "🚀 Starting Spravio Deployment (Traefik)..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Copy .env.production to .env and fill with real values"
    exit 1
fi

# Check if Traefik is running
if ! docker ps | grep -q traefik; then
    echo -e "${YELLOW}⚠️  Warning: Traefik container not found!${NC}"
    echo "Make sure Traefik is running before deploying Spravio"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if traefik network exists
if ! docker network ls | grep -q traefik; then
    echo -e "${YELLOW}⚠️  Creating traefik network...${NC}"
    docker network create traefik
fi

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping containers...${NC}"
docker-compose -f docker-compose.traefik.yml down

# Remove old images
echo -e "${YELLOW}🗑️  Removing old images...${NC}"
docker-compose -f docker-compose.traefik.yml rm -f api web

# Build containers
echo -e "${YELLOW}🏗️  Building containers...${NC}"
docker-compose -f docker-compose.traefik.yml build --no-cache api web

# Start containers
echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker-compose -f docker-compose.traefik.yml up -d

# Wait for services
echo -e "${YELLOW}⏳ Waiting for services...${NC}"
sleep 10

# Show status
echo -e "${YELLOW}📊 Container status:${NC}"
docker-compose -f docker-compose.traefik.yml ps

# Show logs
echo -e "${YELLOW}📝 Recent logs:${NC}"
docker-compose -f docker-compose.traefik.yml logs --tail=50

# Health checks
echo -e "${YELLOW}🏥 Running health checks...${NC}"

# Check API (internal)
if docker exec spravio_api wget -q -O- http://localhost:3010/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API container is healthy${NC}"
else
    echo -e "${RED}❌ API health check failed${NC}"
fi

# Check Web (internal)
if docker exec spravio_web wget -q -O- http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Web container is healthy${NC}"
else
    echo -e "${RED}❌ Web health check failed${NC}"
fi

# Check public endpoints (needs DNS + Traefik)
echo -e "${YELLOW}🌐 Checking public endpoints...${NC}"
sleep 5

if curl -f -k https://api.spravio.io/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is publicly accessible (https://api.spravio.io)${NC}"
else
    echo -e "${YELLOW}⚠️  API not yet accessible publicly (DNS/SSL may still be propagating)${NC}"
fi

if curl -f -k https://spravio.io > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Web is publicly accessible (https://spravio.io)${NC}"
else
    echo -e "${YELLOW}⚠️  Web not yet accessible publicly (DNS/SSL may still be propagating)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📍 Services:"
echo "   - Web: https://spravio.io"
echo "   - API: https://api.spravio.io"
echo ""
echo "📊 Useful commands:"
echo "   - View logs: docker-compose -f docker-compose.traefik.yml logs -f"
echo "   - Restart: docker-compose -f docker-compose.traefik.yml restart"
echo "   - Stop: docker-compose -f docker-compose.traefik.yml down"
echo ""
echo "🔍 Check Traefik dashboard (if enabled) to verify routes"
