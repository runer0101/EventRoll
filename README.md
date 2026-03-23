# EventRoll

> Plataforma web para gestionar invitados en eventos — listas, asistencia en tiempo real, roles de equipo e importación masiva desde Excel.

[![Tests](https://github.com/runer0101/EventRoll/actions/workflows/test.yml/badge.svg)](https://github.com/runer0101/EventRoll/actions/workflows/test.yml)
[![Security](https://github.com/runer0101/EventRoll/actions/workflows/security.yml/badge.svg)](https://github.com/runer0101/EventRoll/actions/workflows/security.yml)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![Licencia](https://img.shields.io/badge/licencia-MIT-blue)

---

## ¿Qué es EventRoll?

EventRoll es una aplicación web fullstack diseñada para equipos que organizan eventos y necesitan controlar quién asiste. Permite:

- Cargar una lista de invitados (manualmente o desde un archivo Excel)
- Confirmar llegadas en tiempo real durante el evento
- Asignar roles específicos a cada miembro del equipo (quién puede ver, editar o solo confirmar)
- Gestionar múltiples eventos desde un mismo panel

**Casos de uso típicos:** bodas, conferencias, fiestas privadas, eventos corporativos, graduaciones.

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

## Cómo funciona

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

El frontend (Vue 3 + Vite) se comunica con el backend exclusivamente a través de una API REST. La sesión del usuario se maneja con un **JWT almacenado en una cookie HttpOnly** — nunca toca el JavaScript del navegador, lo que evita ataques XSS.

---

## Funcionalidades principales

### 👥 Gestión de invitados
- Crear, editar y eliminar invitados individualmente
- Importar listas masivas desde archivos `.xlsx` (hasta 500 por lote)
- Exportar la lista actual a Excel
- Búsqueda en tiempo real por nombre o apellido
- Filtros por categoría (VIP, General, Familia, Amigos, Trabajo) y estado de confirmación
- Paginación server-side eficiente para eventos con miles de invitados

### ✅ Control de asistencia
- Confirmar o desconfirmar invitados con un clic
- Estadísticas en vivo: total, confirmados, pendientes y porcentaje de ocupación
- Indicador visual de progreso en el panel de estadísticas

### 🔐 Roles y acceso
- **5 roles con permisos distintos** — cada miembro del equipo ve solo lo que necesita
- Códigos de acceso de un solo uso para guardias (sin necesidad de contraseña)
- Recuperación de contraseña por email (código de 6 dígitos con expiración)

### 📊 Multi-evento
- Cada evento tiene su propia lista de invitados completamente independiente
- Cambiar de evento activo desde el panel de configuración

---

## Roles y permisos

| Acción | Admin | Organizador | Asistente | Guardia | Visualizador |
|--------|:-----:|:-----------:|:---------:|:-------:|:------------:|
| Ver invitados | ✓ | ✓ | ✓ | ✓ | ✓ |
| Crear / editar invitados | ✓ | ✓ | ✓ | — | — |
| Eliminar invitados | ✓ | ✓ | — | — | — |
| Confirmar asistencia | ✓ | ✓ | ✓ | ✓ | — |
| Importar / exportar Excel | ✓ | ✓ | solo exportar | — | solo exportar |
| Gestionar usuarios del equipo | ✓ | — | — | — | — |
| Cambiar evento activo | ✓ | ✓ | — | — | — |

---

## Arquitectura del backend

El backend sigue una **arquitectura en capas** para separar responsabilidades y facilitar las pruebas:

```
HTTP Request
    │
    ▼
Routes          → define el endpoint y qué middleware aplica
    │
    ▼
Middleware      → autenticación JWT, validación de rol, rate limiting
    │
    ▼
Controllers     → extrae parámetros del request, llama al service
    │
    ▼
Services        → lógica de negocio (validaciones, reglas, errores)
    │
    ▼
Repositories    → SQL parametrizado, acceso a PostgreSQL
    │
    ▼
PostgreSQL
```

Esta separación permite testear cada capa de forma independiente. Los tests unitarios mockean el repositorio; los tests de integración usan una base de datos real.

---

## Stack tecnológico

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| Frontend | Vue 3 + Vite | SPA reactiva con componentes |
| Estado global | Pinia | Store de auth y evento activo |
| Peticiones HTTP | Axios | Interceptores para errores y sesión |
| Íconos | Lucide Vue | Íconos SVG consistentes |
| Excel | ExcelJS | Import/export de archivos `.xlsx` |
| Backend | Node.js 22 + Express | API REST |
| Base de datos | PostgreSQL 16 | Persistencia principal |
| Auth | JWT + bcryptjs | Sesión y hash de contraseñas |
| Logs | Winston | Logging estructurado en JSON |
| Tests unitarios | Vitest | Tests rápidos con mocks |
| Tests integración | Supertest | Tests end-to-end de la API |
| CI/CD | GitHub Actions | Tests + seguridad en cada push |
| Deploy backend | Render | Auto-deploy desde `main` |
| Deploy frontend | GitHub Pages | Build estático de Vue |
| DB producción | Supabase | PostgreSQL gestionado |
| Contenedores | Docker + Nginx | Stack local completo |

---

## Base de datos

### Esquema de tablas

```
usuarios
├── id             UUID, PK
├── nombre         VARCHAR
├── email          VARCHAR, UNIQUE
├── password_hash  VARCHAR
├── rol            VARCHAR  (admin | organizador | asistente | guardia | visualizador)
├── permisos       JSONB    (permisos granulares opcionales)
├── access_code    VARCHAR  (código de acceso de un solo uso, nullable)
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
├── categoria      VARCHAR  (General | VIP | Familia | Amigos | Trabajo)
├── confirmado     BOOLEAN
└── created_at     TIMESTAMP

actividad
├── id             UUID, PK
├── usuario_id     UUID → usuarios
├── accion         VARCHAR
├── detalles       JSONB
└── created_at     TIMESTAMP

recovery_codes
├── id             UUID, PK
├── usuario_id     UUID → usuarios
├── code           VARCHAR(6)
├── expires_at     TIMESTAMP
└── used           BOOLEAN
```

---

## Requisitos locales

- Node.js 22+ (o 20.19+)
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
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env: DATABASE_URL, JWT_SECRET, DEFAULT_ADMIN_PASSWORD

# Frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api (ya configurado por defecto)
```

Generar un JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Crear las tablas en la base de datos

```bash
cd backend
npm run migrate          # tablas principales (usuarios, invitados, eventos)
npm run migrate:v1.4     # tabla de actividad (log de auditoría)
npm run migrate:v1.5     # tabla de recuperación de contraseña
npm run migrate:v1.6     # índices de búsqueda y restricción UNIQUE por evento
npm run seed             # opcional: crea el usuario admin y datos de ejemplo
```

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

```bash
cp .env.example .env
# Completar: DB_PASSWORD, JWT_SECRET, CORS_ORIGIN

docker compose up -d
# → Frontend:  http://localhost
# → API:       http://localhost/api
```

El `docker-compose.yml` levanta PostgreSQL, la API y Nginx como reverse proxy.

---

## Scripts disponibles

### Frontend (`/`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Build optimizado de producción |
| `npm run preview` | Preview local del build |
| `npm run lint` | Análisis estático con ESLint |
| `npm run lint:fix` | Auto-corrección de errores de lint |
| `npm run format` | Formateo con Prettier |

### Backend (`/backend`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor con nodemon (recarga automática) |
| `npm run start` | Servidor en modo producción |
| `npm run migrate` | Migración del esquema base |
| `npm run migrate:v1.4/v1.5/v1.6` | Migraciones incrementales |
| `npm run seed` | Carga datos de ejemplo |
| `npm run cambiar-password` | Resetear contraseña de un usuario |
| `npm run test` | Tests unitarios |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Reporte de cobertura |
| `npm run test:integration` | Tests de integración (requiere DB activa) |

---

## Referencia de la API

Documentación interactiva completa en [`/api/docs`](https://eventroll.onrender.com/api/docs) (Swagger UI).

| Método | Endpoint | Rol mínimo | Descripción |
|--------|----------|------------|-------------|
| POST | `/api/auth/login` | — | Login, establece cookie HttpOnly |
| POST | `/api/auth/login-con-codigo` | — | Login rápido con código de acceso |
| GET | `/api/auth/me` | cualquiera | Usuario autenticado actual |
| POST | `/api/auth/logout` | cualquiera | Cierra sesión y limpia la cookie |
| POST | `/api/auth/recovery/request` | — | Solicita código de recuperación por email |
| POST | `/api/auth/recovery/verify` | — | Verifica el código de 6 dígitos |
| POST | `/api/auth/recovery/reset` | — | Restablece la contraseña |
| GET | `/api/invitados` | cualquiera | Lista paginada con filtros |
| POST | `/api/invitados` | organizador+ | Crea un invitado |
| POST | `/api/invitados/import` | organizador+ | Importa hasta 500 invitados por lote |
| PUT | `/api/invitados/:id` | organizador+ | Actualiza nombre, categoría o confirmación |
| DELETE | `/api/invitados/:id` | organizador+ | Elimina un invitado |
| GET | `/api/usuarios` | admin | Lista usuarios del sistema |
| POST | `/api/usuarios` | admin | Crea un usuario nuevo |
| PUT | `/api/usuarios/:id` | admin | Edita nombre, email, rol o permisos |
| DELETE | `/api/usuarios/:id` | admin | Elimina un usuario |
| POST | `/api/usuarios/:id/generar-codigo` | admin | Genera código de acceso |
| DELETE | `/api/usuarios/:id/revocar-codigo` | admin | Revoca el código de acceso |
| GET | `/health` | — | Estado de la API y la base de datos |

> La autenticación usa **cookies HttpOnly** — el token JWT nunca es accesible desde JavaScript. Las peticiones deben enviarse con `withCredentials: true`.

---

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | ✓ | Cadena de conexión PostgreSQL completa |
| `JWT_SECRET` | ✓ | String aleatorio de mínimo 64 caracteres |
| `JWT_EXPIRES_IN` | — | Expiración del token (default: `24h`) |
| `CORS_ORIGIN` | ✓ prod | URL exacta del frontend (sin barra final) |
| `DEFAULT_ADMIN_PASSWORD` | — | Contraseña del admin generado por el seed |
| `EMAIL_HOST` | — | Servidor SMTP para recuperación de contraseña |
| `EMAIL_PORT` | — | Puerto SMTP (default: `587`) |
| `EMAIL_USER` | — | Correo SMTP |
| `EMAIL_PASS` | — | App password del correo SMTP |
| `NODE_ENV` | — | `development` o `production` |
| `EXPOSE_ERROR_STACK` | — | `true` solo en desarrollo local controlado |

Ver `backend/.env.example` para todos los valores disponibles.

---

## Seguridad

- Contraseñas cifradas con **bcrypt** (10 rounds) — nunca se almacenan en texto plano
- JWT en **cookies HttpOnly** — inaccesibles para XSS desde el navegador
- **Rate limiting** en tres niveles: 100 req/15 min global · 20 intentos de login · 5 de recovery
- **SQL injection** prevenida con queries parametrizadas (`$1, $2…`) y whitelist en ORDER BY
- **Helmet** configura cabeceras de seguridad HTTP automáticamente
- **gitleaks** + hook de Husky escanean cada commit buscando secretos expuestos
- Campos sensibles (passwords, tokens, códigos) **redactados automáticamente en logs**
- `X-Request-ID` único por petición para correlación de logs y auditoría

> Nunca subas tu archivo `.env`. Está excluido por `.gitignore`.

---

## Estructura del proyecto

```
EventRoll/
├── src/                          # Frontend (Vue 3 + Vite)
│   ├── components/
│   │   ├── HomePage.vue          # Landing page pública
│   │   ├── LoginPage.vue         # Formulario de login
│   │   ├── ListaInvitados.vue    # Vista principal — CRUD de invitados
│   │   ├── GestionUsuarios.vue   # Admin: gestión de usuarios del equipo
│   │   ├── PanelUsuarios.vue     # Perfil de usuario y permisos
│   │   ├── Sidebar.vue           # Navegación lateral
│   │   ├── ToastNotification.vue # Notificaciones flotantes
│   │   └── ShortcutsHelp.vue     # Modal de atajos de teclado
│   ├── services/
│   │   └── api.js                # Cliente Axios + interceptores de error
│   ├── stores/
│   │   ├── auth.js               # Estado de sesión (Pinia)
│   │   └── evento.js             # Evento activo actual (Pinia)
│   └── composables/
│       ├── useToast.js           # Sistema de notificaciones
│       └── useLoading.js         # Overlay de carga global
│
├── backend/                      # API REST (Node.js + Express)
│   ├── src/
│   │   ├── app.js                # Setup de Express: middleware y rutas
│   │   ├── server.js             # Punto de entrada — arranca el servidor
│   │   ├── config/
│   │   │   ├── database.js       # Pool de conexiones PostgreSQL
│   │   │   ├── migrate.js        # Esquema base y migraciones
│   │   │   └── validateEnv.js    # Falla rápido si faltan variables críticas
│   │   ├── controllers/          # Traduce HTTP ↔ service (sin lógica de dominio)
│   │   ├── services/             # Reglas de negocio, validaciones, errores
│   │   ├── repositories/         # Queries SQL parametrizadas a PostgreSQL
│   │   ├── middleware/
│   │   │   ├── auth.js           # Verificación JWT desde cookie
│   │   │   ├── requireRole.js    # Control de acceso por rol
│   │   │   └── errorHandler.js   # Formato de errores y logging
│   │   ├── routes/               # Definición de rutas y middleware por endpoint
│   │   └── utils/
│   │       └── logger.js         # Winston: JSON estructurado con redacción
│   └── tests/
│       ├── unit/                 # Vitest + mocks de repositorios
│       └── integration/          # Supertest contra PostgreSQL real
│
├── .github/
│   └── workflows/
│       ├── test.yml              # CI: unit tests + integration tests
│       └── security.yml          # CI: auditoría npm + gitleaks
│
├── docker-compose.yml            # PostgreSQL + API + Nginx en local
├── Dockerfile.frontend           # Build estático de Vue para Docker
├── render.yaml                   # Infra como código para Render
└── nginx.conf                    # Configuración del reverse proxy
```

---

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para convenciones de código, setup de desarrollo y cómo abrir un pull request.

## Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para el historial de cambios por versión.

## Licencia

[MIT](LICENSE)
