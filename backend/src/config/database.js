import pg from 'pg'
import dotenv from 'dotenv'
import { logger } from '../utils/logger.js'

dotenv.config()

const { Pool } = pg

// SSL solo en producción — en test/development el Postgres local no tiene SSL
const isProduction = process.env.NODE_ENV === 'production'

// En producción con Render/Heroku la URL trae sslmode=require.
// DB_SSL_REJECT_UNAUTHORIZED=false desactiva la validación del certificado (no recomendado).
// Por defecto true en producción para validar el certificado SSL del servidor de BD.
const dbUrl = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace('sslmode=require', 'sslmode=no-verify')
  : undefined

// En producción: true por defecto (seguro), false solo si se define explícitamente.
// En otros entornos: false por defecto (BD local sin SSL).
const sslRejectUnauthorized = isProduction
  ? process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  : process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'

// Configuración del pool de conexiones
const pool = new Pool({
  connectionString: dbUrl,
  ssl: isProduction ? { rejectUnauthorized: sslRejectUnauthorized } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

// Errores inesperados del pool (ej: BD caída en producción)
pool.on('error', (err) => {
  logger.error('Error inesperado en el pool de base de datos', { message: err.message })
  process.exit(-1)
})

// Función para ejecutar queries
export const query = async (text, params) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    logger.debug('Query ejecutado', { duration, rows: res.rowCount })
    return res
  } catch (error) {
    // No exponer el texto SQL en producción (podría revelar esquema de BD)
    logger.error('Error en query', {
      message: error.message,
      ...(isProduction ? {} : { query: text }),
    })
    throw error
  }
}

// Función para obtener un cliente (para transacciones)
export const getClient = () => pool.connect()

// Función para verificar conexión
export const testConnection = async () => {
  try {
    process.stderr.write('[DB] Intentando conectar a la base de datos...\n')
    const result = await query('SELECT NOW()')
    process.stderr.write(`[DB] Conexión exitosa: ${result.rows[0].now}\n`)
    logger.info(`Conexión a base de datos exitosa: ${result.rows[0].now}`)
    return true
  } catch (error) {
    process.stderr.write(`[DB] ERROR de conexión: ${error.message}\n`)
    logger.error('Error conectando a base de datos', { message: error.message })
    return false
  }
}

export default {
  query,
  getClient,
  testConnection,
  pool
}
