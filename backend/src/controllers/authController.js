import { asyncHandler } from '../utils/asyncHandler.js'
import { authService } from '../services/authService.js'
import { invalidateCachedUser } from '../middleware/auth.js'

/** Parsea duraciones tipo "24h", "7d", "30m" a milisegundos. */
const parseDurationMs = (str = '24h') => {
  const match = String(str).match(/^(\d+)(s|m|h|d)$/)
  if (!match) return 24 * 60 * 60 * 1000
  const [, n, unit] = match
  const factors = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }
  return parseInt(n, 10) * factors[unit]
}

const buildCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  // 'none' requerido para cross-origin (GitHub Pages → Render). Requiere secure:true.
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: parseDurationMs(process.env.JWT_EXPIRES_IN || '24h'),
  path: '/',
})

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body)

  // Token en cookie HttpOnly (principal) + en body para clientes que no usen cookies
  res.cookie('token', result.token, buildCookieOptions())

  res.json({
    success: true,
    data: {
      usuario: result.usuario,
      // token incluido para compatibilidad con clientes móviles / modo demo
      token: result.token,
    },
  })
})

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: authService.getCurrentUser(req.user),
  })
})

// @desc    Cerrar sesión y limpiar cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  invalidateCachedUser(req.user.id)
  await authService.logout(req.user)

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  })

  res.json({
    success: true,
    message: 'Logout exitoso',
  })
})
