# Plan de mejoras — EventRoll

Mejoras pendientes ordenadas por prioridad. Eliminar cada sección al completarla.

---

## Alta prioridad

### 1. Vue Router
Actualmente el routing es manual con `v-if` en `App.vue`. Sin Vue Router no hay:
- Soporte para back/forward del browser
- URLs navegables (ej. `/invitados`, `/usuarios`)
- Route guards por ruta
- Deep linking

**Tareas:**
- Instalar `vue-router@4`
- Crear `src/router/index.js` con las rutas definidas
- Extraer cada vista de `App.vue` a `src/views/` (InvitadosView, EstadisticasView, etc.)
- Agregar guard global que redirija a `/login` si no hay sesión
- Actualizar `App.vue` para usar `<RouterView>`

---

### 2. Tests de frontend
Cobertura actual: **0%**. Sin tests, cualquier refactor o feature puede romper la UI silenciosamente.

**Tareas:**
- Instalar `vitest`, `@vue/test-utils`, `@vitest/coverage-v8`, `jsdom`
- Agregar script `"test"` en `package.json`
- Tests unitarios para stores Pinia (`src/stores/auth.js`, `src/stores/evento.js`)
- Tests de componentes críticos:
  - `LoginPage` — renderiza formulario, maneja errores de login
  - `ListaInvitados` — renderiza lista, búsqueda, paginación
  - `HomePage` — renderiza sin usuario autenticado

---

### 3. Versionado de API (`/api/v1/`)
Todas las rutas actuales son `/api/...`. Sin versión no se pueden hacer cambios breaking sin romper clientes existentes.

**Tareas:**
- Cambiar prefijo en `app.js` de `/api/...` a `/api/v1/...`
- Actualizar `src/services/api.js` para usar `/api/v1`
- Actualizar Swagger spec (`backend/src/config/swagger.js`)
- Actualizar README y CHANGELOG

---

## Media prioridad

### 4. Accesibilidad (a11y)
Solo hay 1 `aria-live` en todo el frontend. La app no es usable con teclado ni lectores de pantalla.

**Tareas:**
- Agregar `role` y `aria-label` a botones de iconos sin texto
- Agregar `aria-live="polite"` en zonas que cambian dinámicamente (lista, notificaciones)
- Asegurar orden de foco lógico en formularios
- Verificar contraste de colores en variables CSS

---

### 5. Estados vacíos en componentes
Cuando no hay resultados la UI simplemente muestra nada. Mala UX.

**Tareas:**
- Componente `EmptyState.vue` reutilizable (icono + mensaje + acción opcional)
- Usarlo en `ListaInvitados` cuando no hay invitados o la búsqueda no devuelve resultados
- Usarlo en `Usuarios` si no hay usuarios
- Usarlo en `Actividad` si no hay actividad registrada

---

### 6. Tests de repositorios (backend)
Los unit tests solo cubren servicios. Los repositories (`invitadosRepository.js`, `usuariosRepository.js`, `authRepository.js`) no tienen tests.

**Tareas:**
- `backend/tests/unit/invitadosRepository.test.js`
- `backend/tests/unit/usuariosRepository.test.js`
- `backend/tests/unit/authRepository.test.js`
- Mockear `query` de `database.js` en cada test

---

## Baja prioridad

### 7. Store de UI (Pinia)
Los estados de modales y loading están en `ref` locales de cada componente. Si se agrega un toast global o modal compartido habrá que refactorizar.

**Tareas:**
- Crear `src/stores/ui.js` con estado de: `isLoading`, `notifications[]`, `activeModal`
- Implementar composable `useNotification()` que use el store
- Reemplazar los `alert()` / mensajes inline por notificaciones del store

---

### 8. HTTP cache headers
Las respuestas de la API no incluyen `Cache-Control`. El browser puede cachear respuestas incorrectamente o no cachear nada útil.

**Tareas:**
- Agregar `Cache-Control: no-store` en rutas privadas (invitados, usuarios)
- Agregar `Cache-Control: public, max-age=300` en `/health`
- Evaluar `ETag` para respuestas de listas grandes

---

### 9. Errores de validación por campo (frontend)
Los errores de formulario se muestran como mensaje genérico. Idealmente cada campo debería mostrar su error debajo.

**Tareas:**
- En `LoginPage` mostrar error bajo el campo email/password correspondiente
- En formularios de creación de invitado y usuario, mapear errores de la API a campos
- Componente reutilizable `FieldError.vue`
