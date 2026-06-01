# Seguridad

## Autenticación

### JWT en cookie HttpOnly
- JWT firmado con `JWT_SECRET` (mínimo 64 caracteres aleatorios)
- Almacenado en cookie `HttpOnly; SameSite=Lax; Path=/`
- En producción cross-origen: `Secure; SameSite=None`
- Nunca en `localStorage` — inmune a XSS
- Payload del JWT: `userId`, `email`, `rol`, `permisos` (overrides), `jti` (token ID)

### Blacklist de tokens
- Tabla `revoked_tokens`: `jti` + `expires_at`
- Al hacer logout, el `jti` del token se inserta en la tabla
- Middleware verifica que el token no esté revocado antes de aceptarlo
- Limpieza automática diaria de tokens expirados

### Caché de usuarios
- `Map` en memoria con TTL de 5 minutos
- Reduce queries a BD: solo consulta usuario nuevo si no está en cache
- Se invalida al hacer logout, update o delete del usuario

### Códigos de acceso (guardias)
- `crypto.randomBytes` (CSPRNG) para generar códigos de 8 caracteres
- Alfabeto sin ambigüedad: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
- Un solo uso: el código se limpia al hacer login exitoso
- Expiración configurable (`access_code_expires_at`)

### Recuperación de contraseña
- Código de 6 dígitos enviado por email (nodemailer)
- Expira a los 15 minutos
- 5 intentos máximo de verificación
- Siempre responde 200 al solicitar código (no revela si el email existe)

### Registro público
- Endpoint `POST /api/v1/auth/register`
- Crea usuario con rol `admin` y auto-inicia sesión
- Rate limit: 20 intentos por IP cada 15 minutos

## Rate Limiting

Todos los limiters usan `express-rate-limit` con key por `IP + UserAgent`.

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| API global | 30 req | 15 min |
| POST `/auth/login` | 20 intentos | 15 min |
| POST `/auth/register` | 20 intentos | 15 min |
| POST `/password-recovery/solicitar-codigo` | 5 intentos | 15 min |
| POST `/password-recovery/verificar-codigo` | 5 intentos | 15 min |
| POST `/password-recovery/restablecer-password` | 5 intentos | 15 min |
| POST `/usuarios/:id/generar-codigo` | 10 generaciones | 1 min |

`/health` está excluido del rate limiting global.

## Protección de datos

### SQL Injection
- **Todas** las queries usan parámetros `$1, $2...` — nunca interpolación de strings
- Whitelist explícita para `ORDER BY` — previene inyección SQL en ordenamiento

### CORS
- Restringido al origen exacto del frontend (`CORS_ORIGIN`)
- `credentials: true` para cookies cross-origen
- Validación de lista blanca de orígenes

### CSRF
- Validación del header `Origin` en todos los métodos mutantes (POST, PUT, DELETE, PATCH)
- Validación de `Referer` como fallback
- Requests sin `Origin` ni `Referer` válidos son bloqueados (excepto `/health`)

### Headers de seguridad (Helmet)
- **CSP**: `default-src 'self'`, sin `unsafe-eval`, sin `unsafe-inline` en scripts
- **HSTS**: `max-age=31536000` en nginx
- **Permissions-Policy**: cámara, micrófono, geolocalización, payment, USB deshabilitados
- **X-Frame-Options**: `DENY` (frameAncestors 'none')
- **X-Content-Type-Options**: `nosniff`

### Validación de inputs
- `express-validator` en todos los endpoints
- Sanitización: `trim()`, `normalizeEmail()`, `escape()`
- Límites de longitud en todos los campos
- `express.json({ limit: '1mb' })` — previene DoS por body grande

### Hashing de contraseñas
- **bcrypt** con 10-12 rondas de salt (`SALT_ROUNDS`)
- Mínimo 8 caracteres, requiere al menos 1 letra y 1 número
- Nunca se loguean contraseñas (Winston redacta campos sensibles)

## Logging y auditoría

- **Winston** con formato JSON estructurado
- Redacción automática de: passwords, tokens, códigos de acceso, códigos de recuperación
- Tabla `actividad` — audit trail completo de acciones de usuarios
- `X-Request-ID` en cada request para correlación
- Stack traces ocultos en producción

## Infraestructura

### Docker
- Usuario no-root (`appuser`) en todos los contenedores
- Multi-stage builds: dependencias aisladas del código fuente
- Imágenes Alpine: superficie de ataque mínima
- Límites de CPU y memoria por contenedor
- HEALTHCHECK en todos los servicios

### Secretos
- `.env` y `.env.*` en `.gitignore`
- Pre-commit hook con `gitleaks` + scanner personalizado
- Variables de entorno para todas las credenciales
- Nunca se commitean tokens, passwords ni keys

### TLS/SSL
- nginx con TLS 1.2/1.3
- Ciphers modernos (ECDHE + AES-GCM + CHACHA20)
- OCSP Stapling
- HTTP → HTTPS redirect
