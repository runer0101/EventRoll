import { query } from './database.js'

/**
 * Crea la tabla schema_migrations si no existe.
 * Debe llamarse al inicio de cada script de migración.
 */
export async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    TEXT        PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

/**
 * Retorna true si la versión ya fue aplicada.
 */
export async function isApplied(version) {
  const result = await query(
    'SELECT 1 FROM schema_migrations WHERE version = $1',
    [version]
  )
  return result.rows.length > 0
}

/**
 * Registra la versión como aplicada.
 */
export async function markApplied(version) {
  await query(
    'INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING',
    [version]
  )
}
