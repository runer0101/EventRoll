#!/bin/bash
set -e

# Deploy de EventRoll en VPS
# Requiere: .env configurado, Docker Compose, y la red zentramind-net creada
# Uso:     bash deploy.sh

REPO_DIR="/var/www/eventroll"

if [ ! -d "$REPO_DIR" ]; then
  echo "ERROR: $REPO_DIR no existe. Cloná el repo primero."
  exit 1
fi

cd "$REPO_DIR"

if [ ! -f ".env" ]; then
  echo "ERROR: .env no encontrado en $REPO_DIR."
  echo "  Copiá y configurá: cp .env.example .env"
  echo "  O usá .env.production como base: cp .env.production .env"
  exit 1
fi

echo "==> Pulling latest code..."
git pull --ff-only

echo "==> Building images..."
docker compose build backend frontend

echo "==> Starting services..."
docker compose -f docker-compose.yml -f docker-compose.vps.yml up -d

echo "==> Deploy completado"
docker compose ps
