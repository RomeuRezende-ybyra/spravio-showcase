#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Spravio — Production deploy script
# Runs on the VPS, triggered by GitHub Actions or manually.
#
# Usage: ./deploy.sh [IMAGE_TAG]
#   IMAGE_TAG defaults to "latest" if not provided.
#
# ─── VPS initial setup (one-time) ────────────────────────────────────────────
# 1. apt update && apt upgrade -y
# 2. curl -fsSL https://get.docker.com | sh
# 3. mkdir -p /opt/spravio
# 4. Copy files to /opt/spravio/:
#      - docker-compose.prod.yml → docker-compose.yml
#      - deploy.sh (chmod +x)
#      - .env (fill secrets — see .env.example in repo)
# 5. Ensure the external Docker network "proxy" exists (shared with Traefik)
# 6. DNS: A records for spravio.io and api.spravio.io → VPS IP
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DEPLOY_DIR="/opt/spravio"
LOG_FILE="${DEPLOY_DIR}/deploy.log"
IMAGE_TAG="${1:-latest}"
MAX_RETRIES=30
RETRY_INTERVAL=2

# Load .env and .env.ghcr (if exists) so all env vars are available
set -a
source "${DEPLOY_DIR}/.env"
[ -f "${DEPLOY_DIR}/.env.ghcr" ] && source "${DEPLOY_DIR}/.env.ghcr"
set +a

log() {
  echo "[$(date -Iseconds)] $*" | tee -a "$LOG_FILE"
}

log "=== Deploy started (tag: ${IMAGE_TAG}) ==="

cd "$DEPLOY_DIR"

# Export IMAGE_TAG so compose can use it
export IMAGE_TAG

# URL-encode POSTGRES_PASSWORD for DATABASE_URL (special chars like // break URL parsing)
urlencode() {
  local string="$1" encoded="" i c
  for (( i=0; i<${#string}; i++ )); do
    c="${string:$i:1}"
    case "$c" in
      [a-zA-Z0-9.~_-]) encoded+="$c" ;;
      *) encoded+=$(printf '%%%02X' "'$c") ;;
    esac
  done
  echo "$encoded"
}
export DATABASE_URL="postgresql://${POSTGRES_USER}:$(urlencode "${POSTGRES_PASSWORD}")@postgres:5432/${POSTGRES_DB}"

# ─── Pull pre-built images from GHCR ──────────────────────────────────────
log "Logging into GHCR..."
echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_USER}" --password-stdin

log "Pulling images..."
docker compose pull api web

# ─── Start database services first ──────────────────────────────────────────
log "Starting postgres and redis..."
docker compose up -d postgres redis

log "Waiting for postgres and redis healthchecks..."
for i in $(seq 1 30); do
  pg_ok=$(docker compose ps postgres --format '{{.Health}}' 2>/dev/null || echo "")
  rd_ok=$(docker compose ps redis --format '{{.Health}}' 2>/dev/null || echo "")
  if [ "$pg_ok" = "healthy" ] && [ "$rd_ok" = "healthy" ]; then
    log "Postgres and Redis are healthy"
    break
  fi
  if [ "$i" -eq 30 ]; then
    log "WARNING: Timed out waiting for DB healthchecks, proceeding anyway"
  fi
  sleep 2
done

# ─── Run database migrations ────────────────────────────────────────────────
log "Running Prisma migrations..."
docker compose run --rm api npx prisma migrate deploy || log "WARNING: Migration returned non-zero (may already be applied)"

# ─── Start all services ─────────────────────────────────────────────────────
log "Starting all services..."
docker compose up -d --remove-orphans

# ─── Health check ───────────────────────────────────────────────────────────
log "Waiting 5s for containers to initialize..."
sleep 5

log "Running health check..."
API_CONTAINER=$(docker compose ps -q api)

for i in $(seq 1 $MAX_RETRIES); do
  if docker exec "$API_CONTAINER" wget -qO- http://127.0.0.1:3010/health > /dev/null 2>&1; then
    log "Health check passed (attempt ${i}/${MAX_RETRIES})"
    log "=== Deploy succeeded ==="
    exit 0
  fi
  log "Health check attempt ${i}/${MAX_RETRIES} failed, retrying in ${RETRY_INTERVAL}s..."
  sleep "$RETRY_INTERVAL"
done

log "=== Deploy FAILED — health check did not pass after ${MAX_RETRIES} attempts ==="
log "--- API container logs ---"
docker compose logs --tail 50 api 2>&1 | tee -a "$LOG_FILE"
log "--- Web container logs ---"
docker compose logs --tail 20 web 2>&1 | tee -a "$LOG_FILE"
exit 1
