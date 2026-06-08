# Deploy Spravio to Local Production Test
# Run this to test the production build locally before deploying to real server

Write-Host "🚀 Spravio - Local Production Test Deploy" -ForegroundColor Blue
Write-Host ""

# Step 1: Build images
Write-Host "📦 Step 1/4: Building Docker images..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Building API image..." -ForegroundColor Yellow
docker build -f apps/api/Dockerfile -t spravio-api:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ API build failed" -ForegroundColor Red
    exit 1
}

Write-Host "Building Web image..." -ForegroundColor Yellow
docker build -f apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=http://localhost:3020 -t spravio-web:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Web build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Images built successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Stop old containers
Write-Host "📦 Step 2/4: Stopping old containers..." -ForegroundColor Cyan
docker-compose -f docker-compose.local-prod.yml down

Write-Host "✅ Old containers stopped" -ForegroundColor Green
Write-Host ""

# Step 3: Start services
Write-Host "📦 Step 3/4: Starting services..." -ForegroundColor Cyan
docker-compose -f docker-compose.local-prod.yml up -d

Write-Host "✅ Services started" -ForegroundColor Green
Write-Host ""

# Step 4: Run migrations
Write-Host "📦 Step 4/4: Running database migrations..." -ForegroundColor Cyan
Start-Sleep -Seconds 5  # Wait for database to be ready

# Run migrations inside the API container
docker-compose -f docker-compose.local-prod.yml exec -T api sh -c "cd /app/apps/api && npx prisma migrate deploy"

Write-Host "✅ Migrations applied" -ForegroundColor Green
Write-Host ""

# Show status
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host "   Web:  http://localhost:3021" -ForegroundColor White
Write-Host "   API:  http://localhost:3020" -ForegroundColor White
Write-Host ""
Write-Host "📊 View logs:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose.local-prod.yml logs -f" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Stop services:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose.local-prod.yml down" -ForegroundColor White
Write-Host ""

# Show running containers
Write-Host "📦 Running containers:" -ForegroundColor Cyan
docker-compose -f docker-compose.local-prod.yml ps
