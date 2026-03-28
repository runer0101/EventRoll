import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'

import authRoutes from './routes/authRoutes.js'
import usuariosRoutes from './routes/usuariosRoutes.js'
import invitadosRoutes from './routes/invitadosRoutes.js'
import eventosRoutes from './routes/eventosRoutes.js'
import passwordRecoveryRoutes from './routes/password-recovery.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import { requestId } from './middleware/requestId.js'
import { authenticateToken, requireAdmin } from './middleware/auth.js'
import { logger } from './utils/logger.js'
import { swaggerSpec } from './config/swagger.js'
import { query } from './config/database.js'

const app = express()

// ========== SEGURIDAD ==========

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://fonts.googleapis.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", ...corsOrigin.split(',').map(o => o.trim())],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    permittedCrossDomainPolicies: true,
    crossOriginEmbedderPolicy: false,
  })
)

// Permissions-Policy: restringir acceso a APIs sensibles del navegador
app.use((_req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
  )
  next()
})

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

// Protección CSRF: verificar Origin en métodos mutantes (POST/PUT/DELETE/PATCH).
// Se omite en entorno de test para que Supertest (que no envía Origin) pueda operar.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',').map(o => o.trim())
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'test') return next()
  const mutating = ['POST', 'PUT', 'DELETE', 'PATCH']
  if (!mutating.includes(req.method)) return next()
  const origin = req.headers.origin || ''
  if (!origin) {
    // En producción: rechazar siempre requests mutantes sin Origin
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Origen no permitido' })
    }
    // En desarrollo/test: permitir desde localhost (herramientas locales y Supertest)
    const host = req.headers.host || ''
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) return next()
    return res.status(403).json({ success: false, message: 'Origen no permitido' })
  }
  if (allowedOrigins.some(o => origin === o || origin.startsWith(o + '/'))) return next()
  return res.status(403).json({ success: false, message: 'Origen no permitido' })
})

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// ========== MIDDLEWARE ==========

app.use(requestId)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

const morganStream = { write: (msg) => logger.http(msg.trim()) }
app.use(morgan('combined', { stream: morganStream }))

// ========== RUTAS ==========

app.get('/health', async (req, res) => {
  let dbOk = false
  try {
    await query('SELECT 1')
    dbOk = true
  } catch (_) { /* DB unreachable */ }

  const status = dbOk ? 200 : 503
  res.setHeader('Cache-Control', 'public, max-age=30')
  res.status(status).json({
    success: dbOk,
    status: dbOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    // Versión omitida intencionalmente para evitar fingerprinting en producción
    services: { database: dbOk ? 'up' : 'down' },
  })
})

// Swagger: protegido en producción (admin only), público en dev/test
if (process.env.NODE_ENV === 'production') {
  app.use('/api/docs', authenticateToken, requireAdmin, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'EventRoll API Docs',
    swaggerOptions: { persistAuthorization: true },
  }))
  app.get('/api/docs.json', authenticateToken, requireAdmin, (req, res) => res.json(swaggerSpec))
} else {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'EventRoll API Docs',
    swaggerOptions: { persistAuthorization: true },
  }))
  app.get('/api/docs.json', (req, res) => res.json(swaggerSpec))
}

// Cache-Control: rutas privadas no deben cachearse; /health puede cachearse brevemente
app.use('/api/v1/', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  next()
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/usuarios', usuariosRoutes)
app.use('/api/v1/invitados', invitadosRoutes)
app.use('/api/v1/eventos', eventosRoutes)
app.use('/api/v1/password-recovery', passwordRecoveryRoutes)

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EventRoll API v1',
    endpoints: {
      health: '/health',
      docs: '/api/docs',
      auth: '/api/v1/auth',
      usuarios: '/api/v1/usuarios',
      invitados: '/api/v1/invitados',
    },
  })
})

// ========== MANEJO DE ERRORES ==========
app.use(notFound)
app.use(errorHandler)

export default app
