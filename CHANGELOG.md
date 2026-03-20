# Changelog

All notable changes to EventRoll are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.3.0] — 2026-03-19

### Added
- Winston structured logger — replaces `console.log` with leveled logging and log rotation
- HttpOnly cookies for JWT — tokens are no longer stored in `localStorage`
- Swagger/OpenAPI docs — full spec for all 11 routes, available at `/api/docs`
- Pinia stores — centralized auth and active-event state (`src/stores/`)
- Unit tests — 34 passing tests across `authService`, `invitadosService`, `usuariosService`
- Integration tests — 15 tests covering auth and invitados endpoints with real DB
- Docker setup — `docker-compose.yml`, Nginx config, Dockerfiles, health checks
- ESLint + Prettier — code quality enforcement with `npm run lint` and `npm run format`
- CI/CD — GitHub Actions workflows for security checks, unit tests, integration tests, and lint
- `validateEnv` — validates required environment variables at server startup
- Request ID middleware — every HTTP request gets a unique `X-Request-ID` header for log correlation
- Sensitive data filter in logger — passwords and tokens are automatically redacted from logs

### Changed
- `server.js` split into `app.js` (Express config) + `server.js` (startup) for testability
- Health check endpoint now includes database status and responds `503` when DB is unreachable
- `cookie-parser` added to Express middleware stack

### Security
- Rate limiting on login (20/15 min), password recovery (5/15 min), and all API routes (100/15 min)
- Pre-commit hook scans for secrets with `gitleaks`

---

## [1.2.0] — 2026-02

### Added
- Password recovery flow — 6-digit code sent via email with 15-minute expiration
- Email service with nodemailer — supports Gmail SMTP and custom providers
- Migration v1.5 — `password_recovery_codes` table

### Changed
- Auth middleware accepts token from HttpOnly cookie OR `Authorization` header

---

## [1.1.0] — 2026-01

### Added
- Activity audit log — every create, update, delete, login, logout recorded to `actividad` table
- Migration v1.4 — `actividad` table with `usuario_id`, `accion`, `detalles` (JSONB)
- User cache in auth middleware — 5-minute in-memory cache to reduce DB queries per request

### Changed
- `invitados` category field expanded to include Familia, Amigos, Trabajo

---

## [1.0.0] — 2025-12

### Added
- Initial release
- Guest management — create, edit, delete, filter, search, confirm guests
- Role-based access control — admin, organizador, asistente, guardia
- Bulk Excel import/export via ExcelJS
- Multi-event support
- JWT authentication
- PostgreSQL schema — `usuarios`, `eventos`, `invitados` tables
- Pagination on guest list
- Helmet, CORS, express-rate-limit security baseline
