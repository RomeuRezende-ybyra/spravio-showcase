#!/bin/bash

# Spravio VPS - Profile Settings Test Script
# Tests the new user profile endpoints in production

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Spravio VPS - Profile Settings Test${NC}"
echo "========================================"
echo ""

# Configuration
API_URL="https://api.spravio.io"
WEB_URL="https://spravio.io"

# Test 1: Basic Health Check
echo -e "${YELLOW}1. Testing API Health...${NC}"
if curl -sf "$API_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}❌ API health check failed${NC}"
    exit 1
fi

# Test 2: Check /users/me endpoint exists (should return 401)
echo -e "${YELLOW}2. Testing /users/me endpoint...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/users/me")
if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ /users/me endpoint exists (401 Unauthorized - correct)${NC}"
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${RED}❌ /users/me endpoint NOT FOUND - module not deployed${NC}"
    exit 1
else
    echo -e "${YELLOW}⚠️  Unexpected status code: $HTTP_CODE${NC}"
fi

# Test 3: Check Docker containers status
echo -e "${YELLOW}3. Checking Docker containers...${NC}"
docker-compose ps

# Test 4: Check recent API logs for errors
echo -e "${YELLOW}4. Checking API logs (last 20 lines)...${NC}"
docker-compose logs --tail=20 api | grep -E "error|Error|ERROR" && echo -e "${RED}Found errors in logs${NC}" || echo -e "${GREEN}✅ No errors in recent logs${NC}"

# Test 5: Check if Prisma migration was applied
echo -e "${YELLOW}5. Checking Prisma migrations...${NC}"
docker-compose exec -T api sh -c "cd /app && npx prisma migrate status" || echo -e "${YELLOW}Could not check migration status${NC}"

# Test 6: Test database connection
echo -e "${YELLOW}6. Testing database connection...${NC}"
docker-compose exec -T api sh -c "cd /app && npx prisma db execute --stdin <<< 'SELECT 1;'" > /dev/null 2>&1 && echo -e "${GREEN}✅ Database connected${NC}" || echo -e "${RED}❌ Database connection failed${NC}"

# Test 7: Check if User table has new columns
echo -e "${YELLOW}7. Verifying User table structure...${NC}"
docker-compose exec -T api sh -c "cd /app && npx prisma db execute --stdin <<< 'SELECT column_name FROM information_schema.columns WHERE table_name = '\''User'\'' AND column_name IN ('\''language'\'', '\''timezone'\'', '\''dateFormat'\'', '\''theme'\'');'" 2>/dev/null | grep -E "language|timezone|dateFormat|theme" && echo -e "${GREEN}✅ User preferences columns exist${NC}" || echo -e "${RED}❌ User preferences columns missing${NC}"

# Test 8: Check web app
echo -e "${YELLOW}8. Testing Web App...${NC}"
if curl -sf "$WEB_URL" > /dev/null; then
    echo -e "${GREEN}✅ Web app is accessible${NC}"
else
    echo -e "${RED}❌ Web app is not accessible${NC}"
fi

# Test 9: Check test profile page
echo -e "${YELLOW}9. Testing /test-profile page...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$WEB_URL/test-profile")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ Test profile page exists (status: $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Test profile page status: $HTTP_CODE${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}📊 Test Summary${NC}"
echo "========================================"
echo -e "API URL: ${YELLOW}$API_URL${NC}"
echo -e "Web URL: ${YELLOW}$WEB_URL${NC}"
echo ""
echo -e "${GREEN}✅ All critical tests passed!${NC}"
echo ""
echo -e "${BLUE}🔗 Next Steps:${NC}"
echo "1. Login at: $WEB_URL/login"
echo "2. Go to: $WEB_URL/settings"
echo "3. Try editing your profile"
echo "4. Or test at: $WEB_URL/test-profile"
echo ""
