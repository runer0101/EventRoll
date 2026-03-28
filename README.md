<div align="center">

# EventRoll

**Plataforma fullstack para gestionar invitados en eventos con control de asistencia en tiempo real**

[![Tests](https://github.com/runer0101/EventRoll/actions/workflows/test.yml/badge.svg)](https://github.com/runer0101/EventRoll/actions/workflows/test.yml)
[![Security](https://github.com/runer0101/EventRoll/actions/workflows/security.yml/badge.svg)](https://github.com/runer0101/EventRoll/actions/workflows/security.yml)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![MIT](https://img.shields.io/badge/licencia-MIT-blue)](LICENSE)

[Demo en vivo](https://runer0101.github.io/EventRoll) · [API Docs](https://eventroll.onrender.com/api/docs) · [Reportar un bug](https://github.com/runer0101/EventRoll/issues)

</div>

---

## ¿Qué es EventRoll?

EventRoll es una aplicación web **fullstack** diseñada para equipos que organizan eventos y necesitan saber exactamente quién asiste. Reemplaza las hojas de cálculo y los papeles físicos por un panel interactivo que funciona desde cualquier dispositivo.

**¿Qué problema resuelve?**
Coordinar la entrada a un evento con múltiples personas del equipo (organizadores, guardias, asistentes) es difícil cuando todos están mirando listas distintas. EventRoll centraliza todo: un solo panel, roles diferenciados por persona y datos actualizados al instante.

**Casos de uso:** bodas · conferencias · fiestas privadas · eventos corporativos · graduaciones

### Características principales

| | Funcionalidad |
|---|---|
| **Invitados** | CRUD completo, importación masiva desde Excel (hasta 500), exportación a `.xlsx`/CSV |
| **Asistencia** | Toggle con un clic, indicadores visuales, estadísticas en tiempo real |
| **Usuarios** | RBAC con 5 roles y permisos granulares por usuario |
| **Seguridad** | JWT en cookie HttpOnly, blacklist de tokens, rate limiting, CSRF, CSP |
| **Buscador** | Búsqueda en tiempo real con debounce, filtros combinables, historial por sesión |
| **Atajos** | Navegación por teclado completa, panel de atajos con `?` |
| **Deploy** | Docker, GitHub Actions CI/CD, Render.com (backend), GitHub Pages (frontend) |

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
| Email | `admin@prueba.com` |
| Contraseña | `EventRoll@2026!` |

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
- **Exportar** la lista completa a Excel o CSV en cualquier momento
- Descargar plantilla Excel lista para llenar
- Búsqueda en tiempo real por nombre o apellido (debounce 400 ms)
- Filtros por categoría (VIP · General · Familia · Amigos · Trabajo) y por estado de confirmación
- Ordenamiento A-Z / Z-A
- Paginación con tamaño configurable (10 · 25 · 50 · 100 por página)
- Historial de búsquedas recientes guardado por sesión

### ✅ Control de asistencia
Marca quién llegó sin tocar el teclado.

- Toggle de confirmación con un solo clic en cada invitado
- Indicadores visuales: avatar verde (confirmado) · gris (pendiente)
- Estadísticas en tiempo real: Capacidad · Disponibles · Confirmados · Ocupación %
- Barra de progreso de ocupación

### 📊 Estadísticas
Panel dedicado con métricas del evento.

- Total de invitados registrados
- Confirmados vs pendientes
- Porcentaje de ocupación con progreso visual

### 👤 Gestión de usuarios *(solo admin)*
Control total del equipo.

- Crear usuarios con nombre, email, contraseña y rol
- Editar rol y permisos granulares por usuario
- Eliminar usuarios
- Generar y revocar **códigos de acceso de un uso** para guardias
- Los guardias entran con el código, sin necesidad de email ni contraseña

### 🔑 Autenticación y recuperación
Acceso seguro para todos los perfiles.

- Login con email/contraseña
- Login con código de acceso de un uso (modo guardia)
- Recuperación de contraseña por email con código de 6 dígitos y expiración
- Sesión en cookie HttpOnly (inmune a XSS)

### ⌨️ Atajos de teclado
Productividad extra para usuarios avanzados.

- Panel de atajos disponible con `?` o desde el menú
- Navegación rápida entre secciones

---

## Roles y permisos

EventRoll usa un sistema **RBAC** (Role-Based Access Control) con 5 roles y permisos granulares por usuario.

| Permiso | Admin | Organizador | Asistente | Guardia | Visualizador |
|---------|:-----:|:-----------:|:---------:|:-------:|:------------:|
| Ver lista de invitados | ✅ | ✅ | ✅ | ✅ | ✅ |
| Confirmar asistencia | ✅ | ✅ | ✅ | ✅ | — |
| Agregar invitados | ✅ | ✅ | ✅ | — | — |
| Editar invitados | ✅ | ✅ | ✅ | — | — |
| Eliminar invitados | ✅ | ✅ | — | — | — |
| Importar desde Excel | ✅ | ✅ | — | — | — |
| Exportar lista | ✅ | ✅ | ✅ | — | ✅ |
| Configurar capacidad del evento | ✅ | ✅ | — | — | — |
| Gestionar usuarios | ✅ | — | — | — | — |
| Generar códigos de guardia | ✅ | — | — | — | — |

> Los permisos pueden ajustarse individualmente por usuario desde el panel de administración, anulando los valores por defecto del rol.

---

## Cómo funciona

### Arquitectura general

```
┌─────────────────────────────────────────────────────────────┐
│                     Usuario final                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│           Frontend — Vue 3 + Pinia (GitHub Pages)           │
│  ┌─────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  LoginPage  │  │  ListaInvitados  │  │ GestionUsrs   │  │
│  └─────────────┘  └──────────────────┘  └───────────────┘  │
│           Axios (withCredentials: true)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ JSON / HttpOnly Cookie
┌──────────────────────────▼──────────────────────────────────┐
│            Backend — Express.js (Render.com)                 │
│  Routes → Middleware → Controllers → Services → Repos        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │Invitados │  │ Usuarios │  │ Recovery │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ pg driver + SSL
┌──────────────────────────▼──────────────────────────────────┐
│           PostgreSQL 16 (Supabase / local)                   │
│   usuarios · eventos · invitados · actividad · recovery      │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de autenticación

1. El frontend envía credenciales al backend vía `POST /api/v1/auth/login`
2. El backend verifica email + bcrypt hash y firma un JWT
3. El JWT se almacena en una **cookie HttpOnly** (nunca en `localStorage`)
4. Cada request posterior incluye la cookie automáticamente (`withCredentials: true`)
5. El middleware `authenticateToken` valida el JWT, consulta el usuario (con caché 5 min) y adjunta `req.user`
6. Al hacer logout, el token se agrega a una **blacklist en memoria** hasta que expira

### Capas del backend

```
HTTP Request
   ↓
Router            — Define métodos y rutas
   ↓
Middleware         — authenticateToken · requireRole · validateInput · rateLimiter
   ↓
Controller         — Extrae parámetros del request, llama al service, devuelve respuesta
   ↓
Service            — Lógica de negocio, validaciones, reglas
   ↓
Repository         — Queries SQL parametrizadas, acceso exclusivo a la BD
   ↓
PostgreSQL Pool    — Conexiones gestionadas por pg-pool
```

---

## Stack tecnológico

### Frontend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Vue 3 | `^3.5` | Framework UI (Composition API) |
| Vue Router | `^4.6` | Enrutamiento SPA con guards de autenticación |
| Vite | `^7.1` | Build tool y dev server |
| Pinia | `^2.3` | Estado global (sesión, evento activo) |
| Axios | `^1.6` | Cliente HTTP con interceptores |
| ExcelJS | `^4.4` | Importación y exportación de `.xlsx` |
| Lucide Vue | `^0.577` | Íconos SVG |

### Backend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Node.js | `22` | Runtime |
| Express | `^4.18` | Framework web |
| PostgreSQL | `16` | Base de datos |
| jsonwebtoken | `^9.0` | Firma y verificación de JWT |
| bcryptjs | `^3.0` | Hashing de contraseñas |
| express-validator | `^7.0` | Validación de inputs |
| express-rate-limit | `^7.5` | Rate limiting por IP |
| helmet | `^7.1` | Headers de seguridad HTTP |
| cors | `^2.8` | Control de CORS |
| cookie-parser | `^1.4` | Lectura de cookies |
| nodemailer | `^8.0` | Envío de emails (recuperación) |
| winston | `^3.17` | Logging estructurado JSON |
| swagger-ui-express | `^5.0` | Documentación interactiva de la API |
| morgan | `^1.10` | HTTP request logging |

### Testing y DevOps

| Herramienta | Uso |
|------------|-----|
| Vitest | Tests unitarios (servicios) |
| Supertest | Tests de integración (endpoints) |
| GitHub Actions | CI/CD (tests · seguridad · deploy) |
| Docker + Compose | Contenedores y orquestación local |
| nginx | Servidor y proxy reverso en Docker |
| Render.com | Hosting del backend |
| GitHub Pages | Hosting del frontend |
| Supabase | PostgreSQL gestionado en producción |
| gitleaks | Detección de secretos en commits |

---

## Base de datos

### Diagrama de tablas

```
usuarios
├── id            UUID PK
├── nombre        VARCHAR(255)
├── email         VARCHAR(255) UNIQUE
├── password_hash VARCHAR(255)
├── rol           'admin' | 'organizador' | 'asistente' | 'guardia' | 'visualizador'
├── access_code   VARCHAR(12) UNIQUE (para guardias)
├── access_code_expires_at TIMESTAMP
├── permisos      JSONB (overrides granulares)
├── created_at    TIMESTAMP
└── updated_at    TIMESTAMP (auto-actualizado por trigger)

eventos
├── id            UUID PK
├── nombre        VARCHAR(255)
├── fecha         DATE
├── sillas_totales INTEGER DEFAULT 100
├── creado_por    UUID → usuarios(id)
├── created_at    TIMESTAMP
└── updated_at    TIMESTAMP

invitados
├── id            UUID PK
├── evento_id     UUID → eventos(id) ON DELETE CASCADE
├── nombre        VARCHAR(255)
├── apellido      VARCHAR(255)
├── categoria     'General' | 'VIP' | 'Familia' | 'Amigos' | 'Trabajo'
├── confirmado    BOOLEAN DEFAULT FALSE
├── created_at    TIMESTAMP
└── updated_at    TIMESTAMP

actividad  (audit log)
├── id            UUID PK
├── usuario_id    UUID → usuarios(id)
├── accion        VARCHAR(255)
├── detalles      JSONB
└── created_at    TIMESTAMP

recovery_codes
├── id            UUID PK
├── usuario_id    UUID → usuarios(id) ON DELETE CASCADE
├── code          VARCHAR(6)
├── expires_at    TIMESTAMP
└── used          BOOLEAN DEFAULT FALSE
```

### Índices creados

- `idx_usuarios_email` — búsquedas de login
- `idx_invitados_evento` — filtrar por evento
- `idx_invitados_nombre_lower` — búsqueda case-insensitive por nombre
- `idx_invitados_apellido_lower` — búsqueda case-insensitive por apellido
- `idx_invitados_unique_per_event` — UNIQUE(evento_id, LOWER(nombre), LOWER(apellido)) para evitar duplicados
- `idx_actividad_usuario` y `idx_actividad_fecha` — consultas de auditoría

---

## Instalación local

### Requisitos previos

- Node.js `>= 20`
- npm `>= 9`
- PostgreSQL `>= 14` corriendo en `localhost:5432`

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/runer0101/EventRoll.git
cd EventRoll

# 2. Instalar dependencias
npm install                    # frontend
npm install --prefix backend   # backend

# 3. Configurar entorno
cp backend/.env.example backend/.env
```

Editar `backend/.env` con al menos:

```env
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/eventroll
JWT_SECRET=<cadena aleatoria de 64+ caracteres>
DEFAULT_ADMIN_PASSWORD=<contraseña segura para el admin>
```

Generar un JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```bash
# 4. Crear tablas y datos iniciales
npm run migrate --prefix backend   # crea tablas e índices
npm run seed --prefix backend      # crea el usuario admin y un evento de prueba

# 5. Iniciar los servidores (dos terminales)

# Terminal 1 — Backend (puerto 3000)
npm run dev --prefix backend

# Terminal 2 — Frontend (puerto 5173)
npm run dev
```

### URLs locales

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api/docs |
| Health check | http://localhost:3000/health |

**Credenciales iniciales:**

| Campo | Valor |
|-------|-------|
| Email | `admin@prueba.com` |
| Contraseña | El valor de `DEFAULT_ADMIN_PASSWORD` en tu `.env` |

---

## Docker — stack completo en un comando

```bash
# 1. Copiar variables de entorno
cp .env.example .env
# Editar .env: DB_PASSWORD, JWT_SECRET, CORS_ORIGIN, EMAIL_*

# 2. Levantar todos los servicios
docker compose up -d

# 3. Ver logs
docker compose logs -f
```

### Servicios Docker

| Servicio | Imagen | Puerto | Descripción |
|---------|--------|--------|-------------|
| `db` | postgres:16-alpine | 5432 | Base de datos |
| `backend` | Node.js 22 | 3000 | API REST |
| `frontend` | nginx | 80 | App Vue + proxy |

**URLs con Docker:**

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost |
| API | http://localhost/api |
| Swagger Docs | http://localhost/api/docs |

```bash
# Detener todo
docker compose down

# Detener y borrar datos
docker compose down -v
```

---

## Scripts disponibles

### Frontend (raíz del proyecto)

```bash
npm run dev              # Servidor de desarrollo (Vite)
npm run build            # Build de producción
npm run preview          # Preview del build
npm run lint             # ESLint
npm run test             # Tests unitarios (Vitest)
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Tests con reporte de cobertura
```

### Backend (`cd backend`)

```bash
npm run dev          # Servidor con nodemon (recarga automática)
npm start            # Servidor de producción (sin nodemon)
npm run migrate      # Crear/actualizar tablas en la BD
npm run seed         # Poblar BD con admin + evento de prueba
npm test             # Tests unitarios con Vitest
npm run test:coverage    # Tests unitarios con reporte de cobertura
npm run test:integration # Tests de integración (requiere BD)
```

---

## Referencia de la API

La documentación completa e interactiva está en Swagger:
**https://eventroll.onrender.com/api/docs**

> Todos los endpoints están bajo el prefijo `/api/v1/`.

### Endpoints principales

#### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/auth/login` | Login con email y contraseña | — |
| `POST` | `/api/v1/auth/login-con-codigo` | Login con código de guardia | — |
| `GET` | `/api/v1/auth/me` | Usuario actual autenticado | ✅ |
| `POST` | `/api/v1/auth/logout` | Cerrar sesión y revocar token | ✅ |

#### Recuperación de contraseña

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/password-recovery/solicitar-codigo` | Enviar código al email | — |
| `POST` | `/api/v1/password-recovery/verificar-codigo` | Verificar el código | — |
| `POST` | `/api/v1/password-recovery/restablecer-password` | Nueva contraseña | — |

#### Invitados

| Método | Endpoint | Descripción | Rol mínimo |
|--------|----------|-------------|-----------|
| `GET` | `/api/v1/invitados` | Lista paginada con filtros | Cualquiera |
| `POST` | `/api/v1/invitados` | Crear invitado | Organizador |
| `POST` | `/api/v1/invitados/import` | Importar desde Excel | Organizador |
| `PUT` | `/api/v1/invitados/:id` | Actualizar invitado | Organizador |
| `DELETE` | `/api/v1/invitados/:id` | Eliminar invitado | Organizador |

**Query params de GET `/api/v1/invitados`:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `evento_id` | UUID | **Requerido** — filtra por evento |
| `page` | number | Página (default: 1) |
| `limit` | number | Tamaño de página (max: 100) |
| `search` | string | Busca en nombre y apellido (ILIKE) |
| `categoria` | string | Filtra por categoría |
| `confirmado` | boolean | Filtra por estado |
| `sort` | string | Campo de ordenamiento |
| `order` | `asc` \| `desc` | Dirección |

#### Usuarios

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| `GET` | `/api/v1/usuarios` | Listar usuarios | Admin |
| `POST` | `/api/v1/usuarios` | Crear usuario | Admin |
| `PUT` | `/api/v1/usuarios/:id` | Editar usuario | Admin |
| `DELETE` | `/api/v1/usuarios/:id` | Eliminar usuario | Admin |
| `POST` | `/api/v1/usuarios/:id/generar-codigo` | Código de guardia | Admin |
| `DELETE` | `/api/v1/usuarios/:id/revocar-codigo` | Revocar código | Admin |

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Requerida | Valor por defecto | Descripción |
|----------|:---------:|-------------------|-------------|
| `DATABASE_URL` | ✅ | — | URL de conexión PostgreSQL |
| `JWT_SECRET` | ✅ | — | Clave secreta para firmar JWT (64+ chars) |
| `CORS_ORIGIN` | ✅ | `http://localhost:5173` | Origen permitido del frontend |
| `PORT` | — | `3000` | Puerto del servidor |
| `JWT_EXPIRES_IN` | — | `24h` | Expiración del token |
| `NODE_ENV` | — | `development` | `development` · `test` · `production` |
| `SALT_ROUNDS` | — | `10` | Rondas de bcrypt |
| `LOG_LEVEL` | — | `debug` | `debug` · `info` · `warn` · `error` |
| `RATE_LIMIT_MAX` | — | `100` | Requests por ventana de tiempo |
| `DEFAULT_ADMIN_PASSWORD` | — | — | Contraseña del admin creado por seed |
| `EMAIL_HOST` | — | — | SMTP host (ej: `smtp.gmail.com`) |
| `EMAIL_PORT` | — | `587` | SMTP puerto |
| `EMAIL_USER` | — | — | Email del remitente |
| `EMAIL_PASS` | — | — | App password del email |
| `EMAIL_ADMIN_BACKUP` | — | — | Email de respaldo del admin |
| `FRONTEND_URL` | — | `http://localhost:5173` | URL del frontend (para links en emails) |
| `ALLOW_BEARER_TOKEN` | — | `false` | `true` solo en dev/test |
| `DB_SSL_REJECT_UNAUTHORIZED` | — | `false` | `true` en producción con CA cert |

### Frontend (`.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base de la API (ej: `https://eventroll.onrender.com/api`) |

---

## Seguridad

### Autenticación
- Contraseñas hasheadas con **bcrypt** (10 rondas)
- JWT firmado y almacenado en **cookie HttpOnly** — nunca en `localStorage`
- **Blacklist de tokens** revocados en memoria, con limpieza automática al expirar
- Caché de usuarios autenticados con TTL de 5 minutos para reducir queries a BD
- **Códigos de acceso** de un uso para guardias, con expiración por tiempo

### Rate limiting

| Endpoint | Límite |
|----------|--------|
| Rutas de API (global) | 100 req / 15 min |
| `POST /api/auth/login` | 20 intentos / 15 min |
| Solicitar código de recovery | 5 intentos / 15 min |
| Verificar código de recovery | 5 intentos / 15 min |
| Generar código de guardia | 10 generaciones / min |

### Protección de datos
- **SQL injection**: todas las queries usan parámetros (`$1`, `$2`…), nunca interpolación
- **CORS**: restringido al origen exacto del frontend
- **CSRF**: validación del header `Origin` en métodos mutantes (POST, PUT, DELETE, PATCH)
- **Helmet**: headers de seguridad (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- **Validación de inputs**: `express-validator` en todos los endpoints
- **Constraint de duplicados**: UNIQUE en (evento_id, LOWER(nombre), LOWER(apellido))

### Auditoría y logging
- **Winston** con formato JSON estructurado
- Campos sensibles auto-redactados (passwords, tokens, códigos)
- Tabla `actividad` para audit trail completo de acciones del usuario
- Header `X-Request-ID` en cada request para correlación de logs
- Stack traces ocultos en producción

### Infraestructura
- Docker con usuario no-root (`appuser`)
- Multi-stage builds (dependencias aisladas del código fuente)
- Imágenes Alpine (superficie de ataque mínima)
- Límites de CPU y memoria por contenedor
- Pre-commit hooks con **gitleaks** y scanner personalizado de secretos
- `.gitignore` excluye `.env` y archivos sensibles

---

## Estructura del proyecto

```
EventRoll/
├── src/                              # Frontend — Vue 3
│   ├── App.vue                       # Punto de montaje (solo RouterView + Toast)
│   ├── main.js                       # Punto de entrada — registra Vue, Pinia, Router
│   ├── router/
│   │   └── index.js                  # Vue Router: rutas públicas, guard de autenticación
│   ├── views/                        # Páginas de la SPA (ruteadas por Vue Router)
│   │   ├── HomeView.vue              # Landing page pública
│   │   ├── LoginView.vue             # Página de login
│   │   ├── AppShell.vue              # Layout autenticado (sidebar + RouterView)
│   │   ├── InvitadosView.vue         # Vista de lista de invitados
│   │   ├── EstadisticasView.vue      # Vista de estadísticas
│   │   ├── ConfiguracionView.vue     # Vista de configuración del evento
│   │   ├── ActividadView.vue         # Vista de actividad reciente
│   │   └── UsuariosView.vue          # Vista de gestión de usuarios
│   ├── components/
│   │   ├── HomePage.vue              # Componente de la landing page
│   │   ├── LoginPage.vue             # Formulario de login + recuperación
│   │   ├── ListaInvitados.vue        # CRUD de invitados (vista principal)
│   │   ├── GestionUsuarios.vue       # Administración de usuarios
│   │   ├── PanelUsuarios.vue         # Perfil del usuario actual
│   │   ├── Sidebar.vue               # Navegación lateral responsive
│   │   ├── EmptyState.vue            # Estado vacío reutilizable (accesible)
│   │   ├── FieldError.vue            # Error por campo de formulario
│   │   ├── ShortcutsHelp.vue         # Modal de atajos de teclado
│   │   ├── ToastNotification.vue     # Notificación individual
│   │   ├── ToastContainer.vue        # Contenedor de notificaciones
│   │   └── LoadingSpinner.vue        # Overlay de carga
│   ├── services/
│   │   └── api.js                    # Cliente Axios + métodos de la API (/api/v1/)
│   ├── stores/
│   │   ├── auth.js                   # Sesión, usuario y permisos (Pinia)
│   │   ├── evento.js                 # Evento activo (Pinia)
│   │   └── ui.js                     # Loading, modales y notificaciones (Pinia)
│   ├── composables/
│   │   ├── useToast.js               # Notificaciones toast
│   │   ├── useLoading.js             # Estado de carga global
│   │   ├── useSearchHistory.js       # Historial de búsquedas
│   │   ├── useSavedFilters.js        # Filtros persistentes por sesión
│   │   └── useKeyboardShortcuts.js   # Atajos de teclado
│   ├── __tests__/
│   │   └── stores/                   # Tests unitarios de Pinia stores (Vitest)
│   └── utils/
│       ├── excelImporter.js          # Lógica de importación con ExcelJS
│       └── migrateToBackend.js       # Utilidad de migración desde localStorage
│
├── backend/                          # API — Express + PostgreSQL
│   ├── src/
│   │   ├── server.js                 # Punto de entrada del servidor
│   │   ├── app.js                    # Express: middleware + rutas
│   │   ├── config/
│   │   │   ├── database.js           # Pool de conexiones PostgreSQL
│   │   │   ├── migrate.js            # Esquema principal (tablas + índices)
│   │   │   ├── migrate-v1.4.js       # Migraciones versionadas
│   │   │   ├── migrate-v1.5.js
│   │   │   ├── migrate-v1.6.js
│   │   │   ├── seed.js               # Admin + evento de prueba
│   │   │   ├── swagger.js            # Especificación OpenAPI
│   │   │   └── validateEnv.js        # Validación de variables al arrancar
│   │   ├── controllers/              # Capa HTTP (request → response)
│   │   │   ├── authController.js
│   │   │   ├── invitadosController.js
│   │   │   ├── usuariosController.js
│   │   │   └── passwordRecoveryController.js
│   │   ├── services/                 # Lógica de negocio
│   │   │   ├── authService.js
│   │   │   ├── invitadosService.js
│   │   │   ├── usuariosService.js
│   │   │   ├── activityService.js
│   │   │   ├── emailService.js
│   │   │   └── passwordRecoveryService.js
│   │   ├── repositories/             # Acceso a datos (SQL puro)
│   │   │   ├── invitadosRepository.js
│   │   │   ├── usuariosRepository.js
│   │   │   ├── authRepository.js
│   │   │   └── passwordRecoveryRepository.js
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT + rate limiters + caché de usuarios
│   │   │   ├── validators.js         # Validaciones de entrada por endpoint
│   │   │   ├── errorHandler.js       # Manejo global de errores
│   │   │   └── requestId.js          # Generador de X-Request-ID
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── invitadosRoutes.js
│   │   │   ├── usuariosRoutes.js
│   │   │   └── password-recovery.js
│   │   ├── core/errors/
│   │   │   └── AppError.js           # Clase de error personalizada
│   │   └── utils/
│   │       ├── logger.js             # Winston con redacción de campos sensibles
│   │       └── asyncHandler.js       # Wrapper para manejo de errores async
│   ├── tests/
│   │   ├── unit/                     # Vitest — servicios con mocks
│   │   └── integration/              # Supertest — endpoints contra BD real
│   ├── scripts/
│   │   ├── cambiar-password.js       # CLI para cambiar contraseña
│   │   └── check-secrets.cjs         # Scanner de secretos pre-commit
│   ├── Dockerfile                    # Multi-stage build para producción
│   └── .env.example                  # Plantilla de variables de entorno
│
├── .github/
│   └── workflows/
│       ├── test.yml                  # Unitarios + integración + lint
│       ├── security.yml              # gitleaks + npm audit
│       └── deploy.yml                # Deploy a GitHub Pages
│
├── docker-compose.yml                # Orquestación: db + backend + frontend
├── docker-compose.override.yml       # Overrides para desarrollo local
├── Dockerfile.frontend               # Build Vue + nginx
├── nginx.conf                        # Configuración del proxy reverso
├── render.yaml                       # Configuración de Render.com
├── vite.config.js                    # Configuración de Vite
├── .gitleaks.toml                    # Reglas de detección de secretos
├── CONTRIBUTING.md                   # Guía de contribución
├── CHANGELOG.md                      # Historial de versiones
└── LICENSE                           # MIT
```

---

## Contribuir

Las contribuciones son bienvenidas. Lee [CONTRIBUTING.md](CONTRIBUTING.md) antes de abrir un PR.

```bash
# Fork + clonar
git clone https://github.com/tu-usuario/EventRoll.git

# Crear rama
git checkout -b feat/mi-mejora

# Hacer cambios + tests
npm test --prefix backend
npm run lint

# Push y PR
git push origin feat/mi-mejora
```

Los PRs deben pasar todos los checks de CI (tests, lint, seguridad) para ser considerados.

---

## Licencia

MIT — ver [LICENSE](LICENSE) para más detalles.
