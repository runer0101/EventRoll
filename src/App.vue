<script setup>
import { ref, provide, computed, onMounted, watch } from 'vue'
import HomePage from './components/HomePage.vue'
import LoginPage from './components/LoginPage.vue'
import ListaInvitados from './components/ListaInvitados.vue'
import PanelUsuarios from './components/PanelUsuarios.vue'
import Sidebar from './components/Sidebar.vue'
import GestionUsuarios from './components/GestionUsuarios.vue'
import ToastContainer from './components/ToastContainer.vue'
import { useAuthStore } from './stores/auth'
import { useEventoStore } from './stores/evento'
import { invitadosAPI } from './services/api'
import { Users, UserCheck, Clock } from 'lucide-vue-next'

// ─── Stores ───────────────────────────────────────────────────────
const authStore = useAuthStore()
const eventoStore = useEventoStore()

// Alias reactivos para el template (mantiene compatibilidad con el HTML existente)
const usuarioActual = computed(() => authStore.usuario)
const eventoIdActual = computed(() => eventoStore.eventoId)

// ─── Navegación de páginas públicas ──────────────────────────────
// 'home' | 'login'  (cuando no hay sesión)
const paginaPublica = ref('home')

// ─── Estado local ────────────────────────────────────────────────
const actividadReciente = ref([])
const eventoIdInput = ref(eventoStore.eventoId)
const eventoConfigError = ref('')
const eventoConfigSuccess = ref('')
const vistaActiva = ref('invitados')
const sidebarCollapsed = ref(false)

const MAX_ACTIVIDADES = 10

const puedeEditarEvento = computed(() => {
  const rol = authStore.usuario?.rol
  return rol === 'admin' || rol === 'organizador'
})

// Sincronizar input con store cuando cambia desde otro lado
watch(() => eventoStore.eventoId, (v) => { eventoIdInput.value = v })

function aplicarEventoActivo() {
  eventoConfigError.value = ''
  eventoConfigSuccess.value = ''

  if (!puedeEditarEvento.value) {
    eventoConfigError.value = 'No tienes permisos para cambiar el evento activo.'
    return
  }

  const str = String(eventoIdInput.value ?? '').trim()
  if (!/^\d+$/.test(str) || Number(str) < 1) {
    eventoConfigError.value = 'Ingresa un ID de evento válido (entero positivo).'
    return
  }

  if (str === eventoStore.eventoId) {
    eventoConfigSuccess.value = 'Ese evento ya está activo.'
    return
  }

  eventoStore.setEventoId(str)
  registrarActividad(`Cambió el evento activo a ID ${str}`)
  eventoConfigSuccess.value = `Evento activo actualizado a ID ${str}.`
  cargarStats()
}

// ─── Actividad reciente ──────────────────────────────────────────
function registrarActividad(accion) {
  if (!authStore.usuario) return
  actividadReciente.value.unshift({
    tiempo: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    accion,
    usuario: authStore.usuario.nombre,
  })
  if (actividadReciente.value.length > MAX_ACTIVIDADES) {
    actividadReciente.value = actividadReciente.value.slice(0, MAX_ACTIVIDADES)
  }
}

// ─── Provide para hijos ───────────────────────────────────────────
provide('permisos', () => authStore.permisos)
provide('registrarActividad', registrarActividad)
provide('eventoIdActual', () => eventoStore.eventoId)
provide('setEventoIdActual', (v) => eventoStore.setEventoId(v))

// ─── Ciclo de vida ────────────────────────────────────────────────
onMounted(async () => {
  eventoIdInput.value = eventoStore.eventoId
  // La cookie HttpOnly se envía automáticamente; initSession llama a /api/auth/me
  await authStore.initSession()
  await cargarStats()
})

// ─── Handlers de Login / Logout ───────────────────────────────────
function manejarLogin() {
  registrarActividad('Inició sesión')
  cargarStats()
}

async function manejarLogout() {
  registrarActividad('Cerró sesión')
  actividadReciente.value = []
  await authStore.logout()
  paginaPublica.value = 'home'
}

function seleccionarMenu(itemId) {
  vistaActiva.value = itemId
  registrarActividad(`Navegó a ${itemId}`)
  if (itemId === 'estadisticas') cargarStats()
}

function handleSidebarToggle(collapsed) {
  sidebarCollapsed.value = collapsed
}

// ─── Estadísticas reales del evento ───────────────────────────────
const statsData = ref({ totalInvitados: 0, confirmados: 0, pendientes: 0 })

const stats = computed(() => statsData.value)

async function cargarStats() {
  if (!authStore.usuario || !eventoStore.eventoId) return
  try {
    const res = await invitadosAPI.getAll({ evento_id: eventoStore.eventoId, limit: 1 })
    const p = res.pagination || {}
    statsData.value = {
      totalInvitados: p.total || 0,
      confirmados: p.confirmados || 0,
      pendientes: p.pendientes || 0
    }
  } catch {
    // Si falla, mantiene los ceros — no bloquea la app
  }
}

// Recargar stats cuando cambia el evento activo
watch(() => eventoStore.eventoId, cargarStats)
</script>

<template>
  <!-- Contenedor de notificaciones toast (siempre visible) -->
  <ToastContainer />

  <!-- Página pública: Home o Login -->
  <template v-if="!usuarioActual">
    <HomePage
      v-if="paginaPublica === 'home'"
      @go-login="paginaPublica = 'login'"
    />
    <LoginPage
      v-else
      @login="manejarLogin"
      @go-home="paginaPublica = 'home'"
    />
  </template>

  <!-- Mostrar aplicación si hay usuario autenticado -->
  <div v-else class="app-container">
    <!-- Sidebar lateral izquierdo -->
    <Sidebar
      :usuario="usuarioActual"
      :active-item="vistaActiva"
      :stats="stats"
      @logout="manejarLogout"
      @select-menu="seleccionarMenu"
      @toggle="handleSidebarToggle"
    />

    <!-- Contenido principal con margen para el sidebar -->
    <div class="main-wrapper" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <header class="main-header">
        <div class="header-content">
          <h1>Organización de Eventos</h1>
          <span class="header-subtitle">Panel de gestión</span>
          <span class="header-evento">Evento activo: ID {{ eventoIdActual }}</span>
        </div>
        <div class="header-user">
          <span class="user-name">{{ usuarioActual.nombre }}</span>
          <div class="user-avatar-header">{{ usuarioActual.nombre.charAt(0).toUpperCase() }}</div>
        </div>
      </header>

      <main>
        <!-- Vista de Invitados -->
        <div v-if="vistaActiva === 'invitados'">
          <ListaInvitados />
        </div>

        <!-- Vista de Estadísticas -->
        <div v-else-if="vistaActiva === 'estadisticas'" class="vista-estadisticas">
          <div class="section-header">
            <h2>Estadísticas del Evento</h2>
            <span class="section-tag">Evento ID {{ eventoIdActual }}</span>
          </div>
          <div class="stats-grid">
            <div class="stat-card stat-total">
              <div class="stat-icon"><Users :size="36" /></div>
              <div class="stat-body">
                <div class="stat-value">{{ stats.totalInvitados }}</div>
                <div class="stat-label">Total Invitados</div>
              </div>
            </div>
            <div class="stat-card stat-confirmados">
              <div class="stat-icon"><UserCheck :size="36" /></div>
              <div class="stat-body">
                <div class="stat-value">{{ stats.confirmados }}</div>
                <div class="stat-label">Confirmados</div>
                <div v-if="stats.totalInvitados > 0" class="stat-pct">
                  {{ Math.round((stats.confirmados / stats.totalInvitados) * 100) }}% del total
                </div>
              </div>
            </div>
            <div class="stat-card stat-pendientes">
              <div class="stat-icon"><Clock :size="36" /></div>
              <div class="stat-body">
                <div class="stat-value">{{ stats.pendientes }}</div>
                <div class="stat-label">Pendientes</div>
                <div v-if="stats.totalInvitados > 0" class="stat-pct">
                  {{ Math.round((stats.pendientes / stats.totalInvitados) * 100) }}% del total
                </div>
              </div>
            </div>
          </div>
          <div v-if="stats.totalInvitados > 0" class="progress-card">
            <div class="progress-header">
              <span>Progreso de confirmación</span>
              <span class="progress-pct">{{ Math.round((stats.confirmados / stats.totalInvitados) * 100) }}%</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: Math.round((stats.confirmados / stats.totalInvitados) * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Vista de Configuración -->
        <div v-else-if="vistaActiva === 'configuracion'" class="vista-configuracion">
          <div class="section-header">
            <h2>Configuración</h2>
          </div>

          <div class="config-card">
            <h3>Evento Activo</h3>
            <p class="config-description">
              Este ID se usa para cargar, crear e importar invitados en el contexto actual.
            </p>

            <div class="evento-actual">
              <span class="evento-label">ID actual:</span>
              <span class="evento-badge">{{ eventoIdActual }}</span>
            </div>

            <form class="evento-form" @submit.prevent="aplicarEventoActivo">
              <label for="evento-id-input">Cambiar ID de evento</label>
              <div class="evento-form-row">
                <input
                  id="evento-id-input"
                  v-model="eventoIdInput"
                  type="number"
                  min="1"
                  step="1"
                  :disabled="!puedeEditarEvento"
                  placeholder="Ej. 1"
                />
                <button type="submit" :disabled="!puedeEditarEvento">
                  Aplicar
                </button>
              </div>
            </form>

            <p v-if="eventoConfigError" class="config-msg error">{{ eventoConfigError }}</p>
            <p v-if="eventoConfigSuccess" class="config-msg success">{{ eventoConfigSuccess }}</p>

            <p v-if="!puedeEditarEvento" class="config-help">
              Solo roles "admin" y "organizador" pueden cambiar el evento activo.
            </p>
          </div>
        </div>

        <!-- Vista de Actividad -->
        <div v-else-if="vistaActiva === 'actividad'" class="vista-actividad">
          <PanelUsuarios
            :usuario="usuarioActual"
            :actividad-reciente="actividadReciente"
            @logout="manejarLogout"
          />
        </div>

        <!-- Vista de Gestión de Usuarios (solo admin) -->
        <div v-else-if="vistaActiva === 'usuarios'" class="vista-usuarios">
          <GestionUsuarios @registrar-actividad="registrarActividad" />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ===== CONTENEDOR PRINCIPAL ===== */
.app-container {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  background: #0f0f0f;
}

/* ===== WRAPPER DEL CONTENIDO PRINCIPAL ===== */
.main-wrapper {
  flex: 1;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--transition-normal);
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* Sidebar colapsado */
.main-wrapper.sidebar-collapsed {
  margin-left: var(--sidebar-width-collapsed);
}

/* ===== HEADER PRINCIPAL ===== */
.main-header {
  background: #111;
  padding: 0 clamp(0.75rem, 3vw, 2rem);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 1px 0 rgba(0,0,0,0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  gap: 0.5rem;
  min-height: 64px;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  overflow: hidden;
}

.header-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
}

.main-header h1 {
  margin: 0;
  font-family: 'Sora', var(--font-display);
  font-size: clamp(0.85rem, 2vw, 1.25rem);
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  min-width: 0;
}

.header-subtitle {
  display: none;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.3);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .header-subtitle { display: inline-block; }
}

.header-evento {
  display: none;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .header-evento { display: inline-flex; }
}

.header-user {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-shrink: 0;
}

.user-name {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.user-avatar-header {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-full);
  background: #FFD700;
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

/* ===== MAIN CONTENT ===== */
main {
  flex: 1;
  padding: clamp(1rem, 3vw, 2rem);
  max-width: var(--container-max-width);
  margin: 0 auto;
  width: 100%;
}

/* ===== SECCIÓN ENCABEZADO COMPARTIDO ===== */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.section-header h2 {
  margin: 0;
  color: var(--color-text);
  font-family: 'Sora', var(--font-display);
  font-size: clamp(1.35rem, 3vw, 1.75rem);
  font-weight: 800;
  letter-spacing: -0.01em;
}

.section-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 215, 0, 0.12);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: var(--radius-full);
  color: var(--color-primary);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

/* ===== VISTAS ESPECÍFICAS ===== */
.vista-estadisticas,
.vista-configuracion,
.vista-actividad {
  margin-bottom: var(--spacing-lg);
}

/* ===== GRID DE ESTADÍSTICAS ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.stat-card {
  background: var(--color-dark);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #FFD700;
  opacity: 0.6;
  transition: opacity var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 215, 0, 0.1);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-confirmados:hover {
  border-color: rgba(52, 211, 153, 0.4);
}

.stat-confirmados::before {
  background: #34d399;
}

.stat-pendientes:hover {
  border-color: rgba(251, 191, 36, 0.4);
}

.stat-pendientes::before {
  background: #FBBF24;
}

.stat-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
}

.stat-total .stat-icon svg      { color: #FFD700; }
.stat-confirmados .stat-icon svg { color: #34d399; }
.stat-pendientes .stat-icon svg  { color: #FBBF24; }

.stat-body {
  min-width: 0;
}

.stat-value {
  font-family: 'Sora', var(--font-display);
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
  letter-spacing: -0.02em;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  margin-top: 0.3rem;
}

.stat-pct {
  margin-top: 0.25rem;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 500;
}

/* ===== BARRA DE PROGRESO ===== */
.progress-card {
  margin-top: 1.25rem;
  padding: 1.25rem 1.5rem;
  background: var(--color-dark);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-xl);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
}

.progress-pct {
  color: var(--color-primary);
  font-weight: 800;
  font-size: 1rem;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #FFD700;
  border-radius: var(--radius-full);
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ===== VISTA DE CONFIGURACIÓN ===== */
.config-card {
  max-width: 600px;
  padding: 1.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  background: var(--color-dark);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.config-card h3 {
  margin: 0 0 0.35rem;
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 700;
}

.config-description {
  margin: 0 0 1.25rem;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.6;
}

.evento-actual {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.15);
  border-radius: var(--radius-lg);
}

.evento-label {
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.evento-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.6rem;
  border-radius: var(--radius-full);
  background: #FFD700;
  color: #111;
  font-weight: 800;
  font-size: 0.95rem;
}

.evento-form label {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
}

.evento-form-row {
  display: flex;
  gap: 0.65rem;
}

.evento-form-row input {
  flex: 1;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  font-size: 0.97rem;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.evento-form-row input:focus {
  outline: none;
  border-color: #FFD700;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
}

.evento-form-row input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.evento-form-row button {
  border: 0;
  border-radius: var(--radius-md);
  padding: 0.7rem 1.25rem;
  background: #FFD700;
  color: #111;
  font-weight: 800;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.evento-form-row button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(255, 215, 0, 0.35);
}

.evento-form-row button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.config-msg {
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
}

.config-msg.error {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.config-msg.success {
  background: rgba(16, 185, 129, 0.1);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.config-help {
  margin-top: 0.75rem;
  color: var(--color-text-muted);
  font-size: 0.82rem;
}

.coming-soon {
  text-align: center;
  color: var(--color-text-muted);
  font-size: clamp(1rem, 2vw, 1.25rem);
  padding: clamp(2rem, 5vw, 4rem) var(--spacing-lg);
  font-style: italic;
}

/* ===== RESPONSIVE BREAKPOINTS ===== */

/* Mobile Small (< 480px) */
/* ── Mobile S (≤480px) ── */
@media (max-width: 480px) {
  .main-wrapper { margin-left: 0; }
  /* padding-left: 4rem deja espacio al hamburger fijo (2.5rem + 1rem left + 0.5rem gap) */
  .main-header { padding: 0 0.75rem 0 4rem; height: 56px; min-height: 56px; }
  .main-header h1 { font-size: 0.9rem; }
  .header-subtitle { display: none; }
  .user-name { display: none; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
  .evento-form-row { flex-direction: column; }
  main { padding: 0.75rem; }
}

/* ── Mobile M (481–640px) ── */
@media (min-width: 481px) and (max-width: 640px) {
  .main-wrapper { margin-left: 0; }
  .main-header { padding: 0 1rem 0 4rem; }
  .main-header h1 { font-size: 0.95rem; }
  .user-name { display: none; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 0.65rem; }
  main { padding: 1rem; }
}

/* ── Mobile L (641–768px) ── */
@media (min-width: 641px) and (max-width: 768px) {
  .main-wrapper { margin-left: 0; }
  .main-header { padding: 0 1.5rem 0 4.5rem; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .user-name { max-width: 100px; }
}

/* ── Tablet (769–979px) ── */
@media (min-width: 769px) and (max-width: 979px) {
  .main-wrapper { margin-left: var(--sidebar-width-collapsed); }
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
  .user-name { max-width: 120px; }
}

/* ── Desktop (980–1199px) ── */
@media (min-width: 980px) and (max-width: 1199px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
  .user-name { max-width: 150px; }
}

/* ── Desktop L (1200–1919px) ── */
@media (min-width: 1200px) and (max-width: 1919px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
  .user-name { max-width: 200px; }
}

/* Ultrawide (1920px+) */
@media (min-width: 1920px) {
  main {
    max-width: 1600px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  .stat-card {
    min-height: 180px;
  }

  .user-name {
    max-width: 250px;
  }
}
</style>
