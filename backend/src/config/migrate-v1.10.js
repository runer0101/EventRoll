/**
 * Migración v1.10.0 — Rate Limiting Persistente
 * Agrega tabla rate_limits para rate limiting basado en PostgreSQL.
 */
import { query } from '../config/database.js'

const migrarV110 = async () => {
  console.log('\nIniciando migración v1.10 - Rate Limiting Persistente...\n')

  console.log('Creando tabla rate_limits...')
  await query(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key VARCHAR(255) PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `)
  console.log('Tabla rate_limits creada')

  console.log('Creando índices...')
  await query(`CREATE INDEX IF NOT EXISTS idx_rate_limits_expires_at ON rate_limits(expires_at)`)
  console.log('Índices creados')

  console.log('\nMigración v1.10 completada exitosamente!')
  console.log('Cambios aplicados:')
  console.log('   - Tabla rate_limits (key, count, expires_at, created_at)')
  console.log('   - Índice en expires_at para cleanup eficiente')
}

const verificar = async () => {
  try {
    await query("SELECT 1 FROM rate_limits LIMIT 0")
    console.log('Migración v1.10 ya aplicada, omitiendo.')
    return true
  } catch {
    return false
  }
}

const run = async () => {
  const existe = await verificar()
  if (existe) return
  await migrarV110()
}

export default run

// Ejecutar directamente
import { fileURLToPath } from 'url'
import { normalize } from 'path'
const currentFile = fileURLToPath(import.meta.url)
const executedFile = normalize(process.argv[1])
if (currentFile === executedFile || process.argv[1]?.endsWith('migrate-v1.10.js')) {
  run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
}
