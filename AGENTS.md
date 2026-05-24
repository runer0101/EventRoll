# Code Review Rules

## JavaScript / Vue 3
- Composition API with `<script setup>` syntax
- Use `const`/`let`, never `var`
- Axios with interceptors configured in `src/services/api.js`

## Backend (Express / Node.js)
- Layered architecture: Routes -> Middleware -> Controllers -> Services -> Repositories
- SQL queries use parametrized statements (`$1`, `$2`), never string interpolation
- All secrets in env vars, never committed

## Security
- No secrets, tokens, or passwords in code
- JWT stored in HttpOnly cookies, never localStorage
- CSRF protection via Origin header validation

## Testing
- Vitest for both frontend and backend
- Unit tests in `__tests__/` for frontend, `tests/unit/` for backend
- Integration tests with Supertest in `tests/integration/`
