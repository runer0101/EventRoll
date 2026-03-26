import { query, testConnection } from './database.js'
import { fileURLToPath } from 'url'
import { normalize } from 'path'
import { ensureMigrationsTable, isApplied, markApplied } from './migrationHelper.js'

const migrarV18 = async () => {
  console.log('Iniciando migración v1.8 - Rol visualizador y limpieza de access_code...\n')

  try {
    const connected = await testConnection()
    if (!connected) throw new Error('No se pudo conectar a la base de datos')

    await ensureMigrationsTable()

    if (await isApplied('v1.8')) {
      console.log('Migración v1.8 ya aplicada, omitiendo.\n')
      return
    }

    // 1. Ampliar el CHECK constraint de usuarios.rol para incluir 'visualizador'
    console.log('Actualizando CHECK constraint de usuarios.rol...')
    await query(`ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check`)
    await query(`
      ALTER TABLE usuarios
        ADD CONSTRAINT usuarios_rol_check
        CHECK (rol IN ('admin', 'organizador', 'asistente', 'guardia', 'visualizador'))
    `)
    console.log('CHECK constraint actualizado\n')

    // 2. Índice en access_code_expires_at para limpieza eficiente de códigos expirados
    console.log('Creando índice en access_code_expires_at...')
    await query(`
      CREATE INDEX IF NOT EXISTS idx_usuarios_access_code_expires
        ON usuarios(access_code_expires_at)
        WHERE access_code_expires_at IS NOT NULL
    `)
    console.log('Índice creado\n')

    await markApplied('v1.8')

    console.log('Migración v1.8 completada exitosamente!')
    console.log('Cambios aplicados:')
    console.log('   - CHECK constraint de rol actualizado (incluye visualizador)')
    console.log('   - INDEX parcial en access_code_expires_at\n')

  } catch (error) {
    console.error('Error durante la migración v1.8:', error)
    throw error
  }
}

const currentFile = fileURLToPath(import.meta.url)
const executedFile = normalize(process.argv[1])

if (currentFile === executedFile || process.argv[1].endsWith('migrate-v1.8.js')) {
  migrarV18()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default migrarV18
