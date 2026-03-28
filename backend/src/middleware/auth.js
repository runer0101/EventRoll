import jwt from 'jsonwebtoken'
import { query } from '../config/database.js'
import { logger } from '../utils/logger.js'
import rateLimit from 'express-rate-limit'

// ─── Blacklist persistente de tokens (tabla revoked_tokens) ─────────────────
// Los tokens se revocan al hacer logout y se almacenan en BD por su JTI.
// La limpieza de tokens expirados se ejecuta al arrancar el servidor y diariamente.

export const revokeToken = async (jti, expiresAt) => {
  await query(
    'INSERT INTO revoked_tokens (jti, expires_at) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [jti, expiresAt]
  )
}

export const isTokenRevoked = async (jti) => {
  if (!jti) return false
  const result = await query(
    'SELECT 1 FROM revoked_tokens WHERE jti = $1 AND expires_at > NOW()',
    [jti]
  )
  return result.rows.length > 0
}

// Elimina tokens expirados de la tabla — llamar al inicio del servidor y diariamente
export const cleanupExpiredTokens = async () => {
  try {
    const result = await query('DELETE FROM revoked_tokens WHERE expires_at <= NOW()')
    if (result.rowCount > 0) {
      logger.info(`Blacklist: ${result.rowCount} tokens expirados eliminados`)
    }
  } catch (error) {
    logger.error('Error limpiando tokens expirados', { message: error.message })
  }
}

// Cache en memoria para evitar una query a BD en cada request autenticado
// TTL de 5 minutos — se invalida en logout, update y delete de usuario
const userCache = new Map()
const USER_CACHE_TTL = 5 * 60 * 1000

export const invalidateCachedUser = (userId) => {
  userCache.delete(userId)
}

// Rate limiter para login (prevenir fuerza bruta)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 intentos por IP
  message: { success: false, message: 'Demasiados intentos de inicio de sesión. Espera 15 minutos e intenta de nuevo.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter para solicitar códigos de recuperación
export const recoveryRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 solicitudes por IP
  message: { success: false, message: 'Demasiadas solicitudes de recuperación. Intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter para verificación de código
export const recoveryVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP — reduce ventana de fuerza bruta sobre códigos numéricos
  message: { success: false, message: 'Demasiados intentos de verificación. Intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter para restablecer contraseña
export const recoveryResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // limitar reintentos de cambio de clave por IP
  message: { success: false, message: 'Demasiados intentos de restablecimiento. Intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter para generación de códigos de acceso
export const codigoLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 generaciones por IP por minuto
  message: { success: false, message: 'Demasiadas generaciones de código. Espera un momento.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware para verificar JWT
// Acepta token desde: 1) cookie HttpOnly  2) header Authorization: Bearer <token>
export const authenticateToken = async (req, res, next) => {
  try {
    // Token exclusivamente desde cookie HttpOnly — el header Authorization queda
    // disponible solo como fallback explícito para clientes no-web (API externa).
    // En un deploy puramente web se puede eliminar la segunda parte.
    const authHeader = req.headers['authorization']
    const bearerAllowed = process.env.NODE_ENV !== 'production' && process.env.ALLOW_BEARER_TOKEN === 'true'
    const token = req.cookies?.token || (bearerAllowed && authHeader?.startsWith('Bearer ') && authHeader.split(' ')[1])

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación no proporcionado'
      })
    }

    // Verificar firma y expiración del JWT primero
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Rechazar tokens revocados por jti (logout explícito) — solo tokens válidos llegan aquí
    if (await isTokenRevoked(decoded.jti)) {
      return res.status(401).json({
        success: false,
        message: 'Sesión cerrada. Inicia sesión nuevamente.'
      })
    }

    // Intentar servir datos de usuario desde cache antes de ir a la BD
    const cached = userCache.get(decoded.userId)
    if (cached && Date.now() < cached.expiresAt) {
      // Adjuntar permisos del JWT (overrides por usuario guardados al momento del login)
      req.user = { ...cached.data, permisos: decoded.permisos ?? null }
      return next()
    }

    // Cache miss → consultar BD y guardar resultado
    const result = await query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE id = $1',
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    userCache.set(decoded.userId, {
      data: result.rows[0],
      expiresAt: Date.now() + USER_CACHE_TTL
    })

    // Adjuntar permisos del JWT (overrides por usuario guardados al momento del login)
    req.user = { ...result.rows[0], permisos: decoded.permisos ?? null }
    next()

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Token inválido'
      })
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesión expirada. Inicia sesión nuevamente.'
      })
    }

    logger.error('Error en autenticación', { message: error.message, requestId: req.requestId })
    return res.status(500).json({
      success: false,
      message: 'Error en autenticación'
    })
  }
}

// Middleware para verificar rol específico
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      })
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `Permiso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
      })
    }

    next()
  }
}

// Middleware para verificar que el usuario es admin
export const requireAdmin = requireRole('admin')

// Middleware para verificar que el usuario es admin u organizador
export const requireOrganizer = requireRole('admin', 'organizador')

// Mapa de permisos por rol (espejo del frontend para validación en backend)
const PERMISOS_POR_ROL = {
  admin:        { verInvitados: true,  agregarInvitados: true,  editarInvitados: true,  eliminarInvitados: true,  confirmarInvitados: true,  exportarExcel: true,  importarExcel: true,  configurarSillas: true,  gestionarUsuarios: true  },
  organizador:  { verInvitados: true,  agregarInvitados: true,  editarInvitados: true,  eliminarInvitados: true,  confirmarInvitados: true,  exportarExcel: true,  importarExcel: true,  configurarSillas: true,  gestionarUsuarios: false },
  asistente:    { verInvitados: true,  agregarInvitados: true,  editarInvitados: true,  eliminarInvitados: false, confirmarInvitados: true,  exportarExcel: true,  importarExcel: false, configurarSillas: false, gestionarUsuarios: false },
  visualizador: { verInvitados: true,  agregarInvitados: false, editarInvitados: false, eliminarInvitados: false, confirmarInvitados: false, exportarExcel: true,  importarExcel: false, configurarSillas: false, gestionarUsuarios: false },
  guardia:      { verInvitados: true,  agregarInvitados: false, editarInvitados: false, eliminarInvitados: false, confirmarInvitados: true,  exportarExcel: false, importarExcel: false, configurarSillas: false, gestionarUsuarios: false },
}

// Middleware para verificar un permiso granular.
// Primero revisa req.user.permisos (overrides por usuario, campo permisos JSONB),
// si no existe el campo cae al mapa de permisos por rol.
export function requirePermiso(permiso) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado' })
    }
    // Primero verificar override granular del usuario (campo permisos JSONB)
    const override = req.user.permisos
    if (override && typeof override === 'object' && permiso in override) {
      return override[permiso]
        ? next()
        : res.status(403).json({ success: false, message: 'No tienes permiso para realizar esta acción' })
    }
    // Fallback al mapa de permisos por rol
    const rolePerms = PERMISOS_POR_ROL[req.user.rol] || {}
    return rolePerms[permiso]
      ? next()
      : res.status(403).json({ success: false, message: 'No tienes permiso para realizar esta acción' })
  }
}
