import { query, testConnection } from './database.js'
import { fileURLToPath } from 'url'
import { normalize } from 'path'

const migrarV16 = async () => {
  console.log('Iniciando migración v1.6 - Índices y restricciones de unicidad...\n')

  try {
    const connected = await testConnection()
    if (!connected) throw new Error('No se pudo conectar a la base de datos')

    // 1. Eliminar duplicados antes de crear el constraint UNIQUE
    // Mantiene el registro más reciente de cada par (evento_id, nombre, apellido)
    console.log('Eliminando invitados duplicados (mantiene el más reciente)...')
    const deleted = await query(`
      DELETE FROM invitados
      WHERE id NOT IN (
        SELECT DISTINCT ON (
          COALESCE(evento_id::text, ''),
          LOWER(nombre),
          LOWER(COALESCE(apellido, ''))
        ) id
        FROM invitados
        ORDER BY
          COALESCE(evento_id::text, ''),
          LOWER(nombre),
          LOWER(COALESCE(apellido, '')),
          created_at DESC
      )
    `)
    console.log(`Duplicados eliminados: ${deleted.rowCount}\n`)

    // 2. Índice UNIQUE para prevenir race conditions en creación de invitados
    // NULLS NOT DISTINCT trata todos los NULL como iguales (PostgreSQL 15+)
    console.log('Creando restricción UNIQUE en invitados (evento_id, nombre, apellido)...')
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_invitados_unique_nombre
        ON invitados (
          COALESCE(evento_id::text, ''),
          LOWER(nombre),
          LOWER(COALESCE(apellido, ''))
        )
    `)
    console.log('Restricción UNIQUE creada\n')

    // 3. Índice compuesto (evento_id, confirmado) — filtro más usado en la app
    console.log('Creando índice compuesto (evento_id, confirmado)...')
    await query(`
      CREATE INDEX IF NOT EXISTS idx_invitados_evento_confirmado
        ON invitados(evento_id, confirmado)
    `)
    console.log('Índice compuesto creado\n')

    // 4. Índice en confirmado — usado en estadísticas y filtros globales
    console.log('Creando índice en confirmado...')
    await query(`
      CREATE INDEX IF NOT EXISTS idx_invitados_confirmado
        ON invitados(confirmado)
    `)
    console.log('Índice confirmado creado\n')

    // 5. Índice en apellido — columna principal de ordenamiento
    console.log('Creando índice en apellido...')
    await query(`
      CREATE INDEX IF NOT EXISTS idx_invitados_apellido
        ON invitados(apellido)
    `)
    console.log('Índice apellido creado\n')

    console.log('Migración v1.6 completada exitosamente!')
    console.log('Cambios aplicados:')
    console.log('   - Duplicados eliminados (se conservó el más reciente)')
    console.log('   - UNIQUE INDEX en (evento_id, nombre, apellido)')
    console.log('   - INDEX en (evento_id, confirmado)')
    console.log('   - INDEX en confirmado')
    console.log('   - INDEX en apellido\n')

  } catch (error) {
    console.error('Error durante la migración v1.6:', error)
    throw error
  }
}

const currentFile = fileURLToPath(import.meta.url)
const executedFile = normalize(process.argv[1])

if (currentFile === executedFile || process.argv[1].endsWith('migrate-v1.6.js')) {
  migrarV16()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default migrarV16
