#!/bin/bash
# deploy-vps.sh — Actualizar EventRoll en el VPS
# Uso: ./scripts/deploy-vps.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

echo "=== EventRoll: Deploy VPS ==="

echo "[1/5] Pull de cambios..."
git pull origin main

echo "[2/5] Rebuild y restart de servicios..."
docker compose -f docker-compose.yml up -d --build

echo "[3/5] Corriendo migraciones..."
docker compose -f docker-compose.yml exec -T backend node src/config/migrate-all.js

echo "[4/5] Recargando nginx para certificados renovados..."
docker compose -f docker-compose.yml kill -s HUP frontend 2>/dev/null || true

echo "[5/5] Limpiando imágenes viejas..."
docker image prune -f

echo ""
echo "=== Deploy completado ==="
