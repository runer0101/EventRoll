import { query, testConnection } from './database.js'
import { fileURLToPath } from 'url'
import { normalize } from 'path'
import { ensureMigrationsTable, isApplied, markApplied } from './migrationHelper.js'

const migrarV17 = async () => {
  console.log('Iniciando migración v1.7 - Blacklist persistente de tokens...\n')

  try {
    const connected = await testConnection()
    if (!connected) throw new Error('No se pudo conectar a la base de datos')

    await ensureMigrationsTable()

    if (await isApplied('v1.7')) {
      console.log('Migración v1.7 ya aplicada, omitiendo.\n')
      return
    }

    // Tabla para blacklist persistente de JWT revocados (logout real)
    console.log('Creando tabla revoked_tokens...')
    await query(`
      CREATE TABLE IF NOT EXISTS revoked_tokens (
        jti        TEXT        PRIMARY KEY,
        expires_at TIMESTAMPTZ NOT NULL
      )
    `)

    // Índice para que la limpieza de tokens expirados sea eficiente
    await query(`
      CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires
        ON revoked_tokens(expires_at)
    `)
    console.log('Tabla revoked_tokens creada\n')

    await markApplied('v1.7')

    console.log('Migración v1.7 completada exitosamente!')
    console.log('Cambios aplicados:')
    console.log('   - Tabla revoked_tokens (jti TEXT PK, expires_at TIMESTAMPTZ)')
    console.log('   - INDEX idx_revoked_tokens_expires para limpieza eficiente\n')

  } catch (error) {
    console.error('Error durante la migración v1.7:', error)
    throw error
  }
}

const currentFile = fileURLToPath(import.meta.url)
const executedFile = normalize(process.argv[1])

if (currentFile === executedFile || process.argv[1].endsWith('migrate-v1.7.js')) {
  migrarV17()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default migrarV17
