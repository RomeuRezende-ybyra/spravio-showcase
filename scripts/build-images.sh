#!/bin/bash
# Build production Docker images for Spravio

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Building Spravio Production Images${NC}"
echo ""

# Configuration
IMAGE_TAG=${IMAGE_TAG:-latest}
REGISTRY=${REGISTRY:-}  # Leave empty for local, or set to your registry (e.g., ghcr.io/yourname)

API_IMAGE=${REGISTRY}spravio-api
WEB_IMAGE=${REGISTRY}spravio-web

echo -e "${BLUE}📦 Building API image...${NC}"
docker build \
  -f apps/api/Dockerfile \
  -t ${API_IMAGE}:${IMAGE_TAG} \
  -t ${API_IMAGE}:latest \
  .

echo -e "${GREEN}✓ API image built${NC}"
echo ""

echo -e "${BLUE}📦 Building Web image...${NC}"
docker build \
  -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:3010} \
  -t ${WEB_IMAGE}:${IMAGE_TAG} \
  -t ${WEB_IMAGE}:latest \
  .

echo -e "${GREEN}✓ Web image built${NC}"
echo ""

echo -e "${GREEN}✅ All images built successfully!${NC}"
echo ""
echo "Images:"
echo "  - ${API_IMAGE}:${IMAGE_TAG}"
echo "  - ${WEB_IMAGE}:${IMAGE_TAG}"
echo ""

# Test images
echo -e "${BLUE}🧪 Testing images...${NC}"
docker images | grep spravio

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Test locally: docker-compose -f docker-compose.test.yml up"
echo "  2. Push to registry: docker push ${API_IMAGE}:${IMAGE_TAG} && docker push ${WEB_IMAGE}:${IMAGE_TAG}"
echo "  3. Deploy: Run on your server with docker-compose.prod.yml"
