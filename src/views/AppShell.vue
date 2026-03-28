<script setup>
import { ref, computed, provide, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import { useAuthStore } from '../stores/auth'
import { useEventoStore } from '../stores/evento'
import { invitadosAPI } from '../services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const eventoStore = useEventoStore()

const usuarioActual = computed(() => authStore.usuario)
const eventoIdActual = computed(() => eventoStore.eventoId)

const actividadReciente = ref([])
const sidebarCollapsed = ref(false)
const statsData = ref({ totalInvitados: 0, confirmados: 0, pendientes: 0 })
const stats = computed(() => statsData.value)

const MAX_ACTIVIDADES = 10

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

async function cargarStats() {
  if (!authStore.usuario || !eventoStore.eventoId) return
  try {
    const res = await invitadosAPI.getAll({ evento_id: eventoStore.eventoId, limit: 1 })
    const p = res.pagination || {}
    statsData.value = {
      totalInvitados: p.total || 0,
      confirmados: p.confirmados || 0,
      pendientes: p.pendientes || 0,
    }
  } catch {
    // mantiene los ceros
  }
}

async function manejarLogout() {
  registrarActividad('Cerró sesión')
  actividadReciente.value = []
  await authStore.logout()
  router.push('/')
}

function handleSidebarToggle(collapsed) {
  sidebarCollapsed.value = collapsed
}

function seleccionarMenu(itemId) {
  registrarActividad(`Navegó a ${itemId}`)
  router.push({ name: itemId })
  if (itemId === 'estadisticas') cargarStats()
}

// Provide para componentes hijos (mantiene compatibilidad con ListaInvitados, GestionUsuarios)
provide('permisos', () => authStore.permisos)
provide('registrarActividad', registrarActividad)
provide('eventoIdActual', () => eventoStore.eventoId)
provide('setEventoIdActual', (v) => eventoStore.setEventoId(v))
provide('stats', stats)
provide('actividadReciente', actividadReciente)
provide('manejarLogout', manejarLogout)

watch(() => eventoStore.eventoId, cargarStats)

// Recargar stats al entrar a la ruta de estadísticas
watch(() => route.name, (name) => {
  if (name === 'estadisticas') cargarStats()
})

onMounted(async () => {
  await cargarStats()
  registrarActividad('Inició sesión')
})
</script>

<template>
  <div class="app-container">
    <Sidebar
      :usuario="usuarioActual"
      :active-item="route.name"
      :stats="stats"
      @logout="manejarLogout"
      @select-menu="seleccionarMenu"
      @toggle="handleSidebarToggle"
    />

    <div class="main-wrapper" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <header class="main-header">
        <div class="header-content">
          <h1>Organización de Eventos</h1>
          <span class="header-subtitle">Panel de gestión</span>
          <span class="header-evento">Evento activo: ID {{ eventoIdActual }}</span>
        </div>
        <div class="header-user">
          <span class="user-name">{{ usuarioActual?.nombre }}</span>
          <div class="user-avatar-header" :aria-label="`Usuario: ${usuarioActual?.nombre}`">
            {{ usuarioActual?.nombre?.charAt(0)?.toUpperCase() }}
          </div>
        </div>
      </header>

      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  background: #0a0a0a;
  background-image: var(--gradient-mesh);
  background-attachment: fixed;
}

.main-wrapper {
  flex: 1;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--transition-normal);
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.main-wrapper.sidebar-collapsed {
  margin-left: var(--sidebar-width-collapsed);
}

.main-header {
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 0 clamp(0.75rem, 3vw, 2rem);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: 0 1px 0 rgba(0,0,0,0.3), 0 4px 24px rgba(0,0,0,0.15);
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
  background: var(--gradient-gold-text);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer-text 4s linear infinite;
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
  background: var(--gradient-gold);
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(255,215,0,0.2), 0 2px 8px rgba(255,215,0,0.2);
  transition: box-shadow var(--transition-fast);
}

.user-avatar-header:hover {
  box-shadow: 0 0 0 3px rgba(255,215,0,0.4), 0 4px 12px rgba(255,215,0,0.25);
}

main {
  flex: 1;
  padding: clamp(1rem, 3vw, 2rem);
  max-width: var(--container-max-width);
  margin: 0 auto;
  width: 100%;
}

/* Responsive */
@media (max-width: 480px) {
  .main-wrapper { margin-left: 0; }
  .main-header { padding: 0 0.75rem 0 4rem; height: 56px; min-height: 56px; }
  .main-header h1 { font-size: 0.9rem; }
  .header-subtitle { display: none; }
  .user-name { display: none; }
  main { padding: 0.75rem; }
}

@media (min-width: 481px) and (max-width: 640px) {
  .main-wrapper { margin-left: 0; }
  .main-header { padding: 0 1rem 0 4rem; }
  .main-header h1 { font-size: 0.95rem; }
  .user-name { display: none; }
  main { padding: 1rem; }
}

@media (min-width: 641px) and (max-width: 768px) {
  .main-wrapper { margin-left: 0; }
  .main-header { padding: 0 1.5rem 0 4.5rem; }
  .user-name { max-width: 100px; }
}

@media (min-width: 769px) and (max-width: 979px) {
  .main-wrapper { margin-left: var(--sidebar-width-collapsed); }
  .user-name { max-width: 120px; }
}

@media (min-width: 980px) {
  .user-name { max-width: 200px; }
}

@media (min-width: 1920px) {
  main { max-width: 1600px; }
}
</style>
