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
import passwordRecoveryRoutes from './routes/password-recovery.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import { requestId } from './middleware/requestId.js'
import { authenticateToken, requireAdmin } from './middleware/auth.js'
import { logger } from './utils/logger.js'
import { swaggerSpec } from './config/swagger.js'
import { query } from './config/database.js'

const app = express()

// ========== SEGURIDAD ==========

app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
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
  // Permitir requests sin Origin solo desde localhost (herramientas de testing locales)
  if (!origin) {
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
  res.status(status).json({
    success: dbOk,
    status: dbOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    // Versión omitida intencionalmente para evitar fingerprinting en producción
    services: { database: dbOk ? 'up' : 'down' },
  })
})

// Swagger: público en dev/test, protegido con auth en producción
const swaggerMiddleware = process.env.NODE_ENV === 'production'
  ? [authenticateToken, requireAdmin]
  : []
app.use('/api/docs', ...swaggerMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'EventRoll API Docs',
  swaggerOptions: { persistAuthorization: true },
}))
app.get('/api/docs.json', ...swaggerMiddleware, (req, res) => res.json(swaggerSpec))

app.use('/api/auth', authRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/invitados', invitadosRoutes)
app.use('/api/password-recovery', passwordRecoveryRoutes)

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EventRoll API',
    endpoints: {
      health: '/health',
      docs: '/api/docs',
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      invitados: '/api/invitados',
    },
  })
})

// ========== MANEJO DE ERRORES ==========
app.use(notFound)
app.use(errorHandler)

export default app
