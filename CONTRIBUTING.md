# Contributing to EventRoll

Thanks for your interest in contributing! Here's everything you need to get started.

## Table of contents

- [Development setup](#development-setup)
- [Project structure](#project-structure)
- [Running tests](#running-tests)
- [Submitting changes](#submitting-changes)
- [Code style](#code-style)
- [Reporting bugs](#reporting-bugs)

---

## Development setup

**Requirements:** Node.js 20+, npm 9+, PostgreSQL 14+

```bash
# 1. Fork and clone
git clone https://github.com/<your-user>/eventroll.git
cd eventroll

# 2. Install all dependencies
npm install
cd backend && npm install && cd ..

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env — set DATABASE_URL, JWT_SECRET, and email settings

# 4. Create the database schema
cd backend
npm run migrate
npm run migrate:v1.4
npm run migrate:v1.5
npm run migrate:v1.6
npm run seed   # optional: loads sample data
cd ..

# 5. Start dev servers (two terminals)
cd backend && npm run dev   # Terminal 1: API on http://localhost:3000
npm run dev                 # Terminal 2: Frontend on http://localhost:5173
```

---

## Project structure

```
eventroll/
├── src/                    # Vue 3 frontend
│   ├── components/         # Vue components
│   ├── stores/             # Pinia state stores (auth, evento)
│   ├── services/           # Axios API clients
│   └── main.js
├── backend/
│   ├── src/
│   │   ├── config/         # DB, Swagger, env validation
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validators, error handler, requestId
│   │   ├── repositories/   # DB queries
│   │   ├── routes/         # Express route definitions
│   │   ├── services/       # Business logic
│   │   └── utils/          # Logger, asyncHandler
│   └── tests/
│       ├── unit/           # Service unit tests (vitest + mocks)
│       └── integration/    # Endpoint tests (vitest + supertest + real DB)
├── .github/
│   ├── workflows/          # CI: security, tests, lint
│   └── ISSUE_TEMPLATE/
└── docker-compose.yml
```

---

## Running tests

```bash
# Unit tests
cd backend && npm test

# Unit tests with coverage
cd backend && npm run test:coverage

# Integration tests (requires PostgreSQL running and DATABASE_URL set)
cd backend && npm run test:integration

# Frontend lint
npm run lint
```

For integration tests, the database must have the schema applied (`npm run migrate` and all `migrate:v*` scripts).

---

## Submitting changes

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes.** Follow the conventions below.

3. **Run the tests** and make sure everything passes:
   ```bash
   cd backend && npm test
   npm run lint
   ```

4. **Commit** with a clear message:
   ```
   feat: add guest export to CSV
   fix: correct pagination offset on search
   docs: update environment variables table
   ```

5. **Open a Pull Request** against `main` and fill in the PR template.

---

## Code style

- **Backend:** Standard JavaScript (ESM). No type annotations required. Keep functions small.
- **Frontend:** Vue 3 Composition API with `<script setup>`. Use Pinia for any state shared across components.
- **Formatting:** Run `npm run format` (Prettier) before committing.
- **Linting:** Run `npm run lint` and fix all errors before opening a PR.
- **Tests:** New backend services should have unit tests in `backend/tests/unit/`. New endpoints should have integration tests in `backend/tests/integration/`.
- **No secrets:** Never commit `.env` files or hardcoded credentials. The pre-commit hook will catch most cases.

---

## Reporting bugs

Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template. Include:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Environment (OS, Node version, browser)
