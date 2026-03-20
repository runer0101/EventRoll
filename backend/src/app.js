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
import { logger } from './utils/logger.js'
import { swaggerSpec } from './config/swagger.js'
import { query } from './config/database.js'

const app = express()

// ========== SEGURIDAD ==========

app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
  })
)

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

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
    version: process.env.npm_package_version || '1.3.0',
    services: { database: dbOk ? 'up' : 'down' },
  })
})

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'EventRoll API Docs',
  swaggerOptions: { persistAuthorization: true },
}))
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec))

app.use('/api/auth', authRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/invitados', invitadosRoutes)
app.use('/api/password-recovery', passwordRecoveryRoutes)

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EventRoll API',
    version: '1.3.0',
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
