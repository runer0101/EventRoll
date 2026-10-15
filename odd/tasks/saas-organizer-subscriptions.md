# Feature: SaaS para organizadores con suscripción mensual (Next.js)

Stack: monolito modular Next.js 16 (App Router, Server Actions, Route Handlers) + TypeScript + PostgreSQL/Prisma + Stripe Billing. Sin backend separado.

Estado: F0–F3 completadas y verificadas (ver Log). Siguiente: F4 (Stripe).
Regla: commits por unidad de trabajo, sin co-autor y sin push (autorizado 2026-10-15).

## Decisiones (2026-10-15)

D1. Stripe real en modo test (Checkout + webhook) para la mensualidad de organizadores.
D2. Demo pública en Vercel + Neon; link y credenciales demo en el README.
D3. Alcance final: CRUD completo del organizador + check-in real (sin cámara en v1).
D4. Tailwind v4 (`@tailwindcss/postcss` + `@import 'tailwindcss'`), licencia MIT.
D5. Plan FREE = 1 evento activo; PRO = ilimitado (gate por suscripción).

## Specs

S1. `pnpm build` y `tsc --noEmit` pasan sin `ignoreBuildErrors`; no quedan errores de tipos ocultos.
S2. Cada organización gestiona sus eventos y tipos de entrada desde su dashboard (crear, listar, editar, eliminar).
S3. Cada organización tiene una suscripción mensual (Stripe Checkout + webhook). Sin suscripción activa no se pueden crear eventos nuevos.
S4. Decisión de arquitectura: monolito Next.js/TypeScript; no se añade backend separado.
S5. El stock de un tipo de entrada nunca baja de 0 bajo registros concurrentes (decremento condicional) y no se supera `Event.capacity`.
S6. Un precio de entrada (Decimal de Prisma) nunca se pasa como objeto a componentes cliente; se serializa a string.
S7. Toda ruta de gestión (dashboard, check-in) exige sesión autenticada; ninguna página pública expone datos de otra organización.
S8. El README describe el problema, las features, el setup (seed incluido) y la demo; no referencia archivos inexistentes.
S9. `pnpm db:seed` deja una organización demo utilizable (credenciales documentadas) en cualquier entorno.
S10. CI en GitHub Actions: install → typecheck → tests → build, en cada push/PR.

## Plan aprobado

### F0 · Higiene del repo (S8)
- `.gitignore` (+`*.tsbuildinfo`, coverage, playwright-report), `.env.example`, `LICENSE` (MIT).
- Commit del trabajo T1 pendiente (type-check estricto, 6 archivos).
- Este archivo como tracking visible del proceso.

### F1 · Flujo crítico funcionando
- WU1 (S6): DTO server-side con `price` serializado a string antes de pasar a `AttendeeForm`; fix del 500 en la página de evento. Tests + smoke runtime.
- WU2 (S5): decremento condicional de stock (`updateMany` + `count`) y chequeo de `Event.capacity` dentro de la transacción. Tests.
- WU3 (D4): cablear Tailwind v4 (globals.css + postcss + import en layout); retirar deps legacy. Verificación visual.

### F2 · Alineación Next 16 (S1, S7)
- Codemod `middleware-to-proxy` → `src/proxy.ts`.
- `authorized` protege `/dashboard` y `/checkin`.
- React 19 + `@types/react` 19; next-auth `5.0.0-beta.32`.
- Criterio: build sin warnings de deprecación; login/logout/sesión re-verificados.

### F3 · Producto completo (S2, S7, S9)
- CRUD de eventos (server actions + formularios, org-scoped, Zod).
- CRUD de tipos de entrada por evento.
- Check-in real: QR manual → valida org+evento → `PAID→USED` + `checkedInAt`, idempotente.
- `prisma/seed.ts` + `docker-compose.yml` (Postgres local) + scripts.

### F4 · Suscripción mensual Stripe test-mode (S3)
- Modelo `Subscription`; Checkout desde dashboard; webhook `/api/stripe/webhook` con verificación de firma.
- Guard de entitlements (FREE = 1 evento activo). Tests de guard y webhook.

### F5 · Tests + CI (S10)
- Vitest + scripts (`test`, `typecheck`, `lint`), ESLint (`eslint-config-next`).
- Workflow `ci.yml` (pnpm, Node 22, prisma generate, typecheck, test, build).

### F6 · Presentación GitHub + demo
- README nivel CV (problema, features, stack, arquitectura, screenshots, demo, setup, roadmap).
- Deploy Vercel + Neon con migrate + seed; smoke test en producción.
- Description, topics, social preview, release `v1.0.0`.

## Verificación por fase

- F0: `git status` limpio tras commits; build verde.
- F1: suite Vitest verde; página de evento responde 200; registro completo asistente→ticket probado en runtime.
- F2: build sin warnings; `/dashboard` y `/checkin` → 307 sin sesión.
- F3: e2e manual registro → login → CRUD → check-in; seed reproducible desde cero.
- F4: compra de prueba `4242…` en local (Stripe CLI) y en demo; webhook con firma inválida → 400.
- F5: CI verde en GitHub (tras push, a cargo del usuario).
- F6: clon limpio → docker + install + migrate + seed + dev funciona; demo pública operativa.

## Log

L1 (original, verbatim) [2026-10-13]: "revisa este proyecto los commit y todo y mejoralo encuentra los errores y arreglalo el problema a resolver es hacer tipo saas para organizadores de evente con mensualidad con netx.js como vase si es mejor solo en ese lenguaje pero toma las decesiones como un profecional de ingieneria".
L2 Evidencia baseline [2026-10-13]: `tsc` falla con 5 errores (Decimal como ReactNode x2, `getOrganizationById` sin importar, `credentials.email` tipado `{}` x2) ocultos por `ignoreBuildErrors: true`. `next build` falla en TypeScript. `next-auth@5.0.0-beta.1` declara peer `next ^13`.
L3 Decisión de no commitear [2026-10-13]: la regla de seguridad exige petición explícita; los cambios quedaron sin commitear listos para revisión por unidad de trabajo (T1..T6).
L4 Limitación [2026-10-13]: Engram/memoria no disponible en esa sesión; seguimiento en este archivo y en `todo`.
L5 Auditoría runtime [2026-10-15]: la página de registro de asistentes devuelve 500 (`tt.price.toFixed is not a function`): el fix de tipos vía `toFixed` en el cliente no resuelve la serialización del Decimal (S6). BD local vacía (sin seed). Tailwind sin cablear (sin config, sin globals.css, sin import). `/checkin` responde 200 sin sesión (S7). `pnpm build` y `tsc --noEmit` pasan solo con los cambios sin commitear.
L6 Plan aprobado [2026-10-15]: decisiones D1..D5 y fases F0..F6; autorización de commits sin co-autor y sin push.
L7 F0–F1 [2026-10-15]: higiene del repo (7ff02d2, 4bb1a2a) y type-check estricto (e2b6299). WU1: DTO con precio serializado + Vitest (ecd9e00, 2ec9c90); la página de registro responde 200 (antes 500). WU2: stock atómico + capacidad (6c75e98); prueba real de concurrencia contra Postgres: 5 registros sobre stock 1 → 1 ticket, stock final 0. WU3: Tailwind v4 cableado (7c047aa).
L8 F2 [2026-10-15]: migración a `proxy.ts` + guard de `/checkin` (901859e); React 19 + next-auth 5.0.0-beta.32 (b3d0e27); build sin warnings de deprecación; e2e de login por curl (login 302, dashboard 200, checkin 307 sin sesión).
L9 F3 [2026-10-15]: CRUD del organizador (3b616aa), check-in atómico PAID→USED (74b4284), docker compose para Postgres local (b9c3517); suite de 35 tests verde; smoke autenticado de dashboard, formularios y check-in OK. Seed con credenciales demo y códigos de check-in reproducibles.
