#!/bin/bash
set -e
# Deploy orquestador — ejecutar en el VPS
# Orden: 1. Zentramind (crea zentramind-net) → 2. EventRoll (se conecta a la red)

ZENTRAMIND_DIR="/var/www/zentramind"
EVENTROLL_DIR="/var/www/eventroll"

echo "========================================="
echo "  Deploy Zentramind + EventRoll"
echo "========================================="

if [ ! -d "$ZENTRAMIND_DIR" ]; then
  echo "ERROR: $ZENTRAMIND_DIR no existe. Cloná Zentramind primero."
  exit 1
fi

if [ ! -d "$EVENTROLL_DIR" ]; then
  echo "ERROR: $EVENTROLL_DIR no existe. Cloná EventRoll primero."
  exit 1
fi

echo ""
echo "==> [1/2] Deploy Zentramind..."
cd "$ZENTRAMIND_DIR"
if [ ! -f "deploy.sh" ]; then
  echo "ERROR: deploy.sh no encontrado en $ZENTRAMIND_DIR"
  exit 1
fi
bash deploy.sh

echo ""
echo "==> [2/2] Deploy EventRoll..."
cd "$EVENTROLL_DIR"
bash deploy.sh

echo ""
echo "========================================="
echo "  Deploy completado"
echo "  Zentramind:  https://zentramid.eu.cc"
echo "  EventRoll:   https://eventroll.zentramid.eu.cc"
echo "========================================="
