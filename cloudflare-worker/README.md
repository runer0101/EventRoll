# EventRoll — Cloudflare Worker Proxy

Proxy inverso que protege el backend en Render.com free tier contra abuso.

## Protecciones

- Rate limiting por IP (60 req / 15 min)
- Bloqueo de ASNs de data centers (AWS, GCP, Azure, DO, etc.)
- Validación de Origin header
- /health siempre permitido (wake-up de Render)

## Despliegue

1. Instalar Wrangler:
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. Desplegar:
   ```bash
   cd cloudflare-worker
   npx wrangler deploy
   ```

3. Actualizar el frontend:
   - Cambiar `VITE_API_URL` en GitHub Secrets a `https://eventroll-proxy.<tu-subdominio>.workers.dev/api`
   - Redesplegar el frontend

4. Actualizar CORS en Render:
   - Agregar la URL del Worker a `CORS_ORIGIN` (separado por coma si mantienes ambos)

## Variables de entorno (opcional)

Si necesitas customizar, edita las constantes al inicio de `worker.js`.
