#!/bin/bash
set -e
# Ejecutar en el VPS para expandir el certificado SSL de zentramid.eu.cc
# y cubrir el subdominio eventroll.zentramid.eu.cc
#
# Requisitos:
#   - certbot instalado en el host
#   - nginx de Zentramind corriendo en Docker (contenedor: zentramind-nginx)
#   - DNS apuntando al VPS para ambos dominios

DOMAIN="zentramid.eu.cc"
SUBDOMAIN="eventroll.zentramid.eu.cc"

echo "==> Verificando DNS..."
for d in "$DOMAIN" "www.$DOMAIN" "$SUBDOMAIN"; do
  if ! host "$d" > /dev/null 2>&1; then
    echo "ADVERTENCIA: $d no resuelve DNS. Asegurate de que el registro DNS esté configurado."
  else
    echo "  $d OK"
  fi
done

echo ""
echo "==> Expandiendo certificado SSL para incluir $SUBDOMAIN..."
certbot --nginx \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  -d "$SUBDOMAIN"

echo ""
echo "==> Recargando nginx de Zentramind..."
if docker ps --format '{{.Names}}' | grep -q 'zentramind-nginx'; then
  docker exec zentramind-nginx nginx -s reload
  echo "  nginx recargado OK"
else
  echo "ERROR: Contenedor zentramind-nginx no encontrado. ¿Está corriendo Zentramind?"
  exit 1
fi

echo ""
echo "==> SSL configurado. Verificá: https://$SUBDOMAIN"
