# Deploy

## Opciones de deploy

EventRoll soporta 3 modos de deploy:

| Modo | Frontend | Backend | Base de datos |
|------|----------|---------|---------------|
| **Desarrollo local** | Vite dev server (`:5173`) | Express (`:3000`) | PostgreSQL local |
| **Docker local** | nginx (`:80`) | Express (`:3000`) | PostgreSQL en contenedor |
| **VPS producción** | nginx en Docker | Express en Docker | PostgreSQL en Docker |

## Desarrollo local

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env   # Configurar DATABASE_URL, JWT_SECRET, etc.
npm run migrate         # Crear tablas
npm run dev             # Arranca en :3000

# Terminal 2 — Frontend
npm run dev             # Arranca en :5173
```

URLs:
- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

## Docker local

```bash
cp .env.example .env    # Configurar DB_PASSWORD, JWT_SECRET, CORS_ORIGIN
docker compose up -d    # Levanta db + backend + frontend
```

URLs:
- Frontend: `http://localhost`
- API: `http://localhost/api`
- Swagger: `http://localhost/api/docs`

Comandos útiles:
```bash
docker compose logs -f          # Ver logs
docker compose down             # Detener
docker compose down -v          # Detener y borrar datos
```

## Deploy en VPS

### Requisitos previos
- VPS con Docker y Docker Compose instalados
- Repositorio clonado en `/var/www/eventroll`
- Red Docker `zentramind-net` creada
- Archivo `.env` configurado (basado en `.env.production`)
- Clave SSH para acceso al servidor

### Deploy manual

```bash
ssh usuario@servidor
cd /var/www/eventroll
git pull --ff-only
docker compose -f docker-compose.yml -f docker-compose.vps.yml build backend frontend
docker compose -f docker-compose.yml -f docker-compose.vps.yml up -d
```

### Deploy automático (GitHub Actions)

Se puede configurar un workflow que haga SSH al VPS en cada push a `main`:

1. Configurar secrets en GitHub:
   - `VPS_HOST` — IP del servidor
   - `VPS_USER` — usuario SSH
   - `VPS_KEY` — clave privada SSH

2. El workflow ejecuta:
   ```bash
   ssh $VPS_USER@$VPS_HOST "cd /var/www/eventroll && git pull && docker compose build && docker compose up -d"
   ```

## Variables de entorno requeridas

### Backend

| Variable | Requerida | Descripción |
|----------|:---------:|-------------|
| `DATABASE_URL` | ✅ | URL de conexión PostgreSQL |
| `JWT_SECRET` | ✅ | Clave para firmar JWT (64+ caracteres) |
| `CORS_ORIGIN` | ✅ | Origen del frontend |
| `DEFAULT_ADMIN_EMAIL` | — | Email del admin creado por seed |
| `DEFAULT_ADMIN_PASSWORD` | — | Contraseña del admin (requerido en prod) |
| `PORT` | — | Puerto (default: 3000) |
| `NODE_ENV` | — | `development`, `test`, `production` |
| `SKIP_SEED` | — | `true` para omitir seed automático |

### Frontend (build)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base de la API |
| `VITE_BASE_URL` | Base path (default: `/`) |

## Servicios Docker

| Servicio | Imagen | Puerto interno | Descripción |
|---------|--------|---------------|-------------|
| `db` | `postgres:16-alpine` | 5432 | Base de datos |
| `backend` | Node.js 22 Alpine | 3000 | API REST |
| `frontend` | nginx Alpine | 80, 443 | App Vue + proxy |
| `certbot` | `certbot/certbot` | — | Renovación SSL (solo `--profile ssl`) |

## Redes Docker

- **default**: red interna para comunicación entre contenedores del stack
- **zentramind-net**: red externa compartida con el proxy reverso de Zentramind en VPS

## nginx

`nginx.conf.template` maneja:
- HTTPS con TLS 1.2/1.3 (certificados Let's Encrypt)
- Proxy `/api/` → `backend:3000` con headers de forward
- Static files del frontend con cache por tipo de archivo
- `try_files` para SPA fallback
- Health check endpoints: `/health`, `/health-nginx`

## Cloudflare Worker (GitHub Pages)

El worker en `cloudflare-worker/` actúa como proxy inverso para el deploy en GitHub Pages:
- Rate limiting por IP
- Bloqueo de ASNs de data centers
- Validación de Origin
- CORS headers
- Proxy transparente al backend de Render.com

Para deploy del worker:
```bash
cd cloudflare-worker
npx wrangler deploy
```

## Scripts de deploy

```bash
# Deploy completo en VPS
bash deploy.sh

# Solo reconstruir backend
docker compose build backend && docker compose up -d backend

# Solo reconstruir frontend
docker compose build frontend && docker compose up -d frontend

# Rollback
git checkout <commit-anterior>
docker compose build backend frontend
docker compose up -d
```
