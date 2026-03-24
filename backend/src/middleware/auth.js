import jwt from 'jsonwebtoken'
import { query } from '../config/database.js'
import { logger } from '../utils/logger.js'
import rateLimit from 'express-rate-limit'

// Blacklist en memoria de JWTs revocados al hacer logout.
// Cada entrada se limpia automáticamente cuando el token hubiera expirado.
const revokedTokens = new Set()

export const revokeToken = (token, expiresInMs) => {
  revokedTokens.add(token)
  setTimeout(() => revokedTokens.delete(token), expiresInMs)
}

export const isTokenRevoked = (token) => revokedTokens.has(token)

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
    const token = req.cookies?.token || (process.env.ALLOW_BEARER_TOKEN === 'true' && authHeader && authHeader.split(' ')[1])

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación no proporcionado'
      })
    }

    // Rechazar tokens revocados (logout explícito)
    if (isTokenRevoked(token)) {
      return res.status(401).json({
        success: false,
        message: 'Sesión cerrada. Inicia sesión nuevamente.'
      })
    }

    // Verificar token — solo se acepta desde cookie HttpOnly (no Authorization header en web)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Intentar servir desde cache antes de ir a la BD
    const cached = userCache.get(decoded.userId)
    if (cached && Date.now() < cached.expiresAt) {
      req.user = cached.data
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

    req.user = result.rows[0]
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

// Permisos por defecto según rol (espejo del frontend, pero aplicado en el servidor)
const PERMISOS_DEFAULT_POR_ROL = {
  admin:        { ver_invitados: true,  confirmar_invitados: true,  crear_invitados: true,  editar_invitados: true,  eliminar_invitados: true,  importar_invitados: true  },
  organizador:  { ver_invitados: true,  confirmar_invitados: true,  crear_invitados: true,  editar_invitados: true,  eliminar_invitados: true,  importar_invitados: true  },
  asistente:    { ver_invitados: true,  confirmar_invitados: true,  crear_invitados: true,  editar_invitados: true,  eliminar_invitados: false, importar_invitados: false },
  guardia:      { ver_invitados: true,  confirmar_invitados: true,  crear_invitados: false, editar_invitados: false, eliminar_invitados: false, importar_invitados: false },
  visualizador: { ver_invitados: true,  confirmar_invitados: false, crear_invitados: false, editar_invitados: false, eliminar_invitados: false, importar_invitados: false },
}

// Middleware para verificar un permiso granular.
// Primero revisa req.user.permisos (overrides por usuario),
// si no existe el campo cae al default del rol.
export const requirePermiso = (permiso) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado' })
    }

    const overrides = req.user.permisos || {}
    const defaults  = PERMISOS_DEFAULT_POR_ROL[req.user.rol] || {}
    const allowed   = permiso in overrides ? overrides[permiso] : (defaults[permiso] ?? false)

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: `Permiso denegado: se requiere el permiso '${permiso}'`
      })
    }
    next()
  }
}
