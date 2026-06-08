# PgBouncer Setup Guide (Optional)

## Overview

PgBouncer is a lightweight connection pooler for PostgreSQL. Use it when:
- You have hundreds of concurrent connections
- Your API instances scale horizontally (multiple containers)
- You need better connection reuse across services

For single-server deployments with <100 concurrent connections, **Prisma's built-in pooling is sufficient**.

## When to Use PgBouncer

### ✅ Use PgBouncer if:
- Running multiple API instances (horizontal scaling)
- Expect >100 concurrent database connections
- Need centralized connection management
- Database has strict connection limits

### ❌ Skip PgBouncer if:
- Single API instance
- <100 expected concurrent connections
- Just starting out (add later when needed)
- Using managed PostgreSQL with built-in pooling (RDS, Cloud SQL)

## Setup

### 1. Add PgBouncer to docker-compose.prod.yml

```yaml
services:
  pgbouncer:
    image: edoburu/pgbouncer:latest
    restart: unless-stopped
    environment:
      DATABASE_URL: "postgresql://spravio:${POSTGRES_PASSWORD}@postgres:5432/spravio_production"
      POOL_MODE: transaction
      MAX_CLIENT_CONN: 1000
      DEFAULT_POOL_SIZE: 25
      MIN_POOL_SIZE: 5
      RESERVE_POOL_SIZE: 5
      RESERVE_POOL_TIMEOUT: 3
      MAX_DB_CONNECTIONS: 50
      MAX_USER_CONNECTIONS: 50
      SERVER_IDLE_TIMEOUT: 600
      SERVER_LIFETIME: 3600
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "pg_isready", "-h", "127.0.0.1", "-p", "6432"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    # ... existing config ...
    environment:
      # Change from postgres:5432 to pgbouncer:6432
      DATABASE_URL: postgresql://spravio:${POSTGRES_PASSWORD}@pgbouncer:6432/spravio_production
    depends_on:
      pgbouncer:
        condition: service_healthy
```

### 2. Update .env.production

```bash
# Use PgBouncer instead of direct Postgres connection
DATABASE_URL=postgresql://spravio:YOUR_PASSWORD@pgbouncer:6432/spravio_production
```

### 3. Configure Pool Mode

PgBouncer has three pool modes:

**Transaction mode (recommended for Prisma):**
```yaml
POOL_MODE: transaction
```
- Connection returned to pool after transaction
- Best for stateless applications like Prisma
- Highest throughput

**Session mode:**
```yaml
POOL_MODE: session
```
- Connection kept for entire client session
- Use if you have session-level settings
- Lower throughput but more compatible

**Statement mode:**
```yaml
POOL_MODE: statement
```
- Connection returned after each statement
- Highest pooling but breaks prepared statements
- Not recommended for Prisma

### 4. Tune Pool Sizes

Based on your server resources:

**Small (4GB RAM, 2 vCPU):**
```yaml
DEFAULT_POOL_SIZE: 10
MAX_DB_CONNECTIONS: 25
MAX_CLIENT_CONN: 100
```

**Medium (8GB RAM, 4 vCPU):**
```yaml
DEFAULT_POOL_SIZE: 25
MAX_DB_CONNECTIONS: 50
MAX_CLIENT_CONN: 500
```

**Large (16GB RAM, 8 vCPU):**
```yaml
DEFAULT_POOL_SIZE: 50
MAX_DB_CONNECTIONS: 100
MAX_CLIENT_CONN: 1000
```

### 5. Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f pgbouncer
```

## Monitoring PgBouncer

### Check Stats

```bash
# Connect to PgBouncer admin
docker-compose exec pgbouncer psql -p 6432 -U spravio pgbouncer

# Show pools
SHOW POOLS;

# Show clients
SHOW CLIENTS;

# Show servers
SHOW SERVERS;

# Show stats
SHOW STATS;

# Show config
SHOW CONFIG;
```

### Key Metrics

- **cl_active**: Active client connections
- **cl_waiting**: Clients waiting for a connection
- **sv_active**: Active server connections to PostgreSQL
- **sv_idle**: Idle server connections in pool
- **sv_used**: Server connections assigned to clients

### Alerts to Set Up

1. **cl_waiting > 0**: Clients waiting (pool exhausted)
2. **sv_active near MAX_DB_CONNECTIONS**: Pool nearly full
3. **avgwait > 1s**: High average wait time

## Troubleshooting

### Clients Waiting for Connections

```bash
# Increase pool size
DEFAULT_POOL_SIZE: 50  # was 25
MAX_DB_CONNECTIONS: 100  # was 50
```

### "Too many connections" Error

```bash
# Check current connections
docker-compose exec postgres psql -U spravio -c "SELECT count(*) FROM pg_stat_activity;"

# Increase max_connections in PostgreSQL
docker-compose exec postgres psql -U spravio -c "ALTER SYSTEM SET max_connections = 200;"
docker-compose restart postgres
```

### PgBouncer Won't Start

```bash
# Check logs
docker-compose logs pgbouncer

# Verify DATABASE_URL format
docker-compose exec pgbouncer env | grep DATABASE_URL

# Test direct connection
docker-compose exec pgbouncer psql "$DATABASE_URL"
```

### Slow Queries

```bash
# Check if query is waiting for connection
SHOW POOLS;  # Look for cl_waiting

# Increase pool timeout
RESERVE_POOL_TIMEOUT: 10  # was 3

# Check PostgreSQL logs
docker-compose logs postgres | grep "slow query"
```

## Performance Tuning

### Application-Level Pooling

When using PgBouncer, reduce Prisma's connection pool:

```env
# In DATABASE_URL, set lower connection_limit since PgBouncer manages pooling
DATABASE_URL=postgresql://...@pgbouncer:6432/db?connection_limit=5
```

### Prepared Statements

In transaction mode, prepared statements work per-transaction:

```typescript
// ✅ Works fine
await prisma.user.findMany()

// ✅ Also works
await prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}`

// ❌ Avoid session-level settings (won't persist)
await prisma.$executeRaw`SET statement_timeout = 5000`
```

### Connection Reuse

PgBouncer is most beneficial when:
- Connections are short-lived (< 1 minute)
- High connection churn (many connects/disconnects)
- Multiple application instances

Less beneficial when:
- Long-lived connections (serverless not ideal)
- Low connection count (< 20)
- Single app instance

## Cost-Benefit Analysis

### Benefits:
- Handles 1000s of client connections with 50 DB connections
- Reduces connection overhead to PostgreSQL
- Centralized connection management
- Better resource utilization

### Costs:
- Extra layer of complexity
- Additional container resource usage (~50MB RAM)
- Slight latency overhead (~1ms per query)
- Debugging is harder (two connection layers)

## Migration Path

### Phase 1: No PgBouncer (Start Here)
- Use Prisma's built-in pooling
- Monitor connection count
- Set alerts for >80% of max_connections

### Phase 2: Add PgBouncer
- When connections regularly exceed 50
- When scaling to multiple API instances
- When connection errors occur during traffic spikes

### Phase 3: Optimize
- Tune pool sizes based on metrics
- Adjust timeouts and limits
- Consider read replicas for scale

## References

- [PgBouncer Official Docs](https://www.pgbouncer.org/)
- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [PostgreSQL Connection Limits](https://www.postgresql.org/docs/current/runtime-config-connection.html)
