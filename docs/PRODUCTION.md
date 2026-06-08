# Production Deployment Guide - Spravio

## 📋 Pre-Deployment Checklist

### Security
- [ ] All secrets generated with `openssl rand -hex 32`
- [ ] `.env.production` created with production values
- [ ] CORS origins configured to production domains only
- [ ] Rate limiting enabled (automatic in production)
- [ ] SSL/TLS certificates configured (via Traefik + Let's Encrypt)
- [ ] Database password is strong (16+ characters)
- [ ] JWT secret is cryptographically secure
- [ ] Sentry DSN configured for error tracking

### Infrastructure
- [ ] VPS provisioned (minimum 4GB RAM, 2 CPU cores)
- [ ] Docker and Docker Compose installed
- [ ] DNS records configured (A records for domain and api subdomain)
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] SSH key-based auth enabled, password auth disabled
- [ ] Traefik reverse proxy running on external `proxy` network
- [ ] PostgreSQL data directory has adequate disk space (10GB+)

### Code
- [ ] All tests passing (`pnpm test`)
- [ ] Type check passing (`pnpm typecheck`)
- [ ] Lint passing (`pnpm lint`)
- [ ] Docker images build successfully
- [ ] Database migrations applied and tested
- [ ] Environment variables documented

### Monitoring
- [ ] Sentry configured for both API and Web
- [ ] Health endpoints verified (`/health`, `/ready`, `/live`)
- [ ] Uptime monitoring configured (optional but recommended)
- [ ] Log aggregation configured (optional)
- [ ] Backup cron job scheduled

---

## 🚀 Initial Server Setup (One-Time)

### 1. Provision VPS

Recommended providers:
- **Hetzner Cloud**: €4.15/mo (CX22: 2 vCPU, 4GB RAM, 40GB SSD)
- **DigitalOcean**: $24/mo (2 vCPU, 4GB RAM, 80GB SSD)
- **Linode**: $24/mo (2 vCPU, 4GB RAM, 80GB SSD)

### 2. Initial Server Configuration

```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Install Docker Compose
apt install docker-compose-plugin -y

# Create deploy directory
mkdir -p /opt/spravio
cd /opt/spravio

# Create external network for Traefik
docker network create proxy 2>/dev/null || true
```

### 3. Configure Firewall

```bash
# Install UFW
apt install ufw -y

# Allow SSH (change 22 to your custom port if needed)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Verify
ufw status
```

### 4. Setup Traefik (Reverse Proxy)

Create `/opt/traefik/docker-compose.yml`:

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    restart: unless-stopped
    command:
      - --api.dashboard=true
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencrypt.acme.email=admin@yourdomain.com
      - --certificatesresolvers.letsencrypt.acme.storage=/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./acme.json:/acme.json
    networks:
      - proxy

networks:
  proxy:
    external: true
```

```bash
cd /opt/traefik
touch acme.json
chmod 600 acme.json
docker-compose up -d
```

### 5. Deploy Application Files

From your local machine:

```bash
# Copy docker-compose.prod.yml
scp docker-compose.prod.yml root@your-server:/opt/spravio/docker-compose.yml

# Copy deploy script
scp scripts/deploy.sh root@your-server:/opt/spravio/
ssh root@your-server "chmod +x /opt/spravio/deploy.sh"
```

### 6. Configure Environment Variables

On the server, create `/opt/spravio/.env.production`:

```bash
# Generate secrets
openssl rand -hex 32  # Use for JWT_SECRET
openssl rand -hex 16  # Use for PORTAL_SECRET
openssl rand -hex 16  # Use for NEXTAUTH_SECRET
openssl rand -hex 16  # Use for POSTGRES_PASSWORD
openssl rand -hex 16  # Use for REDIS_PASSWORD

# Edit .env
nano /opt/spravio/.env
```

Copy from `.env.production.example` and fill in all values.

### 7. Setup GitHub Container Registry Authentication

```bash
# Create GitHub Personal Access Token with `read:packages` scope
# Then login to GHCR on the server:
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### 8. Initial Deployment

```bash
cd /opt/spravio
./deploy.sh latest
```

### 9. Verify Deployment

```bash
# Check containers
docker-compose ps

# Check logs
docker-compose logs -f

# Test health endpoint
curl http://localhost:3010/health
curl https://api.yourdomain.com/health
curl https://yourdomain.com
```

### 10. Setup Automated Backups

```bash
# Copy backup scripts
scp scripts/backup-database.sh root@your-server:/opt/spravio/scripts/
scp scripts/restore-database.sh root@your-server:/opt/spravio/scripts/
scp scripts/setup-backup-cron.sh root@your-server:/opt/spravio/scripts/

# Make executable
ssh root@your-server "chmod +x /opt/spravio/scripts/*.sh"

# Setup cron job (daily at 2 AM)
ssh root@your-server "/opt/spravio/scripts/setup-backup-cron.sh"
```

---

## 🔄 Continuous Deployment

### GitHub Actions (Automated)

Deployments are automated via GitHub Actions when you push to `main`:

1. Code is pushed to `main` branch
2. CI runs (lint, typecheck, test)
3. Docker images are built and pushed to GHCR
4. Images are deployed to production server via SSH
5. Database migrations run automatically
6. Health check verifies deployment

**Required GitHub Secrets:**

Go to `Settings > Secrets > Actions` and add:

- `VPS_HOST`: Your server IP or domain
- `VPS_USER`: SSH user (usually `root`)
- `VPS_SSH_KEY`: Private SSH key for authentication
- `NEXT_PUBLIC_API_URL`: `https://api.yourdomain.com` (or configure as variable)

### Manual Deployment

```bash
# SSH into server
ssh root@your-server

# Deploy latest
cd /opt/spravio
./deploy.sh latest

# Deploy specific version
./deploy.sh v1.2.3
./deploy.sh abc123  # Git SHA
```

---

## 🔧 Maintenance

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web

# Last 100 lines
docker-compose logs --tail=100 api
```

### Database Management

```bash
# Run migrations
docker-compose exec api npx prisma migrate deploy

# Access database
docker-compose exec postgres psql -U spravio -d spravio_production

# Create backup
./scripts/backup-database.sh production

# Restore from backup
./scripts/restore-database.sh backups/spravio_prod_20240101_120000.sql.gz production
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
docker-compose restart web

# Rebuild and restart (if code changed)
./deploy.sh latest
```

### Update Environment Variables

```bash
# Edit .env
nano /opt/spravio/.env

# Restart to apply
docker-compose restart
```

### Resource Monitoring

```bash
# Container stats
docker stats

# Disk usage
df -h
docker system df

# Clean old images
docker image prune -a -f
```

---

## 🚨 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs api

# Check container status
docker-compose ps

# Verify environment
docker-compose exec api env | grep DATABASE_URL

# Test database connection
docker-compose exec postgres pg_isready
```

### Database Connection Errors

```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection from API container
docker-compose exec api nc -zv postgres 5432
```

### SSL Certificate Issues

```bash
# Check Traefik logs
docker-compose -f /opt/traefik/docker-compose.yml logs

# Verify DNS
dig yourdomain.com
dig api.yourdomain.com

# Force cert renewal
docker-compose -f /opt/traefik/docker-compose.yml restart
```

### Out of Memory

```bash
# Check memory usage
free -h
docker stats

# Restart services
docker-compose restart

# If persistent, upgrade VPS or optimize queries
```

### Rollback to Previous Version

```bash
# Find previous image SHA from deployment logs
cat /opt/spravio/deploy.log

# Deploy previous version
./deploy.sh <previous-sha>
```

---

## 📊 Monitoring

### Health Checks

- **Basic**: `https://api.yourdomain.com/health`
- **Detailed**: `https://api.yourdomain.com/health/detailed`
- **Kubernetes-style readiness**: `https://api.yourdomain.com/ready`
- **Kubernetes-style liveness**: `https://api.yourdomain.com/live`

### Metrics (Optional)

Run Prometheus + Grafana stack:

```bash
cd /opt/spravio
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana
open http://your-server-ip:3030
# Login: admin / admin
```

### Uptime Monitoring

Use external services:
- **UptimeRobot**: Free for 50 monitors
- **Pingdom**: Paid, comprehensive
- **Better Uptime**: Modern, generous free tier
- **StatusCake**: Free tier available

Configure to ping `https://api.yourdomain.com/health` every 5 minutes.

---

## 🔒 Security Best Practices

1. **Keep secrets secret**: Never commit `.env.production` to git
2. **Regular updates**: `apt update && apt upgrade -y` monthly
3. **Monitor logs**: Check for unusual activity weekly
4. **Backup verification**: Test restore process quarterly
5. **Security patches**: Subscribe to security mailing lists for Docker, Node.js, PostgreSQL
6. **Access control**: Use SSH keys only, disable root login after setup
7. **Audit dependencies**: Run `pnpm audit` weekly
8. **Rate limiting**: Monitor for abuse in logs

---

## 📝 Runbook

### Emergency Procedures

**Site is Down:**
1. Check health endpoint: `curl https://api.yourdomain.com/health`
2. Check container status: `docker-compose ps`
3. Check logs: `docker-compose logs --tail=100 api`
4. Restart if needed: `docker-compose restart`
5. Escalate if not resolved in 5 minutes

**Database Issues:**
1. Check connection: `docker-compose exec postgres pg_isready`
2. Check disk space: `df -h`
3. Check logs: `docker-compose logs postgres`
4. Restart PostgreSQL: `docker-compose restart postgres`
5. Restore from backup if corrupted

**High Memory Usage:**
1. Check stats: `docker stats`
2. Identify culprit: Usually API or database
3. Restart service: `docker-compose restart api`
4. Check for memory leaks in Sentry
5. Scale up VPS if persistent

**Deployment Failed:**
1. Check deploy logs: `cat /opt/spravio/deploy.log`
2. Verify images exist: `docker images | grep spravio`
3. Check disk space: `df -h`
4. Rollback: `./deploy.sh <previous-version>`
5. Investigate issue before re-deploying

---

## 📞 Support

For issues not covered here:
1. Check application logs in Sentry
2. Review deployment logs: `cat /opt/spravio/deploy.log`
3. Check GitHub Issues
4. Contact development team
