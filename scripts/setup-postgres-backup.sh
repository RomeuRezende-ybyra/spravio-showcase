#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Spravio — PostgreSQL Automated Backup Setup
# Configura backup diário automático do banco de dados
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BACKUP_DIR="/opt/spravio/backups"
RETENTION_DAYS=30
POSTGRES_CONTAINER="spravio-postgres-1"

echo "🗄️  Spravio PostgreSQL Backup Setup"
echo "====================================="
echo ""
echo "Configurações:"
echo "  - Diretório: $BACKUP_DIR"
echo "  - Retenção: $RETENTION_DAYS dias"
echo "  - Container: $POSTGRES_CONTAINER"
echo ""

# ─── Criar diretório de backups ──────────────────────────────────────────────
echo "📁 Criando diretório de backups..."
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
echo "✅ Diretório criado: $BACKUP_DIR"
echo ""

# ─── Criar script de backup ──────────────────────────────────────────────────
echo "📝 Criando script de backup..."
cat > /opt/spravio/backup-postgres.sh <<'BACKUP_SCRIPT'
#!/usr/bin/env bash
set -euo pipefail

# Configurações
BACKUP_DIR="/opt/spravio/backups"
POSTGRES_CONTAINER="spravio-postgres-1"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/spravio_backup_${TIMESTAMP}.sql.gz"
LOG_FILE="${BACKUP_DIR}/backup.log"

log() {
  echo "[$(date -Iseconds)] $*" | tee -a "$LOG_FILE"
}

log "=== Backup iniciado ==="

# Verificar se container existe e está rodando
if ! docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
  log "ERROR: Container ${POSTGRES_CONTAINER} não está rodando"
  exit 1
fi

# Executar pg_dump dentro do container
log "Executando pg_dump..."
docker exec "$POSTGRES_CONTAINER" pg_dump \
  -U "${POSTGRES_USER:-postgres}" \
  -d "${POSTGRES_DB:-trackingproject}" \
  --clean \
  --if-exists \
  --verbose \
  2>> "$LOG_FILE" \
  | gzip > "$BACKUP_FILE"

# Verificar se backup foi criado
if [ ! -f "$BACKUP_FILE" ]; then
  log "ERROR: Backup não foi criado"
  exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Backup criado: $BACKUP_FILE ($BACKUP_SIZE)"

# Limpar backups antigos
log "Limpando backups com mais de ${RETENTION_DAYS} dias..."
find "$BACKUP_DIR" -name "spravio_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
REMAINING=$(find "$BACKUP_DIR" -name "spravio_backup_*.sql.gz" | wc -l)
log "Backups restantes: $REMAINING"

log "=== Backup concluído com sucesso ==="
echo ""
BACKUP_SCRIPT

chmod +x /opt/spravio/backup-postgres.sh
echo "✅ Script criado: /opt/spravio/backup-postgres.sh"
echo ""

# ─── Criar script de restore ─────────────────────────────────────────────────
echo "📝 Criando script de restore..."
cat > /opt/spravio/restore-postgres.sh <<'RESTORE_SCRIPT'
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/opt/spravio/backups"
POSTGRES_CONTAINER="spravio-postgres-1"

if [ $# -eq 0 ]; then
  echo "Uso: $0 <arquivo_backup.sql.gz>"
  echo ""
  echo "Backups disponíveis:"
  ls -lh "$BACKUP_DIR"/spravio_backup_*.sql.gz 2>/dev/null || echo "  (nenhum backup encontrado)"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Arquivo não encontrado: $BACKUP_FILE"
  exit 1
fi

echo "⚠️  ATENÇÃO: Esta operação irá SUBSTITUIR o banco de dados atual!"
echo "Backup: $BACKUP_FILE"
echo ""
read -p "Tem certeza? (digite 'SIM' para confirmar): " confirm

if [ "$confirm" != "SIM" ]; then
  echo "Operação cancelada."
  exit 0
fi

echo "Restaurando backup..."
gunzip -c "$BACKUP_FILE" | docker exec -i "$POSTGRES_CONTAINER" psql \
  -U "${POSTGRES_USER:-postgres}" \
  -d "${POSTGRES_DB:-trackingproject}"

echo "✅ Restore concluído!"
echo "⚠️  Reinicie a aplicação: docker compose restart api web"
RESTORE_SCRIPT

chmod +x /opt/spravio/restore-postgres.sh
echo "✅ Script criado: /opt/spravio/restore-postgres.sh"
echo ""

# ─── Configurar cron job ─────────────────────────────────────────────────────
echo "⏰ Configurando cron job..."

# Backup diário às 3:00 AM
CRON_JOB="0 3 * * * /opt/spravio/backup-postgres.sh"

# Verificar se já existe
if crontab -l 2>/dev/null | grep -q "backup-postgres.sh"; then
  echo "⚠️  Cron job já existe. Pulando..."
else
  # Adicionar ao crontab
  (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
  echo "✅ Cron job adicionado: Backup diário às 3:00 AM"
fi
echo ""

# ─── Testar backup imediatamente ────────────────────────────────────────────
echo "🧪 Executando backup de teste..."
/opt/spravio/backup-postgres.sh

if [ $? -eq 0 ]; then
  echo "✅ Backup de teste bem-sucedido!"
else
  echo "❌ Backup de teste falhou. Verifique os logs em $BACKUP_DIR/backup.log"
  exit 1
fi
echo ""

# ─── Resumo ──────────────────────────────────────────────────────────────────
echo "════════════════════════════════════════════════════════════════"
echo "✅ Backup automático configurado com sucesso!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Informações:"
echo "  - Backups: $BACKUP_DIR"
echo "  - Agendamento: Diariamente às 3:00 AM"
echo "  - Retenção: $RETENTION_DAYS dias"
echo "  - Log: $BACKUP_DIR/backup.log"
echo ""
echo "📝 Comandos úteis:"
echo "  - Backup manual: /opt/spravio/backup-postgres.sh"
echo "  - Restore: /opt/spravio/restore-postgres.sh <arquivo>"
echo "  - Ver backups: ls -lh $BACKUP_DIR"
echo "  - Ver log: tail -f $BACKUP_DIR/backup.log"
echo "  - Editar cron: crontab -e"
echo ""
echo "⚠️  IMPORTANTE: Configure backup externo (S3, B2, etc.) para redundância!"
echo ""
