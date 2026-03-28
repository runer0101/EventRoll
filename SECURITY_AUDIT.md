# Auditoría de Seguridad — EventRoll

**Última actualización:** Marzo 2026
**Estado:** ACTIVO — revisado y actualizado continuamente
**Versión:** 1.4.0+

---

## Resumen Ejecutivo

EventRoll ha pasado múltiples rondas de auditoría de seguridad. Este documento refleja el estado actual de los controles implementados.

---

## 1. Secretos y Credenciales

| Control | Estado | Detalle |
|---------|--------|---------|
| `.env` no commiteado | ✅ | Excluido por `.gitignore` |
| `.env.example` con placeholders | ✅ | Sin valores reales |
| Secretos en CI/CD | ✅ | Usa `secrets.*` de GitHub |
| Gitleaks en pipeline | ✅ | Ejecutado en cada push |
| Scanner pre-commit | ✅ | `check-secrets.cjs` en Husky |
| JWT_SECRET validado al arrancar | ✅ | Mínimo 32 chars + detección de valores débiles |

---

## 2. Autenticación y Sesiones

| Control | Estado | Detalle |
|---------|--------|---------|
| Contraseñas con bcryptjs | ✅ | `Math.max(10, SALT_ROUNDS)` — mínimo garantizado |
| JWT en cookie HttpOnly | ✅ | Nunca expuesto en `localStorage` |
| Bearer token bloqueado en producción | ✅ | `NODE_ENV === production` ignora `ALLOW_BEARER_TOKEN` |
| Blacklist de tokens revocados | ✅ | Tabla `revoked_tokens` con `jti` único |
| Logout invalida token en servidor | ✅ | Persiste en BD hasta expiración |
| Caché de usuario autenticado | ✅ | TTL 5 min para reducir queries |

---

## 3. Autorización (RBAC)

| Control | Estado | Detalle |
|---------|--------|---------|
| 5 roles definidos | ✅ | admin, organizador, asistente, guardia, visualizador |
| Permisos validados en backend | ✅ | `requirePermiso()` middleware en todas las rutas |
| Overrides granulares por usuario | ✅ | Campo `permisos JSONB` con fallback a rol |
| `requireAdmin` en endpoints críticos | ✅ | Gestión de usuarios, Swagger docs en producción |
| Swagger protegido en producción | ✅ | `authenticateToken + requireAdmin` |

---

## 4. Protección de Endpoints

| Control | Estado | Detalle |
|---------|--------|---------|
| Rate limiting global | ✅ | 100 req / 15 min por IP |
| Rate limit en login | ✅ | 20 intentos / 15 min |
| Rate limit en recovery | ✅ | 5 intentos / 15 min |
| Rate limit en códigos de guardia | ✅ | 10 generaciones / min |
| Validación de inputs | ✅ | `express-validator` en todos los endpoints |
| Validación estructura `permisos` JSONB | ✅ | Claves conocidas + tipos `boolean` |
| `evento_id` verificado contra BD | ✅ | En lectura e importación de invitados |

---

## 5. Seguridad de Transporte y Headers

| Control | Estado | Detalle |
|---------|--------|---------|
| Helmet.js con CSP explícita | ✅ | `scriptSrc`, `styleSrc`, `fontSrc`, `imgSrc`, `connectSrc`, `frameAncestors`, `objectSrc` |
| CORS restringido | ✅ | Solo origen configurado en `CORS_ORIGIN` |
| CSRF via validación de `Origin` | ✅ | Rechaza mutaciones sin Origin en producción |
| `X-Request-ID` en cada request | ✅ | Correlación de logs |
| `Cache-Control: no-store` | ✅ | En todas las rutas `/api/v1/` |
| `Permissions-Policy` | ✅ | Restringe APIs sensibles del navegador |

---

## 6. Base de Datos

| Control | Estado | Detalle |
|---------|--------|---------|
| Queries parametrizadas | ✅ | Sin interpolación de strings |
| Sin `SELECT *` | ✅ | Columnas explícitas en todos los repositorios |
| Índice UNIQUE anti-duplicados | ✅ | `(evento_id, LOWER(nombre), LOWER(apellido))` |
| SSL en producción | ✅ | Configurable por `DB_SSL_REJECT_UNAUTHORIZED` |
| `statement_timeout` en pool | ✅ | 30 segundos máximo por query |
| `TIMESTAMPTZ` en columnas de tiempo | ✅ | Sin problemas de zona horaria |
| Sistema de migraciones versionado | ✅ | `schema_migrations` con control de versiones |

---

## 7. Recuperación de Contraseña

| Control | Estado | Detalle |
|---------|--------|---------|
| Códigos de 8 dígitos | ✅ | 100,000,000 combinaciones posibles |
| Expiración de códigos | ✅ | 15 minutos |
| Protección timing attack | ✅ | Respuesta mínima de 300ms en todos los paths |
| Mensaje genérico al cliente | ✅ | "Si el email existe..." — sin user enumeration |
| Transacciones en BD | ✅ | `BEGIN/COMMIT/ROLLBACK` en operaciones multi-tabla |

---

## 8. Códigos de Acceso (Guardias)

| Control | Estado | Detalle |
|---------|--------|---------|
| Expiración de 7 días | ✅ | Reducido de 30 días |
| Charset sin caracteres ambiguos | ✅ | `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` |
| Entropía con `crypto.randomBytes` | ✅ | ~40 bits efectivos |

---

## 9. Logging y Auditoría

| Control | Estado | Detalle |
|---------|--------|---------|
| Winston con JSON estructurado | ✅ | Niveles: error, warn, info, http, debug |
| Redacción de campos sensibles | ✅ | `password`, `token`, `codigo`, `email`, `access_code`, etc. |
| Sanitización de errores de BD | ✅ | `sanitizeDbError()` oculta credenciales en URLs |
| Tabla `actividad` (audit trail) | ✅ | Registra todas las acciones del usuario |
| Stack traces ocultos en producción | ✅ | `EXPOSE_ERROR_STACK=false` |

---

## 10. CI/CD e Infraestructura

| Control | Estado | Detalle |
|---------|--------|---------|
| `npm audit --audit-level=moderate` | ✅ | Frontend y backend — 0 vulnerabilidades |
| Gitleaks en cada push a main | ✅ | Versión 8.21.2 |
| Tests unitarios e integración | ✅ | 91 tests pasando |
| Docker con usuario no-root | ✅ | `appuser` |
| Multi-stage builds | ✅ | Dependencias aisladas del código |
| Imágenes Alpine | ✅ | Superficie de ataque mínima |

---

## Credenciales del Entorno de Demo

La instancia pública en https://runer0101.github.io/EventRoll usa credenciales de prueba documentadas en el README. **No usar estas credenciales para datos reales.**

---

## Configuración Recomendada para Producción

```env
NODE_ENV=production
SALT_ROUNDS=12
JWT_EXPIRES_IN=12h
RATE_LIMIT_MAX=50
CORS_ORIGIN=https://tu-dominio.com
EXPOSE_ERROR_STACK=false
DB_SSL_REJECT_UNAUTHORIZED=true
```
