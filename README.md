# EventRoll

> Plataforma web para gestión de invitados en eventos — administra listas, registra asistencia, asigna roles al equipo e importa invitados en masa desde Excel.

[![Tests](https://github.com/runer0101/EventRoll/actions/workflows/test.yml/badge.svg)](https://github.com/runer0101/EventRoll/actions/workflows/test.yml)
[![Security](https://github.com/runer0101/EventRoll/actions/workflows/security.yml/badge.svg)](https://github.com/runer0101/EventRoll/actions/workflows/security.yml)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![Licencia](https://img.shields.io/badge/licencia-MIT-blue)

---

## Demo en vivo

| Servicio | URL |
|----------|-----|
| **Frontend** | **https://runer0101.github.io/EventRoll** |
| Backend API | https://eventroll.onrender.com |
| Health check | https://eventroll.onrender.com/health |
| API Docs (Swagger) | https://eventroll.onrender.com/api/docs |

> El backend corre en Render Free tier — la primera petición tras inactividad puede tardar ~50 segundos mientras despierta.

---

## Funcionalidades

- **Control de acceso por roles** — 5 niveles: admin, organizador, asistente, guardia, visualizador
- **Gestión de invitados** — crear, editar, eliminar, filtrar, buscar y confirmar asistencia
- **Registro de asistencia en tiempo real** — confirma llegadas al instante desde cualquier dispositivo
- **Importación/exportación masiva desde Excel** — importa cientos de invitados con un clic
- **Recuperación de contraseña** — código de 6 dígitos enviado por email
- **Códigos de acceso de un solo uso** — login rápido para guardias sin contraseña
- **Soporte multi-evento** — listas independientes por evento
- **Auth JWT con cookies HttpOnly** — tokens nunca expuestos a JavaScript del cliente
- **Trazabilidad con Request ID** — cada petición recibe un ID único para correlación de logs
- **Paginación y búsqueda server-side** — eficiente con cualquier volumen de invitados
- **Documentación Swagger** — disponible en `/api/docs`
- **Docker ready** — stack completo (API + DB + Nginx) con un solo comando

---

## Roles y permisos

| Permiso | Admin | Organizador | Asistente | Guardia | Visualizador |
|---------|:-----:|:-----------:|:---------:|:-------:|:------------:|
| Ver invitados | ✓ | ✓ | ✓ | ✓ | ✓ |
| Crear / editar invitados | ✓ | ✓ | ✓ | — | — |
| Eliminar invitados | ✓ | ✓ | — | — | — |
| Confirmar asistencia | ✓ | ✓ | ✓ | ✓ | — |
| Importar / exportar Excel | ✓ | ✓ | exportar | — | exportar |
| Gestionar usuarios | ✓ | — | — | — | — |
| Cambiar evento activo | ✓ | ✓ | — | — | — |

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Vue 3, Vite, Pinia, Axios, ExcelJS, Lucide Icons |
| Backend | Node.js 22, Express, PostgreSQL, bcryptjs, JWT |
| Infraestructura | Docker, Nginx, Winston |
| Tests | Vitest, Supertest |
| CI/CD | GitHub Actions → Render (auto-deploy en push a `main`) |
| Base de datos prod | Supabase PostgreSQL (Session Pooler IPv4, AWS us-east-2) |

---

## Requisitos locales

- Node.js 22+ (o 20.19+)
- npm 9+
- PostgreSQL 14+ (para desarrollo local)

---

## Instalación local

### 1. Clonar

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
cp backend/.env.example backend/.env
# Editar backend/.env — completar DATABASE_URL, JWT_SECRET y opciones de email

cp .env.example .env
# VITE_API_URL=http://localhost:3000/api  (ya configurado por defecto)
```

Generar un JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Ejecutar migraciones

```bash
cd backend
npm run migrate          # esquema base + tablas principales
npm run migrate:v1.4     # log de actividad
npm run migrate:v1.5     # recuperación de contraseña
npm run migrate:v1.6     # índices y restricciones únicas
npm run seed             # opcional: carga datos de ejemplo
```

### 5. Iniciar servidores de desarrollo

```bash
# Terminal 1 — API
cd backend && npm run dev

# Terminal 2 — Frontend (raíz del proyecto)
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

**Credenciales por defecto** (cambiar tras el primer login):

| Campo | Valor |
|-------|-------|
| Email | `admin@prueba` |
| Password | valor de `DEFAULT_ADMIN_PASSWORD` en `backend/.env` |

---

## Docker (stack completo local)

```bash
cp .env.example .env
# Completar DB_PASSWORD, JWT_SECRET, CORS_ORIGIN en .env

docker compose up -d
```

El stack queda disponible en `http://localhost`.

---

## Scripts disponibles

### Frontend (`/`)

```bash
npm run dev          # Servidor de desarrollo (http://localhost:5173)
npm run build        # Build de producción
npm run preview      # Preview del build de producción
npm run lint         # Lint de src/ con ESLint
npm run lint:fix     # Auto-corregir errores de lint
npm run format       # Formatear src/ con Prettier
```

### Backend (`/backend`)

```bash
npm run dev                # Iniciar con nodemon (auto-recarga)
npm run start              # Iniciar servidor en producción
npm run migrate            # Migración de esquema base
npm run migrate:v1.4       # Tabla de log de actividad
npm run migrate:v1.5       # Tabla de recuperación de contraseña
npm run migrate:v1.6       # Índices y restricciones únicas
npm run seed               # Datos de ejemplo
npm run cambiar-password   # Script interactivo de reseteo de contraseña
npm run test               # Tests unitarios
npm run test:watch         # Tests en modo watch
npm run test:coverage      # Tests con reporte de cobertura
npm run test:integration   # Tests de integración (requiere DB)
```

---

## Referencia de la API

Documentación interactiva completa en `https://eventroll.onrender.com/api/docs`.

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Login (devuelve cookie HttpOnly) |
| POST | `/api/auth/login-con-codigo` | — | Login rápido con código de acceso |
| GET | `/api/auth/me` | requerida | Obtener usuario actual |
| POST | `/api/auth/logout` | requerida | Cerrar sesión y limpiar cookie |
| GET | `/api/invitados` | requerida | Listar invitados (paginado + filtros) |
| POST | `/api/invitados` | organizador+ | Crear invitado |
| POST | `/api/invitados/import` | organizador+ | Importación masiva desde Excel |
| PUT | `/api/invitados/:id` | organizador+ | Actualizar invitado |
| DELETE | `/api/invitados/:id` | organizador+ | Eliminar invitado |
| GET | `/api/usuarios` | admin | Listar usuarios |
| POST | `/api/usuarios` | admin | Crear usuario |
| PUT | `/api/usuarios/:id` | admin | Actualizar usuario |
| DELETE | `/api/usuarios/:id` | admin | Eliminar usuario |
| POST | `/api/usuarios/:id/generar-codigo` | admin | Generar código de acceso |
| DELETE | `/api/usuarios/:id/revocar-codigo` | admin | Revocar código de acceso |
| POST | `/api/auth/recovery/request` | — | Solicitar código de recuperación |
| POST | `/api/auth/recovery/verify` | — | Verificar código |
| POST | `/api/auth/recovery/reset` | — | Resetear contraseña |
| GET | `/health` | — | Health check (incluye estado de BD) |

> La autenticación usa **cookies HttpOnly** (`withCredentials: true`). No se requiere header `Authorization` en condiciones normales.

---

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | sí | Cadena de conexión PostgreSQL |
| `JWT_SECRET` | sí | Secreto aleatorio, mín. 32 caracteres (64+ recomendado) |
| `JWT_EXPIRES_IN` | no | Expiración del token, por defecto `24h` |
| `CORS_ORIGIN` | sí (prod) | URL del frontend |
| `EMAIL_HOST` | no | Servidor SMTP (para recuperación de contraseña) |
| `EMAIL_PORT` | no | Puerto SMTP, por defecto `587` |
| `EMAIL_USER` | no | Dirección de correo SMTP |
| `EMAIL_PASS` | no | Contraseña SMTP o app password |
| `DEFAULT_ADMIN_PASSWORD` | no | Contraseña inicial para el admin del seed |

Ver `backend/.env.example` para la lista completa.

---

## Seguridad

- Contraseñas cifradas con **bcrypt** (10 rounds)
- Tokens JWT en **cookies HttpOnly** — inaccesibles para JavaScript del cliente
- **Rate limiting**: 100 req/15 min global · 20 intentos de login/15 min · 5 solicitudes de recovery/15 min
- **SQL injection** prevenida con queries parametrizadas (`$1, $2…`) + whitelist explícita en ORDER BY
- CORS, **Helmet** y cabeceras de seguridad configuradas
- Escaneo de secretos en cada commit (**gitleaks** + hook pre-commit de Husky)
- Campos sensibles (contraseñas, tokens, códigos de recovery) automáticamente **redactados en logs**
- `X-Request-ID` único en cada petición para trazabilidad de auditoría

> Nunca subas tu archivo `.env`. Está excluido por `.gitignore`.

---

## Estructura del proyecto

```
EventRoll/
├── backend/                  # API REST (Node.js + Express)
│   ├── src/
│   │   ├── app.js            # Configuración Express (middleware, rutas)
│   │   ├── server.js         # Punto de entrada
│   │   ├── config/           # BD, migraciones, validación de env
│   │   ├── controllers/      # Lógica de peticiones HTTP
│   │   ├── services/         # Lógica de negocio
│   │   ├── repositories/     # Acceso a datos (SQL parametrizado)
│   │   ├── middleware/        # Auth JWT, validación, manejo de errores
│   │   ├── routes/           # Definición de rutas
│   │   └── utils/            # Logger (Winston), helpers
│   └── tests/
│       ├── unit/             # Tests unitarios (Vitest + mocks)
│       └── integration/      # Tests de integración (Supertest + Postgres)
├── src/                      # Frontend (Vue 3 + Vite)
│   ├── components/           # Componentes Vue
│   ├── services/             # Capa de API (Axios)
│   ├── stores/               # Estado global (Pinia)
│   └── composables/          # Composables reutilizables
├── .github/workflows/        # CI: tests unitarios, integración y seguridad
├── render.yaml               # Configuración de Render (infra como código)
├── docker-compose.yml        # Stack completo local
└── Dockerfile.frontend       # Imagen Docker del frontend
```

---

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para configuración de desarrollo, convenciones de código y cómo abrir un pull request.

## Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para el historial de versiones.

## Licencia

[MIT](LICENSE)
