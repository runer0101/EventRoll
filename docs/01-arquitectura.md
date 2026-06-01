# Arquitectura

## Stack tecnológico

### Frontend
| Tecnología | Uso |
|-----------|-----|
| Vue 3 (Composition API) | Framework UI |
| Vue Router | Enrutamiento SPA con guards |
| Pinia | Estado global (auth, evento, plano, ui) |
| Vite | Build tool y dev server |
| Axios | Cliente HTTP con interceptores |
| ExcelJS | Import/export `.xlsx` (lazy-loaded) |
| Lucide Vue | Iconos SVG profesionales |

### Backend
| Tecnología | Uso |
|-----------|-----|
| Node.js 22 | Runtime |
| Express 4 | Framework web |
| PostgreSQL 16 | Base de datos |
| jsonwebtoken | Firma y verificación de JWT |
| bcryptjs | Hashing de contraseñas |
| express-validator | Validación de inputs |
| express-rate-limit | Rate limiting por IP+UserAgent |
| helmet | Headers de seguridad HTTP |
| cors | Control de CORS |
| cookie-parser | Lectura de cookies HttpOnly |
| nodemailer | Envío de emails |
| winston | Logging estructurado JSON |
| swagger-ui-express | Documentación interactiva de API |

### DevOps
| Herramienta | Uso |
|------------|-----|
| Docker + Compose | Contenedores y orquestación |
| nginx | Servidor web + proxy reverso |
| GitHub Actions | CI/CD |
| Render.com | Hosting del backend |
| GitHub Pages | Hosting del frontend |
| Supabase | PostgreSQL gestionado en producción |

## Flujo de datos

```
Usuario → Vue 3 (SPA)
           ↕ Axios + HttpOnly Cookie
         Express.js API
           ↓ Capas:
         Routes → Middleware → Controllers → Services → Repositories
           ↕ pg driver + SSL
         PostgreSQL 16
```

## Capas del backend

```
HTTP Request
   ↓
Router            — Define métodos y rutas
   ↓
Middleware         — authenticateToken, requireRole, requirePermiso, rateLimiter, validators
   ↓
Controller         — Extrae parámetros del request, llama al service, devuelve respuesta
   ↓
Service            — Lógica de negocio, validaciones, reglas
   ↓
Repository         — Queries SQL parametrizadas ($1, $2...), acceso exclusivo a la BD
   ↓
PostgreSQL Pool    — Conexiones gestionadas por pg-pool
```

## Módulos compartidos

`shared/permissions.js` — Fuente única de verdad para:
- `PERMISOS_POR_ROL` — Mapa de 5 roles con 10 permisos granulares
- `CATEGORIAS_VALIDAS` — Categorías de invitados (General, VIP, Familia, Amigos, Trabajo)

Usado tanto por el frontend como por el backend para mantener consistencia.

## Flujo de autenticación

1. Frontend envía credenciales vía `POST /api/v1/auth/login`
2. Backend verifica email + bcrypt hash y firma un JWT con:
   - `userId`, `email`, `rol`, `permisos` (overrides), `jti` (token ID)
3. JWT se almacena en cookie `HttpOnly` (nunca en localStorage)
4. Cada request posterior incluye la cookie automáticamente (`withCredentials: true`)
5. Middleware `authenticateToken`:
   - Extrae token de cookie o header `Authorization`
   - Verifica firma y expiración del JWT
   - Revisa blacklist de tokens revocados (`revoked_tokens`)
   - Consulta cache de usuarios (5 min TTL) o BD
   - Adjunta `req.user` con datos del usuario + permisos
6. Al hacer logout, el `jti` del token se inserta en `revoked_tokens`

## Comunicación frontend ↔ backend

- **En desarrollo**: `localhost:5173` ↔ `localhost:3000` (CORS configurado)
- **En producción VPS**: mismo dominio, nginx proxy `/api/` → backend
- **En producción Pages**: GitHub Pages ↔ Render.com (cross-origin, cookie `SameSite=None; Secure`)
- Cloudflare Worker como proxy inverso para filtrar tráfico malicioso
