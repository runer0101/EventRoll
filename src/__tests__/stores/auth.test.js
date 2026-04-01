import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../stores/auth.js'

vi.mock('../../services/api.js', () => ({
  authAPI: {
    getMe: vi.fn(),
    login: vi.fn(),
    loginConCodigo: vi.fn(),
    logout: vi.fn(),
  },
}))

import { authAPI } from '../../services/api.js'

const mockUsuario = {
  id: 'user-uuid-1',
  nombre: 'Admin',
  email: 'admin@ejemplo.com',
  rol: 'admin',
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  sessionStorage.clear()
  localStorage.clear()
})

describe('useAuthStore', () => {
  // ─── Estado inicial ───────────────────────────────────────────────
  it('inicia sin usuario y no autenticado', () => {
    const store = useAuthStore()
    expect(store.usuario).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('permisos es objeto vacío sin usuario', () => {
    const store = useAuthStore()
    expect(store.permisos).toEqual({})
  })

  // ─── initSession ──────────────────────────────────────────────────
  it('initSession restaura el usuario desde /auth/me', async () => {
    authAPI.getMe.mockResolvedValue({ success: true, data: { usuario: mockUsuario } })

    const store = useAuthStore()
    await store.initSession()

    expect(store.usuario).toEqual(mockUsuario)
    expect(store.isAuthenticated).toBe(true)
  })

  it('initSession deja usuario null si getMe falla', async () => {
    authAPI.getMe.mockRejectedValue(new Error('Unauthorized'))

    const store = useAuthStore()
    await store.initSession()

    expect(store.usuario).toBeNull()
  })

  // ─── login ────────────────────────────────────────────────────────
  it('login establece el usuario en el store', async () => {
    authAPI.login.mockResolvedValue({ success: true, data: { usuario: mockUsuario } })

    const store = useAuthStore()
    await store.login('admin@ejemplo.com', 'password123')

    expect(store.usuario).toEqual(mockUsuario)
    expect(store.isAuthenticated).toBe(true)
  })

  // ─── loginConCodigo ───────────────────────────────────────────────
  it('loginConCodigo establece el usuario cuando el código es válido', async () => {
    authAPI.loginConCodigo.mockResolvedValue({ success: true, data: { usuario: mockUsuario } })

    const store = useAuthStore()
    await store.loginConCodigo('ABC12345')

    expect(store.usuario).toEqual(mockUsuario)
  })

  // ─── logout ───────────────────────────────────────────────────────
  it('logout limpia el usuario del store', async () => {
    authAPI.getMe.mockResolvedValue({ success: true, data: { usuario: mockUsuario } })
    authAPI.logout.mockResolvedValue({ success: true })

    const store = useAuthStore()
    await store.initSession()
    expect(store.isAuthenticated).toBe(true)

    await store.logout()
    expect(store.usuario).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  // ─── permisos por rol ─────────────────────────────────────────────
  it('admin tiene todos los permisos de gestión', async () => {
    authAPI.getMe.mockResolvedValue({ success: true, data: { usuario: { ...mockUsuario, rol: 'admin' } } })

    const store = useAuthStore()
    await store.initSession()

    expect(store.permisos.gestionarUsuarios).toBe(true)
    expect(store.permisos.eliminarInvitados).toBe(true)
  })

  it('guardia solo puede confirmar invitados', async () => {
    authAPI.getMe.mockResolvedValue({ success: true, data: { usuario: { ...mockUsuario, rol: 'guardia' } } })

    const store = useAuthStore()
    await store.initSession()

    expect(store.permisos.confirmarInvitados).toBe(true)
    expect(store.permisos.agregarInvitados).toBe(false)
    expect(store.permisos.gestionarUsuarios).toBe(false)
  })

  it('visualizador solo puede ver y exportar', async () => {
    authAPI.getMe.mockResolvedValue({ success: true, data: { usuario: { ...mockUsuario, rol: 'visualizador' } } })

    const store = useAuthStore()
    await store.initSession()

    expect(store.permisos.verInvitados).toBe(true)
    expect(store.permisos.exportarExcel).toBe(true)
    expect(store.permisos.editarInvitados).toBe(false)
    expect(store.permisos.eliminarInvitados).toBe(false)
  })
})
