import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../services/api'

/**
 * Mapa de permisos por rol.
 * Fuente de verdad para toda la aplicación.
 */
const PERMISOS_POR_ROL = Object.freeze({
  admin: Object.freeze({
    verInvitados: true,
    agregarInvitados: true,
    editarInvitados: true,
    eliminarInvitados: true,
    confirmarInvitados: true,
    exportarExcel: true,
    importarExcel: true,
    configurarSillas: true,
    verEstadisticas: true,
    gestionarUsuarios: true,
  }),
  organizador: Object.freeze({
    verInvitados: true,
    agregarInvitados: true,
    editarInvitados: true,
    eliminarInvitados: true,
    confirmarInvitados: true,
    exportarExcel: true,
    importarExcel: true,
    configurarSillas: true,
    verEstadisticas: true,
    gestionarUsuarios: false,
  }),
  asistente: Object.freeze({
    verInvitados: true,
    agregarInvitados: true,
    editarInvitados: true,
    eliminarInvitados: false,
    confirmarInvitados: true,
    exportarExcel: true,
    importarExcel: false,
    configurarSillas: false,
    verEstadisticas: true,
    gestionarUsuarios: false,
  }),
  visualizador: Object.freeze({
    verInvitados: true,
    agregarInvitados: false,
    editarInvitados: false,
    eliminarInvitados: false,
    confirmarInvitados: false,
    exportarExcel: true,
    importarExcel: false,
    configurarSillas: false,
    verEstadisticas: true,
    gestionarUsuarios: false,
  }),
  guardia: Object.freeze({
    verInvitados: true,
    agregarInvitados: false,
    editarInvitados: false,
    eliminarInvitados: false,
    confirmarInvitados: true,
    exportarExcel: false,
    importarExcel: false,
    configurarSillas: false,
    verEstadisticas: false,
    gestionarUsuarios: false,
  }),
})

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref(null)

  const isAuthenticated = computed(() => !!usuario.value)

  const permisos = computed(() => {
    if (!usuario.value) return {}
    return PERMISOS_POR_ROL[usuario.value.rol] ?? {}
  })

  /**
   * Intenta restaurar la sesión llamando a /api/auth/me.
   * El token viaja en la cookie HttpOnly automáticamente.
   */
  async function initSession() {
    try {
      const response = await authAPI.getMe()
      if (response.success && response.data) {
        // El endpoint /me devuelve { usuario } dentro de data
        usuario.value = response.data.usuario ?? response.data
      }
    } catch {
      usuario.value = null
    }
  }

  /** Ejecuta login y establece el usuario en el store. */
  async function login(email, password) {
    const response = await authAPI.login(email, password)
    if (response.success && response.data) {
      usuario.value = response.data.usuario
    }
    return response
  }

  /** Login con código de acceso (sin email/password). */
  async function loginConCodigo(codigo) {
    const response = await authAPI.loginConCodigo(codigo)
    if (response.success && response.data) {
      usuario.value = response.data.usuario
    }
    return response
  }

  /** Ejecuta logout, limpia el store y la cookie en el servidor. */
  async function logout() {
    try {
      await authAPI.logout()
    } finally {
      usuario.value = null
      // Limpiar localStorage legacy (compatibilidad con versiones anteriores)
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    }
  }

  return {
    usuario,
    isAuthenticated,
    permisos,
    initSession,
    login,
    loginConCodigo,
    logout,
  }
})
