#!/bin/sh
set -e

DOMAIN=${DOMAIN:-_}

if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
  echo "[nginx-entrypoint] SSL certs found for ${DOMAIN}, enabling HTTPS"
  envsubst '${DOMAIN}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
else
  echo "[nginx-entrypoint] No SSL certs found, using HTTP-only config (ACME ready)"
  cp /etc/nginx/templates/default.init.conf /etc/nginx/conf.d/default.conf
fi

exec nginx -g "daemon off;"
