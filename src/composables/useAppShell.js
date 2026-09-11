import { ref, computed, watchEffect, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useEventoStore } from '../stores/evento'
import { invitadosAPI } from '../services/api'

/**
 * Composable para lógica de negocio de AppShell
 * Extraído de AppShell.vue para mejorar mantenibilidad
 */
export function useAppShell() {
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

  // Watchers
  watchEffect(() => {
    if (eventoStore.eventoId) cargarStats()
  })

  watchEffect(() => {
    if (route.name === 'estadisticas') cargarStats()
  })

  onMounted(async () => {
    await cargarStats()
    registrarActividad('Inició sesión')
  })

  return {
    usuarioActual,
    eventoIdActual,
    actividadReciente,
    sidebarCollapsed,
    stats,
    registrarActividad,
    cargarStats,
    manejarLogout,
    handleSidebarToggle,
    seleccionarMenu,
    // Para provide/inject
    authStore,
    eventoStore,
  }
}
