import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../services/api'
import { PERMISOS_POR_ROL } from '../../shared/permissions.js'

const SESSION_CACHE_KEY = 'eventroll_session'
const SESSION_CACHE_TTL = 5 * 60 * 1000

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref(null)

  const isAuthenticated = computed(() => !!usuario.value)

  const permisos = computed(() => {
    if (!usuario.value) return {}
    return PERMISOS_POR_ROL[usuario.value.rol] ?? {}
  })

  function getCachedSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_CACHE_KEY)
      if (!raw) return null
      const { usuario: cached, cachedAt } = JSON.parse(raw)
      if (Date.now() - cachedAt > SESSION_CACHE_TTL) {
        sessionStorage.removeItem(SESSION_CACHE_KEY)
        return null
      }
      return cached
    } catch {
      sessionStorage.removeItem(SESSION_CACHE_KEY)
      return null
    }
  }

  function cacheSession(userData) {
    try {
      sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
        usuario: userData,
        cachedAt: Date.now(),
      }))
    } catch { /* sessionStorage lleno o no disponible */ }
  }

  /**
   * Intenta restaurar la sesión llamando a /api/auth/me.
   * El token viaja en la cookie HttpOnly automáticamente.
   */
  async function initSession() {
    const cached = getCachedSession()
    if (cached) {
      usuario.value = cached
      return
    }
    try {
      const response = await authAPI.getMe()
      if (response.success && response.data) {
        const user = response.data.usuario ?? response.data
        usuario.value = user
        cacheSession(user)
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
      cacheSession(response.data.usuario)
    }
    return response
  }

  /** Login con código de acceso (sin email/password). */
  async function loginConCodigo(codigo) {
    const response = await authAPI.loginConCodigo(codigo)
    if (response.success && response.data) {
      usuario.value = response.data.usuario
      cacheSession(response.data.usuario)
    }
    return response
  }

  /** Ejecuta logout, limpia el store y la cookie en el servidor. */
  async function logout() {
    try {
      await authAPI.logout()
    } finally {
      usuario.value = null
      sessionStorage.removeItem(SESSION_CACHE_KEY)
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
