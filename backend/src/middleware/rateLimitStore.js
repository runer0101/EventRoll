import { query } from '../config/database.js'
import { logger } from '../utils/logger.js'

/**
 * Rate limiter store basado en PostgreSQL
 * Más robusto que in-memory para múltiples instancias o reinicios
 * 
 * Nota: Para alta disponibilidad, considerar Redis con rate-limit-redis
 * ponytail: in-memory es suficiente para instancia única; migrar a Redis si se escala
 */
export class PostgresRateLimitStore {
  constructor(options = {}) {
    this.tableName = options.tableName || 'rate_limits'
    this.windowMs = options.windowMs || 15 * 60 * 1000 // 15 minutos default
    this.cleanupIntervalMs = options.cleanupIntervalMs || 60 * 60 * 1000 // Limpiar cada hora
    
    // Iniciar limpieza periódica de registros expirados
    this.startCleanup()
  }

  async increment(key) {
    const expiresAt = new Date(Date.now() + this.windowMs)
    
    try {
      // Upsert: incrementar contador o crear nuevo registro
      const result = await query(
        `INSERT INTO ${this.tableName} (key, count, expires_at)
         VALUES ($1, 1, $2)
         ON CONFLICT (key) DO UPDATE SET 
           count = CASE 
             WHEN ${this.tableName}.expires_at <= NOW() THEN 1 
             ELSE ${this.tableName}.count + 1 
           END,
           expires_at = CASE 
             WHEN ${this.tableName}.expires_at <= NOW() THEN $2 
             ELSE ${this.tableName}.expires_at 
           END
         RETURNING count, expires_at`,
        [key, expiresAt]
      )

      const row = result.rows[0]
      return {
        count: row.count,
        resetTime: new Date(row.expires_at).getTime(),
        totalHits: row.count
      }
    } catch (error) {
      logger.error('Error en rate limit store', { message: error.message, key })
      // En caso de error, permitir el request (fail open)
      return { count: 0, resetTime: Date.now() + this.windowMs, totalHits: 0 }
    }
  }

  async decrement(key) {
    try {
      await query(
        `UPDATE ${this.tableName} SET count = GREATEST(0, count - 1) WHERE key = $1`,
        [key]
      )
    } catch (error) {
      logger.error('Error decrementando rate limit', { message: error.message, key })
    }
  }

  async reset(key) {
    try {
      await query(`DELETE FROM ${this.tableName} WHERE key = $1`, [key])
    } catch (error) {
      logger.error('Error reseteando rate limit', { message: error.message, key })
    }
  }

  async cleanup() {
    try {
      const result = await query(
        `DELETE FROM ${this.tableName} WHERE expires_at <= NOW()`
      )
      if (result.rowCount > 0) {
        logger.info(`Rate limit store: ${result.rowCount} registros expirados eliminados`)
      }
    } catch (error) {
      logger.error('Error limpiando rate limit store', { message: error.message })
    }
  }

  startCleanup() {
    // Cleanup inicial después de 1 minuto
    setTimeout(() => this.cleanup(), 60 * 1000)
    // Cleanup periódico
    this.cleanupTimer = setInterval(() => this.cleanup(), this.cleanupIntervalMs)
  }

  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
  }
}

/**
 * Crear tabla de rate limits (llamar al inicio del servidor)
 */
export const createRateLimitTable = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key VARCHAR(255) PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    
    // Índice para cleanup eficiente
    await query(`
      CREATE INDEX IF NOT EXISTS idx_rate_limits_expires_at 
      ON rate_limits(expires_at)
    `)
    
    logger.info('Tabla rate_limits creada/verificada')
  } catch (error) {
    logger.error('Error creando tabla rate_limits', { message: error.message })
  }
}
