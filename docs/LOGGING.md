# Logging Guide - Spravio

## Overview

Spravio uses structured JSON logging via Pino for both API and background jobs. All logs include request IDs for distributed tracing.

## Log Levels

- **fatal**: System crash, immediate action required
- **error**: Error conditions that need attention
- **warn**: Warning conditions that should be monitored
- **info**: Informational messages (default in production)
- **debug**: Debug messages (default in development)
- **trace**: Very detailed debug information

## Production Logging

### Structured JSON Format

All production logs are in JSON format for easy parsing:

```json
{
  "level": 30,
  "time": 1704067200000,
  "pid": 1,
  "hostname": "api-container",
  "reqId": "550e8400-e29b-41d4-a716-446655440000",
  "req": {
    "method": "POST",
    "url": "/api/projects",
    "headers": {
      "host": "api.spravio.io",
      "user-agent": "Mozilla/5.0...",
      "x-request-id": "550e8400-e29b-41d4-a716-446655440000"
    },
    "remoteAddress": "192.168.1.1"
  },
  "msg": "incoming request"
}
```

### Request Tracing

Every request gets a unique ID (`x-request-id`) that's:
1. Auto-generated if not provided
2. Included in all logs for that request
3. Returned in response headers
4. Passed to downstream services

**Example:**
```bash
curl -H "x-request-id: my-trace-123" https://api.spravio.io/health
```

All logs for this request will include `"reqId": "my-trace-123"`.

### Viewing Logs in Production

**Docker Compose:**
```bash
# All logs
docker-compose logs -f

# API only
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api

# Since specific time
docker-compose logs --since 2024-01-01T00:00:00 api
```

**Search logs by request ID:**
```bash
docker-compose logs api | grep "my-trace-123"
```

**Filter by log level:**
```bash
# Errors only
docker-compose logs api | grep '"level":50'

# Warnings and errors
docker-compose logs api | grep -E '"level":(40|50)'
```

## Log Rotation

Logs are rotated daily to prevent disk space issues.

### Docker Logging Driver

Configure in `docker-compose.prod.yml`:

```yaml
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "10"
```

This keeps last 10 files of 10MB each = 100MB total per service.

### Manual Cleanup

```bash
# Clean old logs
docker system prune --volumes -f

# Remove all logs
truncate -s 0 $(docker inspect --format='{{.LogPath}}' <container_name>)
```

## Centralized Logging (Optional)

For production at scale, consider:

### Option 1: Loki + Grafana

```yaml
# docker-compose.logging.yml
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./promtail-config.yml:/etc/promtail/config.yml
```

### Option 2: CloudWatch (AWS)

Install AWS CloudWatch agent on VPS:
```bash
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

### Option 3: File-based with Logrotate

```bash
# /etc/logrotate.d/spravio
/opt/spravio/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    missingok
    create 0644 root root
    postrotate
        docker-compose -f /opt/spravio/docker-compose.yml restart api web
    endscript
}
```

## Development Logging

In development, use pretty printing:

```bash
# API logs are piped through pino-pretty automatically
pnpm dev:api

# Manual pretty printing
docker-compose logs -f api | pnpm exec pino-pretty
```

## Best Practices

### 1. Always include context

```typescript
// ❌ Bad
fastify.log.error('User not found')

// ✅ Good
fastify.log.error({ userId: 123, email: 'user@example.com' }, 'User not found')
```

### 2. Use appropriate levels

```typescript
// ✅ Correct usage
fastify.log.debug({ query }, 'Database query executed')
fastify.log.info({ userId }, 'User logged in')
fastify.log.warn({ threshold: 90, current: 85 }, 'Approaching rate limit')
fastify.log.error({ err, userId }, 'Failed to create project')
fastify.log.fatal({ err }, 'Database connection lost')
```

### 3. Don't log sensitive data

```typescript
// ❌ NEVER log passwords, tokens, or PII
fastify.log.info({ password, creditCard }, 'User data')

// ✅ Redact sensitive fields
fastify.log.info({ email: user.email, id: user.id }, 'User data')
```

### 4. Add context to errors

```typescript
try {
  await createProject(data)
} catch (error) {
  fastify.log.error({
    err: error,
    projectData: data,
    userId: req.user.id,
  }, 'Failed to create project')
  throw error
}
```

## Monitoring Logs

### Key metrics to track:

1. **Error rate**: `grep '"level":50' | wc -l`
2. **Response times**: Extract from request logs
3. **Failed auth attempts**: `grep 'INVALID_CREDENTIALS'`
4. **Rate limit hits**: `grep 'Rate limit exceeded'`

### Alerting

Set up alerts for:
- Error rate > 5% of requests
- Fatal errors (level 60)
- No logs for > 5 minutes (service down)
- Repeated errors from same source

## Troubleshooting

### No logs appearing

```bash
# Check logger configuration
docker-compose exec api node -e "console.log(require('./dist/app.js').buildApp().log)"

# Check Docker logging driver
docker inspect <container> | grep LogConfig
```

### Disk full from logs

```bash
# Find large log files
find /var/lib/docker/containers -name "*.log" -size +100M

# Clean up
docker system prune --volumes -f
```

### Missing request IDs

Ensure client sends `x-request-id` header or Fastify will generate one automatically.
