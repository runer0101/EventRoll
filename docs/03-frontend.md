# Frontend — Vue 3 SPA

## Estructura de archivos

```
src/
├── main.js                    ← Punto de entrada: Vue, Pinia, Router
├── App.vue                    ← Punto de montaje (RouterView + ToastContainer)
├── router/
│   └── index.js               ← Hash-based routing con guard de autenticación
├── views/                     ← Páginas ruteadas
│   ├── HomeView.vue           ← Landing page pública
│   ├── LoginView.vue          ← Login + registro + código de acceso
│   ├── AppShell.vue           ← Layout autenticado (sidebar + header + RouterView)
│   ├── InvitadosView.vue      ← Gestión de invitados
│   ├── EstadisticasView.vue   ← Estadísticas del evento
│   ├── ConfiguracionView.vue  ← Configuración del evento activo
│   ├── ActividadView.vue      ← Actividad reciente
│   ├── UsuariosView.vue       ← Gestión de usuarios (admin)
│   └── PlanoView.vue          ← Plano visual de mesas
├── components/
│   ├── HomePage.vue           ← Landing page completa
│   ├── LoginPage.vue          ← Formularios de login/registro/código
│   ├── PasswordRecoveryModal.vue ← Wizard de recuperación de contraseña
│   ├── AppShell.vue           ← (en views/)
│   ├── Sidebar.vue            ← Navegación lateral responsive + perfil
│   ├── ListaInvitados.vue     ← CRUD de invitados (vista principal)
│   ├── GuestStats.vue         ← Tarjetas de estadísticas
│   ├── GuestRow.vue           ← Fila individual de invitado
│   ├── SearchBar.vue          ← Búsqueda + filtros + historial
│   ├── PaginationBar.vue      ← Controles de paginación
│   ├── GestionUsuarios.vue    ← Orquestador de gestión de usuarios
│   ├── UserForm.vue           ← Formulario crear/editar usuario
│   ├── UserTable.vue          ← Tabla de usuarios
│   ├── PanelUsuarios.vue      ← Perfil + actividad del usuario
│   ├── MesaCanvas.vue         ← Canvas SVG del plano de mesas
│   ├── MesaRedonda.vue        ← SVG de mesa redonda con sillas
│   ├── SidebarInvitados.vue   ← Panel de invitados sin asignar
│   ├── EmptyState.vue         ← Estado vacío reutilizable
│   ├── FieldError.vue         ← Error por campo de formulario
│   ├── ShortcutsHelp.vue      ← Modal de atajos de teclado
│   ├── ToastNotification.vue  ← Notificación individual
│   ├── ToastContainer.vue     ← Contenedor de notificaciones
│   └── LoadingSpinner.vue     ← Overlay de carga
├── composables/
│   ├── useInvitados.js        ← Lógica de datos y CRUD de invitados
│   ├── useExcelOperations.js  ← Export/import Excel y CSV
│   ├── useToast.js            ← Notificaciones toast
│   ├── useLoading.js          ← Estado de carga global
│   ├── useSearchHistory.js    ← Historial de búsquedas
│   ├── useSavedFilters.js     ← Filtros persistentes
│   └── useKeyboardShortcuts.js ← Atajos de teclado
├── stores/
│   ├── auth.js                ← Sesión, usuario y permisos (Pinia)
│   ├── evento.js              ← Evento activo (Pinia)
│   ├── ui.js                  ← UI state (Pinia)
│   └── plano.js               ← Estado de mesas y asignaciones (Pinia)
├── services/
│   └── api.js                 ← Axios config + métodos API (auth, invitados, usuarios, mesas, eventos)
├── utils/
│   ├── apiUrl.js              ← Resolución de VITE_API_URL
│   └── excelImporter.js       ← Parsing de Excel + plantilla
└── __tests__/
    ├── components/            ← Tests de GuestStats, PaginationBar, PasswordRecoveryModal
    ├── stores/                ← Tests de auth y evento
    └── utils/                 ← Tests de apiUrl
```

## Rutas

| Path | Vista | Auth | Descripción |
|------|-------|------|-------------|
| `/` | HomeView | No | Landing page pública |
| `/login` | LoginView | No | Login + registro |
| `/app/invitados` | InvitadosView | Sí | Gestión de invitados |
| `/app/estadisticas` | EstadisticasView | Sí | Estadísticas del evento |
| `/app/plano` | PlanoView | Sí | Plano visual de mesas |
| `/app/configuracion` | ConfiguracionView | Sí | Configuración de evento |
| `/app/usuarios` | UsuariosView | Sí (admin) | Gestión de usuarios |
| `/app/actividad` | ActividadView | Sí (admin) | Actividad reciente |

## Stores (Pinia)

### auth
- `usuario` — Datos del usuario autenticado
- `isAuthenticated` — Computed
- `permisos` — Objeto de permisos según rol + overrides
- `initSession()` — Restaura sesión desde cookie HttpOnly
- `login()`, `loginConCodigo()`, `logout()`

### evento
- `eventoId` — ID del evento activo
- `setEventoId()` — Cambiar evento activo

### plano
- `mesas` — Array de mesas con asignaciones
- `invitadosSinMesa` — Invitados no asignados
- `crearMesa()`, `eliminarMesa()`, `actualizarPosicion()`
- `asignarInvitado()`, `desasignarInvitado()`

### ui
- `loading` — Estado de carga
- `toasts` — Cola de notificaciones
- `modalOpen` — Modal activo

## Sistema de inyección (provide/inject)

El `AppShell` provee a todos los componentes hijos:
- `PermisosKey` → `authStore.permisos`
- `RegistrarActividadKey` → función de audit log
- `EventoIdActualKey` → ID del evento activo
- `SetEventoIdActualKey` → setter del evento
- `StatsKey` → datos de estadísticas
- `ActividadRecienteKey` → log de actividad
- `ManejarLogoutKey` → función de cierre de sesión

## Diseño visual

- Tema oscuro con acentos dorados (#FFD700)
- Tipografía: Sora (display), Manrope (body)
- Glassmorphism: `backdrop-filter: blur()` en sidebar y header
- CSS custom properties para colores, sombras, transiciones
- Responsive: mobile-first con breakpoints en 480px, 640px, 768px, 1024px
- Transiciones Vue para animaciones de lista
