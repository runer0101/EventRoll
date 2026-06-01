# Backend — API REST

## Estructura de archivos

```
backend/src/
├── server.js                 ← Punto de entrada: validateEnv, DB, migraciones, seed, listen
├── app.js                    ← Express: middleware global, rutas, manejo de errores
├── config/
│   ├── database.js           ← Pool de conexiones PostgreSQL
│   ├── migrate.js            ← Migración base (tablas + índices)
│   ├── migrate-v1.4.js       ← Actividad + permisos
│   ├── migrate-v1.5.js       ← Password recovery
│   ├── migrate-v1.6.js       ← Índices y unicidad
│   ├── migrate-v1.7.js       ← Blacklist de tokens
│   ├── migrate-v1.8.js       ← Rol visualizador
│   ├── migrate-v1.9.js       ← Mesas + asignaciones
│   ├── migrate-all.js        ← Orquestador de migraciones
│   ├── seed.js               ← Admin + datos de ejemplo
│   ├── swagger.js            ← Especificación OpenAPI 3.0
│   └── validateEnv.js        ← Validación de variables al arrancar
├── controllers/
│   ├── authController.js     ← Login, register, logout, getMe
│   ├── invitadosController.js
│   ├── usuariosController.js
│   ├── mesasController.js
│   └── passwordRecoveryController.js
├── services/
│   ├── authService.js
│   ├── invitadosService.js
│   ├── usuariosService.js
│   ├── mesasService.js
│   ├── activityService.js
│   ├── emailService.js
│   └── passwordRecoveryService.js
├── repositories/
│   ├── authRepository.js
│   ├── invitadosRepository.js
│   ├── usuariosRepository.js
│   ├── mesasRepository.js
│   └── passwordRecoveryRepository.js
├── middleware/
│   ├── auth.js               ← JWT, cache de usuarios, rate limiters, requireRole, requirePermiso
│   ├── validators.js         ← express-validator chains por endpoint
│   ├── errorHandler.js       ← Manejo global de errores (404 + 5xx)
│   └── requestId.js          ← X-Request-ID en cada request
├── routes/
│   ├── authRoutes.js         ← /api/v1/auth/*
│   ├── invitadosRoutes.js    ← /api/v1/invitados/*
│   ├── usuariosRoutes.js     ← /api/v1/usuarios/*
│   ├── eventosRoutes.js      ← /api/v1/eventos/*
│   ├── mesasRoutes.js        ← /api/v1/mesas/*
│   └── password-recovery.js  ← /api/v1/password-recovery/*
├── core/errors/
│   └── AppError.js           ← Clase de error personalizada
└── utils/
    ├── logger.js             ← Winston con redacción de campos sensibles
    ├── asyncHandler.js       ← Wrapper para try/catch en controllers
    └── origin.js             ← Validación de orígenes CORS/CSRF
```

## Endpoints

### Auth — `/api/v1/auth`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/register` | No | Registro público (rol admin) |
| POST | `/login` | No | Login email + contraseña |
| POST | `/login-con-codigo` | No | Login con código de guardia |
| GET | `/me` | Sí | Usuario autenticado actual |
| POST | `/logout` | Sí | Cerrar sesión + revocar token |

### Invitados — `/api/v1/invitados`

| Método | Ruta | Permiso mínimo | Descripción |
|--------|------|---------------|-------------|
| GET | `/` | verInvitados | Lista paginada con filtros |
| POST | `/` | agregarInvitados | Crear invitado |
| POST | `/import` | importarExcel | Importar desde Excel |
| PUT | `/:id` | editarInvitados | Actualizar invitado |
| DELETE | `/:id` | eliminarInvitados | Eliminar invitado |

**Query params GET:** `evento_id`, `page`, `limit`, `search`, `categoria`, `confirmado`, `sort`, `order`

### Usuarios — `/api/v1/usuarios`

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/` | admin | Listar usuarios |
| POST | `/` | admin | Crear usuario |
| PUT | `/:id` | admin | Actualizar usuario |
| DELETE | `/:id` | admin | Eliminar usuario |
| POST | `/:id/generar-codigo` | admin | Código de guardia |
| DELETE | `/:id/revocar-codigo` | admin | Revocar código |

### Mesas — `/api/v1/mesas`

| Método | Ruta | Permiso mínimo | Descripción |
|--------|------|---------------|-------------|
| GET | `/` | verInvitados | Mesas con asignaciones |
| POST | `/` | agregarInvitados | Crear mesa |
| PUT | `/:id` | editarInvitados | Mover/editar mesa |
| DELETE | `/:id` | eliminarInvitados | Eliminar mesa |
| GET | `/sin-mesa` | verInvitados | Invitados sin asignar |
| POST | `/:mesaId/asignar` | editarInvitados | Asignar a silla |
| DELETE | `/desasignar/:invitadoId` | editarInvitados | Quitar de mesa |

### Eventos — `/api/v1/eventos`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar eventos del usuario |

### Password Recovery — `/api/v1/password-recovery`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/solicitar-codigo` | Enviar código al email |
| POST | `/verificar-codigo` | Verificar código |
| POST | `/restablecer-password` | Nueva contraseña |

## Sistema de roles y permisos

5 roles con permisos granulares anulables por usuario (campo `permisos` JSONB):

| Permiso | Admin | Organizador | Asistente | Guardia | Visualizador |
|---------|:-----:|:-----------:|:---------:|:-------:|:------------:|
| verInvitados | ✅ | ✅ | ✅ | ✅ | ✅ |
| agregarInvitados | ✅ | ✅ | ✅ | — | — |
| editarInvitados | ✅ | ✅ | ✅ | — | — |
| eliminarInvitados | ✅ | ✅ | — | — | — |
| confirmarInvitados | ✅ | ✅ | ✅ | ✅ | — |
| exportarExcel | ✅ | ✅ | ✅ | — | ✅ |
| importarExcel | ✅ | ✅ | — | — | — |
| configurarSillas | ✅ | ✅ | — | — | — |
| verEstadisticas | ✅ | ✅ | ✅ | — | ✅ |
| gestionarUsuarios | ✅ | — | — | — | — |

Los permisos pueden ajustarse individualmente por usuario desde Gestión de Usuarios, anulando los valores por defecto del rol.

## Manejo de errores

- **AppError** — Clase personalizada con `statusCode`, `message`, `details`
- **asyncHandler** — Wrapper que captura excepciones en controllers async
- **errorHandler** — Middleware global: 4xx → `warn`, 5xx → `error`, oculta stack traces en producción
- **Validación** — `express-validator` en todos los endpoints con `handleValidationErrors`

## Logging

- **Winston** con formato JSON estructurado
- Niveles: `error`, `warn`, `info`, `http`, `debug` (configurable con `LOG_LEVEL`)
- Campos sensibles auto-redactados: passwords, tokens, códigos
- `X-Request-ID` en cada request para correlación de logs
- Morgan integrado como stream de Winston para HTTP request logging
