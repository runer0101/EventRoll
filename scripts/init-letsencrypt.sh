#!/bin/bash
# init-letsencrypt.sh — Obtener certificados SSL por primera vez
# Uso: ./scripts/init-letsencrypt.sh
# Requiere: .env configurado con DOMAIN y LETSENCRYPT_EMAIL
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

source .env 2>/dev/null || {
  echo "ERROR: Archivo .env no encontrado. Ejecuta: cp .env.example .env"
  exit 1
}

if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "localhost" ]; then
  echo "ERROR: DOMAIN no configurado en .env (vale 'localhost')"
  echo "Configura DOMAIN=tudominio.com en .env y vuelve a intentar."
  exit 1
fi

if [ -z "$LETSENCRYPT_EMAIL" ] || [ "$LETSENCRYPT_EMAIL" = "admin@tudominio.com" ]; then
  echo "ERROR: LETSENCRYPT_EMAIL no configurado en .env"
  echo "Configura LETSENCRYPT_EMAIL=tu@email.com en .env y vuelve a intentar."
  exit 1
fi

echo "=== EventRoll — Inicializar Let's Encrypt para $DOMAIN ==="

echo "[1/4] Verificando que el stack esté corriendo en modo HTTP..."
if ! docker compose ps frontend --format json | grep -q .; then
  echo "Iniciando stack (modo HTTP sin SSL)..."
  docker compose -f docker-compose.yml up -d db backend frontend
  echo "Esperando servicios..."
  sleep 10
fi

echo "[2/4] Verificando conectividad HTTP..."
curl -s http://localhost/health-nginx > /dev/null || {
  echo "ERROR: No se puede acceder a http://localhost/health-nginx"
  echo "Verifica que el frontend esté corriendo."
  exit 1
}

echo "[3/4] Obteniendo certificados SSL con Let's Encrypt..."
docker compose -f docker-compose.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d "$DOMAIN" \
  --email "$LETSENCRYPT_EMAIL" \
  --agree-tos \
  --non-interactive

echo "[4/4] Reiniciando frontend con HTTPS..."
docker compose -f docker-compose.yml restart frontend
sleep 3

echo ""
echo "=== SSL configurado correctamente ==="
echo "Tu sitio ahora está disponible en: https://$DOMAIN"
echo ""
echo "Para renovar certs automáticamente, agrega al crontab del host:"
echo "  0 3 * * * cd $ROOT_DIR && docker compose -f docker-compose.yml run --rm certbot renew --quiet --webroot --webroot-path=/var/www/certbot && docker compose -f docker-compose.yml kill -s HUP frontend"
