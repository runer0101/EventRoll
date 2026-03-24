import dotenv from 'dotenv'

// Cargar variables de entorno antes que cualquier módulo interno
dotenv.config()

import { validateEnv } from './config/validateEnv.js'
import { testConnection } from './config/database.js'
import { cleanupExpiredTokens } from './middleware/auth.js'
import { logger } from './utils/logger.js'
import app from './app.js'

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000

const startServer = async () => {
  process.stderr.write('[STARTUP] server.js iniciando...\n')
  try {
    validateEnv()
    process.stderr.write('[STARTUP] validateEnv OK\n')

    // Advertencia de seguridad si ALLOW_BEARER_TOKEN está activo en producción
    if (process.env.ALLOW_BEARER_TOKEN === 'true' && process.env.NODE_ENV === 'production') {
      logger.warn('SECURITY WARNING: ALLOW_BEARER_TOKEN=true está activo en NODE_ENV=production. Bearer token auth no debería usarse en producción.')
    }

    const dbUrl = process.env.DATABASE_URL || ''
    const safeUrl = dbUrl.replace(/:([^:@]+)@/, ':***@')
    process.stderr.write(`[STARTUP] DATABASE_URL: ${safeUrl}\n`)

    const dbConnected = await testConnection()

    if (!dbConnected) {
      process.stderr.write('[STARTUP] ERROR: DB connection failed — exiting\n')
      logger.error('No se pudo conectar a la base de datos. Revisa DATABASE_URL y que PostgreSQL esté corriendo.')
      process.exit(1)
    }

    // Limpieza inicial de tokens expirados en la blacklist
    await cleanupExpiredTokens()

    // Limpieza periódica diaria (evita que la tabla crezca indefinidamente)
    const ONE_DAY_MS = 24 * 60 * 60 * 1000
    setInterval(cleanupExpiredTokens, ONE_DAY_MS).unref()

    process.stderr.write('[STARTUP] DB OK — arrancando servidor\n')
    app.listen(PORT, () => {
      process.stderr.write(`[STARTUP] Servidor escuchando en :${PORT}\n`)
      logger.info(`EventRoll Backend iniciado`, {
        port: PORT,
        env: process.env.NODE_ENV || 'development',
        docs: `http://localhost:${PORT}/api/docs`,
      })
    })

  } catch (error) {
    process.stderr.write(`[STARTUP] CATCH: ${error.message}\n`)
    logger.error('Error al iniciar el servidor', { message: error.message, stack: error.stack })
    process.exit(1)
  }
}

startServer()

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', { message: err.message, stack: err.stack })
  process.exit(1)
})

process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido. Cerrando servidor...')
  process.exit(0)
})

export default app
