# Desarrollo

## Configuración del entorno

### Requisitos
- Node.js ≥ 20
- npm ≥ 9
- PostgreSQL ≥ 14

### Instalación

```bash
git clone <repo-url>
cd EventRoll
npm install
cd backend && npm install && cd ..

# Configurar backend
cp backend/.env.example backend/.env
# Editar backend/.env con DATABASE_URL y JWT_SECRET

# Crear BD
cd backend
npm run migrate    # Schema base
npm run seed       # Datos de ejemplo (opcional)
cd ..
```

## Scripts

### Frontend (raíz)
```bash
npm run dev              # Dev server (Vite, :5173)
npm run build            # Build producción
npm run preview          # Preview del build
npm run lint             # ESLint
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier
npm test                 # Tests unitarios (Vitest)
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Tests con cobertura
```

### Backend
```bash
npm run dev              # Dev server con nodemon (:3000)
npm start                # Producción (sin nodemon)
npm run migrate          # Migración base
npm run migrate:all      # Todas las migraciones
npm run seed             # Datos de ejemplo
npm test                 # Tests unitarios (Vitest)
npm run test:coverage    # Tests con cobertura
npm run test:integration # Tests de integración (requiere BD)
```

## Testing

### Frontend
- **Framework**: Vitest + @vue/test-utils
- **Entorno**: jsdom
- **Ubicación**: `src/__tests__/`
- **Cobertura**: stores y componentes

Tests actuales:
- `stores/auth.test.js` — Autenticación
- `stores/evento.test.js` — Evento activo
- `utils/apiUrl.test.js` — Resolución de API URL
- `components/GuestStats.test.js` — Stats de invitados
- `components/PaginationBar.test.js` — Paginación
- `components/PasswordRecoveryModal.test.js` — Recuperación

### Backend
- **Framework**: Vitest
- **Unitarios**: `tests/unit/` — servicios y repositorios con mocks
- **Integración**: `tests/integration/` — endpoints con Supertest + BD real

Tests actuales:
- Unitarios: authService, invitadosService, usuariosService, activityService, authRepository, invitadosRepository, usuariosRepository, originUtils
- Integración: auth, invitados

## Convenciones de código

### Backend
- JavaScript ESM (`"type": "module"`)
- Arquitectura en capas: Routes → Middleware → Controllers → Services → Repositories
- Queries SQL parametrizadas (`$1, $2`), nunca interpolación
- Expresiones regulares con `test()` no `match()` para booleanos
- `const` y `let`, nunca `var`

### Frontend
- Vue 3 Composition API con `<script setup>`
- Pinia stores con sintaxis `setup` (composable-style)
- Composables para lógica reutilizable
- `const` y `let`, nunca `var`
- Axios con interceptores configurados en `services/api.js`

### General
- Sin comentarios innecesarios — el código debe ser auto-documentado
- Sin `console.log` en producción — usar el logger de Winston
- Tests para nueva funcionalidad
- Lint limpio antes de commit

## Flujo de trabajo Git

```bash
# Crear rama
git checkout -b feat/nombre-feature
# o
git checkout -b fix/descripcion-bug

# Hacer cambios + tests
npm test
npm run lint

# Commit (conventional commits)
git commit -m "feat: descripcion del cambio"
git commit -m "fix: descripcion de la correccion"

# Push y PR
git push origin feat/nombre-feature
```

## Estructura de archivos nueva

Al agregar un nuevo endpoint:
```
backend/src/
├── controllers/nuevoController.js
├── services/nuevoService.js
├── repositories/nuevoRepository.js
├── routes/nuevoRoutes.js
└── config/migrate-vX.X.js   (si necesita tablas nuevas)
```

Al agregar un nuevo componente Vue:
```
src/
├── components/NuevoComponente.vue
├── composables/useNuevo.js   (si tiene lógica extraíble)
├── stores/nuevo.js           (si necesita estado global)
└── __tests__/components/NuevoComponente.test.js
```

## Variables de entorno en desarrollo

El backend requiere `backend/.env` con al menos:
- `DATABASE_URL` — conexión a PostgreSQL
- `JWT_SECRET` — clave de 64+ caracteres

Para BD vacía (sin seed automático):
- `SKIP_SEED=true`

El frontend usa `VITE_API_URL` para apuntar al backend:
- Desarrollo local: no necesita configurarse (default: `http://localhost:3000/api`)
- VPS: `https://eventroll.zentramid.eu.cc/api`
- GitHub Pages: `https://eventroll.onrender.com/api`
