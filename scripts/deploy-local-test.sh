#!/bin/bash
# Deploy Spravio to Local Production Test
# Run this to test the production build locally before deploying to real server

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Spravio - Local Production Test Deploy${NC}"
echo ""

# Step 1: Build images
echo -e "${CYAN}📦 Step 1/4: Building Docker images...${NC}"
echo ""

echo -e "${YELLOW}Building API image...${NC}"
docker build -f apps/api/Dockerfile -t spravio-api:latest .

echo -e "${YELLOW}Building Web image...${NC}"
docker build -f apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=http://localhost:3020 -t spravio-web:latest .

echo -e "${GREEN}✅ Images built successfully!${NC}"
echo ""

# Step 2: Stop old containers
echo -e "${CYAN}📦 Step 2/4: Stopping old containers...${NC}"
docker-compose -f docker-compose.local-prod.yml down

echo -e "${GREEN}✅ Old containers stopped${NC}"
echo ""

# Step 3: Start services
echo -e "${CYAN}📦 Step 3/4: Starting services...${NC}"
docker-compose -f docker-compose.local-prod.yml up -d

echo -e "${GREEN}✅ Services started${NC}"
echo ""

# Step 4: Run migrations
echo -e "${CYAN}📦 Step 4/4: Running database migrations...${NC}"
sleep 5  # Wait for database to be ready

# Run migrations inside the API container
docker-compose -f docker-compose.local-prod.yml exec -T api sh -c "cd /app/apps/api && npx prisma migrate deploy"

echo -e "${GREEN}✅ Migrations applied${NC}"
echo ""

# Show status
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}🌐 Application URLs:${NC}"
echo -e "   Web:  ${GREEN}http://localhost:3021${NC}"
echo -e "   API:  ${GREEN}http://localhost:3020${NC}"
echo ""
echo -e "${CYAN}📊 View logs:${NC}"
echo -e "   docker-compose -f docker-compose.local-prod.yml logs -f"
echo ""
echo -e "${CYAN}🛑 Stop services:${NC}"
echo -e "   docker-compose -f docker-compose.local-prod.yml down"
echo ""

# Show running containers
echo -e "${CYAN}📦 Running containers:${NC}"
docker-compose -f docker-compose.local-prod.yml ps
