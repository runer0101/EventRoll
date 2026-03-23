import jwt from 'jsonwebtoken'
import { query } from '../config/database.js'
import { logger } from '../utils/logger.js'
import rateLimit from 'express-rate-limit'

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
  max: 15, // margen mayor para códigos mal ingresados por usuarios legítimos
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

// Middleware para verificar JWT
// Acepta token desde: 1) cookie HttpOnly  2) header Authorization: Bearer <token>
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = req.cookies?.token || (authHeader && authHeader.split(' ')[1])

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación no proporcionado'
      })
    }

    // Verificar token
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
      return res.status(403).json({
        success: false,
        message: 'Token expirado'
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
