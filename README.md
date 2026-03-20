# EventRoll

> Web platform for event guest management — manage lists, track attendance, assign team roles, and bulk import guests from Excel.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)
![CI](https://github.com/<your-user>/eventroll/actions/workflows/test.yml/badge.svg)

---

## Features

- **Role-based access control** — admin, organizer, assistant, guard
- **Guest management** — create, edit, delete, filter, search, and confirm guests
- **Real-time attendance tracking** — confirm arrivals as they happen
- **Bulk Excel import/export** — import hundreds of guests in one click
- **Password recovery** — secure 6-digit code delivered via email
- **Multi-event support** — independent guest lists per event
- **JWT auth with HttpOnly cookies** — tokens never touch `localStorage`
- **Request ID tracing** — every request gets a unique ID for log correlation
- **Swagger API docs** — available at `/api/docs`
- **Docker ready** — full stack (API + DB + Nginx) with one command

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3, Vite, Pinia, Axios, ExcelJS |
| Backend | Node.js, Express, PostgreSQL, bcrypt, JWT |
| Infrastructure | Docker, Nginx, Winston |
| Testing | Vitest, Supertest |
| CI/CD | GitHub Actions |

---

## Requirements

- Node.js 20.19 or later
- npm 9 or later
- PostgreSQL 14 or later

---

## Getting started

### 1. Clone

```bash
git clone https://github.com/<your-user>/eventroll.git
cd eventroll
```

### 2. Install dependencies

```bash
npm install              # frontend
cd backend && npm install
```

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set DATABASE_URL, JWT_SECRET, and email settings

# Frontend (optional for local dev if you use the default port)
cp .env.example .env
```

> Generate a secure JWT secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 4. Run database migrations

```bash
cd backend
npm run migrate
npm run migrate:v1.4
npm run migrate:v1.5
npm run migrate:v1.6
npm run seed          # optional: loads sample data
```

### 5. Start development servers

```bash
# Terminal 1 — API
cd backend && npm run dev

# Terminal 2 — Frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Default dev credentials** (change after first login):

| Field | Value |
|-------|-------|
| Email | `admin@prueba` |
| Password | value of `DEFAULT_ADMIN_PASSWORD` in `backend/.env` |

---

## Docker (production)

```bash
cp .env.example .env
# Set DB_PASSWORD, JWT_SECRET, CORS_ORIGIN in .env

docker compose up -d
```

The app will be available at `http://localhost`.

---

## Available scripts

### Frontend (`/`)

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build locally
npm run lint         # Lint src/ with ESLint
npm run lint:fix     # Auto-fix lint errors
npm run format       # Format src/ with Prettier
```

### Backend (`/backend`)

```bash
npm run dev                # Start with nodemon (auto-reload)
npm run start              # Start production server
npm run migrate            # Run base schema migration
npm run migrate:v1.4       # Audit log table
npm run migrate:v1.5       # Password recovery table
npm run migrate:v1.6       # Indexes + unique constraints
npm run seed               # Seed sample data
npm run cambiar-password   # Interactive password reset script
npm run test               # Run unit tests
npm run test:watch         # Run unit tests in watch mode
npm run test:coverage      # Unit tests with coverage report
npm run test:integration   # Integration tests (requires DB)
```

---

## API reference

Full interactive documentation at `http://localhost:3000/api/docs`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | required | Get current user |
| POST | `/api/auth/logout` | required | Logout and clear cookie |
| GET | `/api/invitados` | required | List guests (paginated + filters) |
| POST | `/api/invitados` | required | Create guest |
| POST | `/api/invitados/import` | organizer+ | Bulk import guests |
| PUT | `/api/invitados/:id` | required | Update guest |
| DELETE | `/api/invitados/:id` | required | Delete guest |
| GET | `/api/usuarios` | admin | List users |
| POST | `/api/usuarios` | admin | Create user |
| GET | `/health` | — | Health check (includes DB status) |

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `JWT_SECRET` | yes | Random secret, min 32 chars (64+ recommended) |
| `JWT_EXPIRES_IN` | no | Token expiration, default `24h` |
| `CORS_ORIGIN` | yes (prod) | Frontend URL |
| `EMAIL_HOST` | no | SMTP server (for password recovery) |
| `EMAIL_PORT` | no | SMTP port, default `587` |
| `EMAIL_USER` | no | SMTP email address |
| `EMAIL_PASS` | no | SMTP password or app password |
| `DEFAULT_ADMIN_PASSWORD` | no | Initial password for seeded admin user |

See `backend/.env.example` for the full list.

---

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens stored in HttpOnly cookies — not accessible to JavaScript
- Rate limiting: 100 req/15 min globally, 20 login attempts/15 min
- SQL injection prevention via parameterized queries
- CORS, Helmet, and CSP headers configured
- Secrets scanning on every commit (gitleaks + husky pre-commit hook)
- Sensitive fields (passwords, tokens) automatically redacted from logs
- Unique `X-Request-ID` on every request for audit tracing

Never commit your `.env` file. It is excluded by `.gitignore`.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding conventions, and how to open a pull request.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the version history.

## License

[MIT](LICENSE)
