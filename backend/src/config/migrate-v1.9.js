/**
 * Migración v1.9.0 — Plano de Mesas
 * Agrega tablas mesas y asignaciones para el plano visual de invitados.
 */
import { query } from '../config/database.js'

const migrarV19 = async () => {
  console.log('\nIniciando migración v1.9 - Plano de Mesas...\n')

  console.log('Creando tabla mesas...')
  await query(`
    CREATE TABLE IF NOT EXISTS mesas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
      nombre VARCHAR(50) NOT NULL,
      sillas INTEGER NOT NULL DEFAULT 8 CHECK (sillas >= 2 AND sillas <= 20),
      pos_x FLOAT NOT NULL DEFAULT 0,
      pos_y FLOAT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('Tabla mesas creada')

  console.log('Creando tabla asignaciones...')
  await query(`
    CREATE TABLE IF NOT EXISTS asignaciones (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      mesa_id UUID NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
      invitado_id UUID NOT NULL REFERENCES invitados(id) ON DELETE CASCADE,
      posicion INTEGER NOT NULL CHECK (posicion >= 1 AND posicion <= 20),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(mesa_id, posicion),
      UNIQUE(invitado_id)
    )
  `)
  console.log('Tabla asignaciones creada')

  console.log('Creando índices...')
  await query(`CREATE INDEX IF NOT EXISTS idx_mesas_evento ON mesas(evento_id)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_asignaciones_mesa ON asignaciones(mesa_id)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_asignaciones_invitado ON asignaciones(invitado_id)`)
  console.log('Índices creados')

  console.log('\nMigración v1.9 completada exitosamente!')
  console.log('Cambios aplicados:')
  console.log('   - Tabla mesas (id, evento_id, nombre, sillas, pos_x, pos_y)')
  console.log('   - Tabla asignaciones (id, mesa_id, invitado_id, posicion)')
  console.log('   - Constraints UNIQUE en asignaciones por mesa+posicion y por invitado')
}

const verificar = async () => {
  try {
    await query("SELECT 1 FROM mesas LIMIT 0")
    console.log('Migración v1.9 ya aplicada, omitiendo.')
    return true
  } catch {
    return false
  }
}

const run = async () => {
  const existe = await verificar()
  if (existe) return
  await migrarV19()
}

export default run

// Ejecutar directamente
import { fileURLToPath } from 'url'
import { normalize } from 'path'
const currentFile = fileURLToPath(import.meta.url)
const executedFile = normalize(process.argv[1])
if (currentFile === executedFile || process.argv[1]?.endsWith('migrate-v1.9.js')) {
  run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
}
