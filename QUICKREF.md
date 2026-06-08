# Quick Reference - Spravio Production Commands

## 🚀 Deployment

```bash
# Pre-deployment check
bash scripts/pre-deploy-check.sh

# Generate secrets
bash scripts/generate-secrets.sh

# Deploy (auto via GitHub Actions on push to main)
# OR manual deploy on server:
ssh root@your-server
cd /opt/spravio
./deploy.sh latest

# Deploy specific version
./deploy.sh v1.2.3
./deploy.sh abc123  # git SHA
```

---

## 📊 Monitoring

```bash
# View all logs
docker-compose logs -f

# View API logs only
docker-compose logs -f api

# View last 100 lines
docker-compose logs --tail=100 api

# Health check
curl http://localhost:3010/health
curl http://localhost:3010/health/detailed

# Check container status
docker-compose ps

# Resource usage
docker stats

# Access Grafana
open http://localhost:3030  # admin / admin
```

---

## 🗄️ Database

```bash
# Run migrations
docker-compose exec api npx prisma migrate deploy

# Access database
docker-compose exec postgres psql -U spravio -d spravio_production

# Create backup
./scripts/backup-database.sh production

# List backups
ls -lh backups/

# Restore from backup
./scripts/restore-database.sh backups/spravio_prod_20240101_120000.sql.gz production

# Check connection count
docker-compose exec postgres psql -U spravio -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 🔄 Service Management

```bash
# Restart all services
docker-compose restart

# Restart API only
docker-compose restart api

# Stop all
docker-compose down

# Start all
docker-compose up -d

# View running containers
docker-compose ps

# Pull latest images
docker-compose pull

# Remove old images
docker image prune -a -f
```

---

## 🔍 Debugging

```bash
# API container shell
docker-compose exec api sh

# Run command in API
docker-compose exec api node -v
docker-compose exec api npx prisma -v

# Check environment variables
docker-compose exec api env | grep DATABASE

# Test database connection
docker-compose exec api node -e "require('@prisma/client').PrismaClient().user.count().then(console.log)"

# Check network
docker-compose exec api nc -zv postgres 5432
docker-compose exec api nc -zv redis 6379
```

---

## 📦 Updates

```bash
# Update dependencies (on dev machine)
pnpm update --latest

# Rebuild images after code changes
docker-compose build --no-cache

# Deploy updated images
./deploy.sh latest
```

---

## 🔐 Security

```bash
# Check for vulnerabilities
pnpm audit
pnpm audit fix

# Generate new secrets
bash scripts/generate-secrets.sh

# View failed login attempts
docker-compose logs api | grep INVALID_CREDENTIALS

# View rate limit hits
docker-compose logs api | grep "Rate limit exceeded"
```

---

## 🧹 Cleanup

```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes (CAREFUL!)
docker volume prune -f

# Full cleanup (CAREFUL!)
docker system prune -a --volumes -f

# Clean old backups (keeps last 30 days)
find backups/ -name "*.sql.gz" -mtime +30 -delete

# Check disk usage
df -h
docker system df
```

---

## 📈 Performance

```bash
# Check slow queries in PostgreSQL
docker-compose exec postgres psql -U spravio -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Redis stats
docker-compose exec redis redis-cli INFO stats

# API memory usage
docker stats api --no-stream

# Connection pool stats (if using PgBouncer)
docker-compose exec pgbouncer psql -p 6432 -U spravio pgbouncer -c "SHOW POOLS;"
```

---

## 🚨 Emergency Procedures

### Site Down
```bash
# 1. Check health
curl http://localhost:3010/health

# 2. Check containers
docker-compose ps

# 3. Check logs
docker-compose logs --tail=100 api

# 4. Restart
docker-compose restart api

# 5. Rollback if needed
./deploy.sh <previous-version>
```

### Database Issues
```bash
# 1. Check DB health
docker-compose exec postgres pg_isready

# 2. Check connections
docker-compose exec postgres psql -U spravio -c "SELECT count(*) FROM pg_stat_activity;"

# 3. Check disk space
df -h

# 4. Restart if needed
docker-compose restart postgres

# 5. Restore from backup
./scripts/restore-database.sh backups/latest.sql.gz production
```

### High Memory
```bash
# 1. Check usage
docker stats

# 2. Identify culprit
docker stats --no-stream | sort -k7 -h

# 3. Restart service
docker-compose restart api

# 4. Check for leaks in Sentry
open https://sentry.io

# 5. Scale up if needed (upgrade VPS)
```

### Out of Disk Space
```bash
# 1. Check usage
df -h
docker system df

# 2. Clean logs
docker system prune -a --volumes -f

# 3. Remove old backups
find backups/ -name "*.sql.gz" -mtime +7 -delete

# 4. Clean old images
docker image prune -a -f

# 5. Expand disk if needed
```

---

## 🔗 Useful Links

- **Health**: `https://api.yourdomain.com/health/detailed`
- **Grafana**: `http://your-server:3030`
- **Prometheus**: `http://your-server:9090`
- **Sentry**: `https://sentry.io/organizations/your-org/projects/spravio-api/`
- **GitHub Actions**: `https://github.com/your-org/spravio/actions`
- **Docker Registry**: `https://github.com/your-org/spravio/pkgs/container/spravio-api`

---

## 📚 Documentation

- **Production Guide**: `docs/PRODUCTION.md`
- **Logging Guide**: `docs/LOGGING.md`
- **PgBouncer Guide**: `docs/PGBOUNCER.md`
- **Summary**: `docs/PRODUCTION-READY-SUMMARY.md`

---

**Last Updated**: April 18, 2026
