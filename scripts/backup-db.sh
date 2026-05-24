#!/bin/bash
# backup-db.sh — Backup de PostgreSQL
# Uso: ./scripts/backup-db.sh
# Agregar a crontab: 0 2 * * * /ruta/EventRoll/scripts/backup-db.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

BACKUP_DIR="./backups"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "=== EventRoll: Backup BD ==="

docker compose -f docker-compose.yml exec -T db pg_dump -U eventroll eventroll > "$BACKUP_DIR/eventroll_$TIMESTAMP.sql"

gzip "$BACKUP_DIR/eventroll_$TIMESTAMP.sql"

find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup: eventroll_$TIMESTAMP.sql.gz"
