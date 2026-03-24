import { query, testConnection } from './database.js'
import { fileURLToPath } from 'url'
import { normalize } from 'path'
import { ensureMigrationsTable, isApplied, markApplied } from './migrationHelper.js'

/**
 * Migración v1.4.0
 * - Agrega columna 'permisos' (JSONB) a tabla usuarios
 * - Agrega columna 'asistio' (BOOLEAN) a tabla invitados
 */

const migrateV14 = async () => {
  console.log('Ejecutando migración v1.4.0...\n')

  try {
    const connected = await testConnection()
    if (!connected) throw new Error('No se pudo conectar a la base de datos')

    await ensureMigrationsTable()

    if (await isApplied('v1.4')) {
      console.log('Migración v1.4 ya aplicada, omitiendo.\n')
      return
    }

    // 1. Agregar columna 'permisos' a usuarios (si no existe)
    console.log('Agregando columna permisos a usuarios...')
    await query(`
      ALTER TABLE usuarios
      ADD COLUMN IF NOT EXISTS permisos JSONB DEFAULT '{
        "ver_invitados": true,
        "crear_invitados": true,
        "editar_invitados": true,
        "eliminar_invitados": false,
        "importar_excel": false,
        "exportar_excel": true,
        "confirmar_asistencia": true,
        "marcar_asistencia": true
      }'::jsonb
    `)
    console.log('Columna permisos agregada\n')

    // 2. Actualizar permisos por defecto según rol para usuarios existentes
    console.log('Actualizando permisos por defecto según rol...')

    // Admin: todos los permisos
    await query(`
      UPDATE usuarios
      SET permisos = '{
        "ver_invitados": true,
        "crear_invitados": true,
        "editar_invitados": true,
        "eliminar_invitados": true,
        "importar_excel": true,
        "exportar_excel": true,
        "confirmar_asistencia": true,
        "marcar_asistencia": true
      }'::jsonb
      WHERE rol = 'admin' AND permisos IS NULL
    `)

    // Organizador: todos menos eliminar
    await query(`
      UPDATE usuarios
      SET permisos = '{
        "ver_invitados": true,
        "crear_invitados": true,
        "editar_invitados": true,
        "eliminar_invitados": false,
        "importar_excel": true,
        "exportar_excel": true,
        "confirmar_asistencia": true,
        "marcar_asistencia": true
      }'::jsonb
      WHERE rol = 'organizador' AND permisos IS NULL
    `)

    // Asistente: ver, editar y exportar
    await query(`
      UPDATE usuarios
      SET permisos = '{
        "ver_invitados": true,
        "crear_invitados": false,
        "editar_invitados": true,
        "eliminar_invitados": false,
        "importar_excel": false,
        "exportar_excel": true,
        "confirmar_asistencia": true,
        "marcar_asistencia": true
      }'::jsonb
      WHERE rol = 'asistente' AND permisos IS NULL
    `)

    // Guardia: solo ver y marcar asistencia
    await query(`
      UPDATE usuarios
      SET permisos = '{
        "ver_invitados": true,
        "crear_invitados": false,
        "editar_invitados": false,
        "eliminar_invitados": false,
        "importar_excel": false,
        "exportar_excel": false,
        "confirmar_asistencia": true,
        "marcar_asistencia": true
      }'::jsonb
      WHERE rol = 'guardia' AND permisos IS NULL
    `)
    console.log('Permisos por defecto actualizados\n')

    // 3. Agregar columna 'asistio' a invitados (si no existe)
    console.log('Agregando columna asistio a invitados...')
    await query(`
      ALTER TABLE invitados
      ADD COLUMN IF NOT EXISTS asistio BOOLEAN DEFAULT FALSE
    `)
    console.log('Columna asistio agregada\n')

    // 4. Agregar columna 'fecha_asistencia' a invitados (si no existe)
    console.log('Agregando columna fecha_asistencia a invitados...')
    await query(`
      ALTER TABLE invitados
      ADD COLUMN IF NOT EXISTS fecha_asistencia TIMESTAMP
    `)
    console.log('Columna fecha_asistencia agregada\n')

    // 5. Crear índice para asistencia
    console.log('Creando índices...')
    await query(`CREATE INDEX IF NOT EXISTS idx_invitados_asistio ON invitados(asistio)`)
    console.log('Índices creados\n')

    await markApplied('v1.4')

    console.log('Migración v1.4.0 completada exitosamente!\n')
    console.log('Cambios aplicados:')
    console.log('   - Tabla usuarios: columna permisos (JSONB) agregada')
    console.log('   - Tabla invitados: columna asistio (BOOLEAN) agregada')
    console.log('   - Tabla invitados: columna fecha_asistencia (TIMESTAMP) agregada')
    console.log('   - Permisos por defecto configurados según rol')
    console.log('')

  } catch (error) {
    console.error('Error durante la migración:', error)
    throw error
  }
}

const currentFile = fileURLToPath(import.meta.url)
const executedFile = normalize(process.argv[1])

if (currentFile === executedFile || process.argv[1].endsWith('migrate-v1.4.js')) {
  migrateV14()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default migrateV14
