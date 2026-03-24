# EventRoll

<p align="center">
  <strong>Plataforma web para gestionar invitados en eventos con control de asistencia en tiempo real</strong>
</p>

<p align="center">
  <a href="https://github.com/runer0101/EventRoll/actions/workflows/test.yml">
    <img src="https://github.com/runer0101/EventRoll/actions/workflows/test.yml/badge.svg" alt="Tests">
  </a>
  <a href="https://github.com/runer0101/EventRoll/actions/workflows/security.yml">
    <img src="https://github.com/runer0101/EventRoll/actions/workflows/security.yml/badge.svg" alt="Security">
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white" alt="Node.js">
  </a>
  <a href="https://vuejs.org/">
    <img src="https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white" alt="Vue 3">
  </a>
  <a href="https://www.postgresql.org/">
    <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white" alt="PostgreSQL">
  </a>
  <a href="https://www.docker.com/">
    <img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" alt="Docker">
  </a>
  <a href="https://github.com/runer0101/EventRoll/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/licencia-MIT-blue" alt="MIT">
  </a>
</p>

---

## ¿Qué es EventRoll?

EventRoll es una aplicación web **fullstack** diseñada para equipos que organizan eventos y necesitan saber exactamente quién asiste. Reemplaza las hojas de cálculo y los papeles físicos por un panel interactivo que funciona desde cualquier dispositivo.

**¿Qué problema resuelve?**
Coordinar la entrada a un evento con múltiples personas del equipo (organizadores, guardias, asistentes) es difícil cuando todos están mirando listas distintas. EventRoll centraliza todo: un solo panel, roles diferenciados por persona y datos actualizados al instante.

**Casos de uso:** bodas · conferencias · fiestas privadas · eventos corporativos · graduaciones

---

## Demo en vivo

| Servicio | URL |
|----------|-----|
| **Frontend** | **https://runer0101.github.io/EventRoll** |
| Backend API | https://eventroll.onrender.com |
| API Docs (Swagger) | https://eventroll.onrender.com/api/docs |
| Health check | https://eventroll.onrender.com/health |

> ⚠️ El backend corre en Render Free tier. Si lleva tiempo inactivo, la primera petición puede tardar ~50 s mientras el servidor despierta.

### Credenciales de prueba

| Campo | Valor |
|-------|-------|
| Email | `admin@prueba` |
| Contraseña | `Ysel@Admin2026!` |

---

## Tabla de contenidos

- [Funcionalidades](#funcionalidades)
- [Roles y permisos](#roles-y-permisos)
- [Cómo funciona (arquitectura)](#cómo-funciona)
- [Stack tecnológico](#stack-tecnológico)
- [Base de datos](#base-de-datos)
- [Instalación local](#instalación-local)
- [Docker](#docker-stack-completo-en-un-comando)
- [Scripts disponibles](#scripts-disponibles)
- [API Reference](#referencia-de-la-api)
- [Variables de entorno](#variables-de-entorno)
- [Seguridad](#seguridad)
- [Estructura del proyecto](#estructura-del-proyecto)

---

## Funcionalidades

### 👥 Gestión de invitados
Administra toda la lista de un evento desde un solo panel.

- Crear, editar y eliminar invitados uno por uno
- **Importar masivamente** desde archivos `.xlsx` (hasta 500 invitados por lote)
- **Exportar** la lista actual a Excel en cualquier momento
- Búsqueda en tiempo real por nombre o apellido
- Filtros por categoría (VIP, General, Familia, Amigos, Trabajo) y por estado de confirmación
- **Paginación server-side** eficiente para eventos con miles de invitados
- Prevención de duplicados mediante índice único por evento

### ✅ Control de asistencia en tiempo real
Confirma llegadas en segundos directamente desde el panel.

- Confirmar o desconfirmar invitados con un solo clic
- **Panel de estadísticas en vivo**: total de invitados, confirmados, disponibles y porcentaje de ocupación
- Barra de progreso visual para ver el estado del evento de un vistazo
- Avatares con iniciales e indicador de color (verde = confirmado, gris = pendiente)

### 🔐 Control de acceso por roles (RBAC)
Cada miembro del equipo tiene exactamente los permisos que necesita — ni más, ni menos.

- **5 roles distintos** con permisos granulares
- **Códigos de acceso de un solo uso** para guardias en la puerta: entran sin necesidad de email/contraseña
- Recuperación de contraseña por email con código de 6 dígitos y expiración automática

### 📊 Multi-evento
Gestiona varios eventos desde la misma cuenta sin mezclar listas.

- Cada evento tiene su propia lista de invitados completamente separada
- Cambiar el evento activo desde el panel en cualquier momento
- Estadísticas independientes por evento

---

## Roles y permisos

| Acción | Admin | Organizador | Asistente | Guardia | Visualizador |
|--------|:-----:|:-----------:|:---------:|:-------:|:------------:|
| Ver invitados | ✓ | ✓ | ✓ | ✓ | ✓ |
| Confirmar asistencia | ✓ | ✓ | ✓ | ✓ | — |
| Crear / editar invitados | ✓ | ✓ | ✓ | — | — |
| Eliminar invitados | ✓ | ✓ | — | — | — |
| Importar desde Excel | ✓ | ✓ | — | — | — |
| Exportar a Excel | ✓ | ✓ | ✓ | — | ✓ |
| Cambiar evento activo | ✓ | ✓ | — | — | — |
| Gestionar usuarios del equipo | ✓ | — | — | — | — |
| Generar / revocar códigos de acceso | ✓ | — | — | — | — |

> Los **guardias** usan un código de acceso de un solo uso generado por el admin. No necesitan recordar ni una contraseña.

---

## Cómo funciona

EventRoll tiene una arquitectura de tres capas clásica: frontend SPA, API REST y base de datos relacional.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Navegador (Vue 3)                        │
│  Panel de invitados · Gestión de usuarios · Estadísticas · ...  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS + Cookie HttpOnly (JWT)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API REST (Express + Node.js)                  │
│  /api/auth  ·  /api/invitados  ·  /api/usuarios  ·  /health     │
└────────────────────────────┬────────────────────────────────────┘
                             │ SQL parametrizado
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PostgreSQL (Supabase en prod)                  │
│  usuarios · invitados · eventos · actividad · recovery_codes     │
└─────────────────────────────────────────────────────────────────┘
```

**Sesión segura:** el JWT se almacena en una **cookie HttpOnly** — nunca toca el JavaScript del navegador, lo que elimina por diseño los ataques XSS sobre el token de sesión.

### Arquitectura del backend en capas

El backend sigue una arquitectura en capas estricta para separar responsabilidades y facilitar el testing independiente de cada capa:

```
HTTP Request
    │
    ▼
Routes          → define el endpoint y qué middleware aplica
    │
    ▼
Middleware      → autenticación JWT, validación de rol, rate limiting, CSRF
    │
    ▼
Controllers     → extrae parámetros del request, llama al service
    │
    ▼
Services        → lógica de negocio (validaciones, reglas, errores de dominio)
    │
    ▼
Repositories    → SQL parametrizado, acceso exclusivo a PostgreSQL
    │
    ▼
PostgreSQL
```

Los **tests unitarios** mockean el repositorio y prueban el service en aislamiento. Los **tests de integración** usan una base de datos PostgreSQL real y prueban el stack completo desde HTTP.

---

## Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|------------|---------|-----------|
| Frontend | Vue 3 + Vite | 3.x | SPA reactiva con Composition API |
| Estado global | Pinia | 2.x | Store de auth y evento activo |
| Peticiones HTTP | Axios | 1.x | Interceptores de error, retry, sesión |
| Íconos | Lucide Vue | — | Íconos SVG ligeros y consistentes |
| Excel | ExcelJS | — | Import/export de archivos `.xlsx` |
| Backend | Node.js + Express | 22 / 4.x | API REST con async/await |
| Base de datos | PostgreSQL | 16 | Persistencia relacional principal |
| Auth | JWT + bcryptjs | — | Sesión stateless y hash de contraseñas |
| Logs | Winston | — | Logging estructurado en JSON con redacción |
| Tests unitarios | Vitest | — | Tests rápidos con mocks y cobertura |
| Tests integración | Supertest | — | Tests end-to-end de la API con DB real |
| CI/CD | GitHub Actions | — | Tests + auditoría de seguridad en cada push |
| Deploy backend | Render | — | Auto-deploy desde rama `main` |
| Deploy frontend | GitHub Pages | — | Build estático de Vue |
| DB producción | Supabase | — | PostgreSQL gestionado y con backups |
| Contenedores | Docker + Nginx | — | Stack local completo en un comando |

---

## Base de datos

### Esquema de tablas

```
usuarios
├── id             UUID, PK
├── nombre         VARCHAR
├── email          VARCHAR, UNIQUE
├── password_hash  VARCHAR           ← bcrypt, nunca texto plano
├── rol            VARCHAR           ← admin | organizador | asistente | guardia | visualizador
├── permisos       JSONB             ← permisos granulares opcionales por usuario
├── access_code    VARCHAR           ← código de un solo uso para guardias, nullable
└── created_at     TIMESTAMP

eventos
├── id             UUID, PK
├── nombre         VARCHAR
├── fecha          DATE
├── sillas_totales INTEGER
└── creado_por     UUID → usuarios

invitados
├── id             UUID, PK
├── evento_id      UUID → eventos
├── nombre         VARCHAR
├── apellido       VARCHAR
├── categoria      VARCHAR           ← General | VIP | Familia | Amigos | Trabajo
├── confirmado     BOOLEAN
└── created_at     TIMESTAMP

actividad
├── id             UUID, PK
├── usuario_id     UUID → usuarios
├── accion         VARCHAR           ← registro de auditoría de acciones
├── detalles       JSONB
└── created_at     TIMESTAMP

recovery_codes
├── id             UUID, PK
├── usuario_id     UUID → usuarios
├── code           VARCHAR(6)        ← código de 6 dígitos con expiración
├── expires_at     TIMESTAMP
└── used           BOOLEAN
```

### Índices destacados

- `idx_invitados_unique_per_event` — UNIQUE por `(evento_id, LOWER(nombre), LOWER(apellido))` para evitar duplicados
- `idx_invitados_nombre_lower` / `idx_invitados_apellido_lower` — búsqueda case-insensitive eficiente

---

## Requisitos locales

- Node.js 20+ (recomendado 22)
- npm 9+
- PostgreSQL 14+

---

## Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/runer0101/EventRoll.git
cd EventRoll
```

### 2. Instalar dependencias

```bash
npm install                    # frontend
npm install --prefix backend   # backend
```

### 3. Configurar variables de entorno

```bash
# Backend — copia la plantilla y edita los valores
cp backend/.env.example backend/.env
```

Los valores mínimos que debes configurar en `backend/.env`:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/eventroll
JWT_SECRET=<string aleatorio de 64+ caracteres>
DEFAULT_ADMIN_PASSWORD=<contraseña segura para el admin>
```

Genera un JWT_SECRET seguro con:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

El frontend ya apunta a `http://localhost:3000/api` por defecto. Si lo necesitas cambiar:
```bash
cp .env.example .env
# Editar VITE_API_URL
```

### 4. Crear las tablas en la base de datos

```bash
cd backend
npm run migrate          # crea todas las tablas e índices
npm run seed             # opcional: crea el usuario admin inicial
```

> El seed crea el usuario `admin@prueba` con la contraseña que definiste en `DEFAULT_ADMIN_PASSWORD`.

### 5. Iniciar los servidores

```bash
# Terminal 1 — API (puerto 3000)
cd backend && npm run dev

# Terminal 2 — Frontend (puerto 5173)
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) e inicia sesión con:

| Email | Contraseña |
|-------|------------|
| `admin@prueba` | valor de `DEFAULT_ADMIN_PASSWORD` en `backend/.env` |

---

## Docker (stack completo en un comando)

Levanta PostgreSQL + API + Nginx sin instalar nada más:

```bash
cp .env.example .env
# Completar: DB_PASSWORD, JWT_SECRET, CORS_ORIGIN
```

```bash
docker compose up -d
```

| Servicio | URL local |
|----------|-----------|
| Frontend | http://localhost |
| API | http://localhost/api |
| API Docs | http://localhost/api/docs |

El `docker-compose.yml` incluye PostgreSQL, la API y un Nginx como reverse proxy con las rutas ya configuradas.

---

## Scripts disponibles

### Frontend (`/`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Build optimizado de producción |
| `npm run preview` | Preview local del build de producción |
| `npm run lint` | Análisis estático con ESLint |
| `npm run lint:fix` | Auto-corrección de errores de lint |
| `npm run format` | Formateo con Prettier |

### Backend (`/backend`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor con nodemon (recarga automática en cambios) |
| `npm run start` | Servidor en modo producción |
| `npm run migrate` | Crea/actualiza todas las tablas e índices |
| `npm run seed` | Carga usuario admin y datos de ejemplo |
| `npm run cambiar-password` | Utilidad para resetear la contraseña de un usuario |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run test:watch` | Tests en modo watch durante desarrollo |
| `npm run test:coverage` | Tests con reporte de cobertura de código |
| `npm run test:integration` | Tests de integración contra PostgreSQL real |

---

## Referencia de la API

Documentación interactiva completa en [`/api/docs`](https://eventroll.onrender.com/api/docs) (Swagger UI).

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Inicia sesión — establece cookie HttpOnly con JWT |
| `POST` | `/api/auth/login-con-codigo` | Login rápido con código de acceso (guardias) |
| `GET` | `/api/auth/me` | Devuelve el usuario autenticado actual |
| `POST` | `/api/auth/logout` | Cierra sesión y limpia la cookie |
| `POST` | `/api/auth/recovery/request` | Envía código de recuperación por email |
| `POST` | `/api/auth/recovery/verify` | Verifica el código de 6 dígitos |
| `POST` | `/api/auth/recovery/reset` | Restablece la contraseña con el código verificado |

### Invitados

| Método | Endpoint | Rol mínimo | Descripción |
|--------|----------|------------|-------------|
| `GET` | `/api/invitados` | cualquiera | Lista paginada con filtros (search, categoría, estado) |
| `POST` | `/api/invitados` | organizador+ | Crea un invitado |
| `POST` | `/api/invitados/import` | organizador+ | Importa hasta 500 invitados desde Excel |
| `PUT` | `/api/invitados/:id` | organizador+ | Actualiza nombre, categoría o confirmación |
| `DELETE` | `/api/invitados/:id` | organizador+ | Elimina un invitado |

### Usuarios

| Método | Endpoint | Rol mínimo | Descripción |
|--------|----------|------------|-------------|
| `GET` | `/api/usuarios` | admin | Lista todos los usuarios del sistema |
| `POST` | `/api/usuarios` | admin | Crea un usuario con rol asignado |
| `PUT` | `/api/usuarios/:id` | admin | Edita nombre, email, rol o permisos |
| `DELETE` | `/api/usuarios/:id` | admin | Elimina un usuario |
| `POST` | `/api/usuarios/:id/generar-codigo` | admin | Genera código de acceso para un guardia |
| `DELETE` | `/api/usuarios/:id/revocar-codigo` | admin | Revoca el código de acceso |

### Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Estado de la API y la base de datos (para monitoreo) |

> **Autenticación:** todas las rutas protegidas requieren el JWT en una **cookie HttpOnly**. Las peticiones deben enviarse con `withCredentials: true`. El token nunca es accesible desde JavaScript del navegador.

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Requerida | Descripción |
|----------|:---------:|-------------|
| `DATABASE_URL` | ✓ | Cadena de conexión PostgreSQL completa (`postgresql://user:pass@host:5432/db`) |
| `JWT_SECRET` | ✓ | String aleatorio de mínimo 64 caracteres — nunca lo expongas |
| `JWT_EXPIRES_IN` | — | Tiempo de expiración del token (default: `24h`) |
| `CORS_ORIGIN` | ✓ prod | URL exacta del frontend sin barra final (ej: `https://miapp.com`) |
| `DEFAULT_ADMIN_PASSWORD` | — | Contraseña del admin creado por `npm run seed` |
| `EMAIL_HOST` | — | Servidor SMTP para recuperación de contraseña (ej: `smtp.gmail.com`) |
| `EMAIL_PORT` | — | Puerto SMTP (default: `587`) |
| `EMAIL_USER` | — | Correo SMTP desde el que se envían los emails |
| `EMAIL_PASS` | — | App password del correo SMTP |
| `NODE_ENV` | — | `development`, `test` o `production` |
| `ALLOW_BEARER_TOKEN` | — | `true` para permitir auth via `Authorization: Bearer` (solo en test/dev) |
| `EXPOSE_ERROR_STACK` | — | `true` para incluir stack trace en respuestas de error (solo local) |

Ver [`backend/.env.example`](backend/.env.example) para todos los valores disponibles con comentarios.

---

## Seguridad

EventRoll implementa múltiples capas de defensa:

| Mecanismo | Detalle |
|-----------|---------|
| **Contraseñas** | Cifradas con bcrypt (10 rounds) — nunca se almacenan en texto plano |
| **Sesión** | JWT en cookie HttpOnly — inaccesible para JavaScript → elimina XSS sobre el token |
| **Rate limiting** | 3 niveles: 100 req/15 min global · 20 intentos de login · 5 intentos de recovery |
| **SQL injection** | Queries 100% parametrizadas (`$1, $2…`) + whitelist en cláusulas ORDER BY |
| **Headers HTTP** | Helmet configura automáticamente CSP, HSTS, X-Frame-Options, etc. |
| **CSRF** | Verificación de header `Origin` en métodos mutantes (POST/PUT/DELETE) |
| **Secretos en código** | gitleaks + hook Husky escanean cada commit antes de que llegue a GitHub |
| **Logs** | Campos sensibles (passwords, tokens, códigos) redactados automáticamente |
| **Trazabilidad** | `X-Request-ID` único por petición para correlación de logs y auditoría |
| **Blacklist de tokens** | Tokens revocados al hacer logout se guardan en memoria hasta su expiración |

> Nunca subas tu archivo `.env`. Está excluido en `.gitignore`.

---

## Estructura del proyecto

```
EventRoll/
├── src/                          # Frontend (Vue 3 + Vite)
│   ├── components/
│   │   ├── HomePage.vue          # Landing page pública con info del sistema
│   │   ├── LoginPage.vue         # Formulario de login (email o código de acceso)
│   │   ├── ListaInvitados.vue    # Vista principal — CRUD completo de invitados
│   │   ├── GestionUsuarios.vue   # Admin: gestión del equipo de trabajo
│   │   ├── PanelUsuarios.vue     # Perfil de usuario, contraseña y permisos
│   │   ├── Sidebar.vue           # Navegación lateral con indicador de rol
│   │   ├── ToastNotification.vue # Sistema de notificaciones flotantes
│   │   └── ShortcutsHelp.vue     # Modal de atajos de teclado disponibles
│   ├── services/
│   │   └── api.js                # Cliente Axios con interceptores de error y sesión
│   ├── stores/
│   │   ├── auth.js               # Estado global de sesión (Pinia)
│   │   └── evento.js             # Evento activo actual (Pinia)
│   └── composables/
│       ├── useToast.js           # Composable para lanzar notificaciones
│       └── useLoading.js         # Overlay de carga global
│
├── backend/                      # API REST (Node.js 22 + Express)
│   ├── src/
│   │   ├── app.js                # Setup de Express: middleware, CORS, rutas
│   │   ├── server.js             # Punto de entrada — inicia el servidor HTTP
│   │   ├── config/
│   │   │   ├── database.js       # Pool de conexiones PostgreSQL con pg
│   │   │   ├── migrate.js        # Esquema completo de tablas e índices
│   │   │   ├── swagger.js        # Configuración de Swagger/OpenAPI
│   │   │   └── validateEnv.js    # Falla rápido si faltan variables críticas
│   │   ├── controllers/          # Capa HTTP: extrae params, llama al service
│   │   │   ├── authController.js
│   │   │   ├── invitadosController.js
│   │   │   ├── usuariosController.js
│   │   │   └── passwordRecoveryController.js
│   │   ├── services/             # Lógica de negocio, validaciones y errores de dominio
│   │   │   ├── authService.js
│   │   │   ├── invitadosService.js
│   │   │   ├── usuariosService.js
│   │   │   └── activityService.js
│   │   ├── repositories/         # Queries SQL parametrizadas — único acceso a la BD
│   │   │   ├── invitadosRepository.js
│   │   │   └── usuariosRepository.js
│   │   ├── middleware/
│   │   │   ├── auth.js           # Verificación JWT (cookie o Bearer), rate limiters
│   │   │   ├── validators.js     # Validación de request body con express-validator
│   │   │   ├── errorHandler.js   # Formato de errores + logging + requestId
│   │   │   └── requestId.js      # Genera X-Request-ID único por petición
│   │   ├── routes/               # Define endpoints y middleware para cada ruta
│   │   └── utils/
│   │       ├── logger.js         # Winston: JSON estructurado, redacción de datos sensibles
│   │       └── asyncHandler.js   # Wrapper para propagar errores async al errorHandler
│   ├── scripts/
│   │   ├── seed.js               # Crea usuario admin y evento de ejemplo
│   │   ├── cambiar-password.js   # Utilidad para resetear contraseñas desde CLI
│   │   └── check-secrets.cjs     # Detecta secretos hardcodeados antes del commit
│   └── tests/
│       ├── unit/                 # Vitest + mocks de repositorios y servicios externos
│       └── integration/          # Supertest contra PostgreSQL real en CI
│
├── .github/
│   └── workflows/
│       ├── test.yml              # CI: lint + unit tests + integration tests
│       └── security.yml          # CI: npm audit + gitleaks secret scanning
│
├── public/                       # Assets estáticos del frontend
├── docker-compose.yml            # Orquesta PostgreSQL + API + Nginx en local
├── Dockerfile.frontend           # Build multi-stage de Vue para producción
├── nginx.conf                    # Reverse proxy y rutas del frontend/backend
├── render.yaml                   # Infraestructura como código para Render
├── CHANGELOG.md                  # Historial de cambios por versión
└── CONTRIBUTING.md               # Guía para contribuir al proyecto
```

---

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para convenciones de código, flujo de trabajo con ramas, configuración del entorno de desarrollo y cómo abrir un pull request.

## Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para el historial completo de cambios por versión.

## Licencia

[MIT](LICENSE) — libre para uso personal y comercial.
