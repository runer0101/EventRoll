/**
 * Orquestador de migraciones — ejecuta todas las migraciones en orden.
 * Cada migración es idempotente: si ya fue aplicada se omite automáticamente.
 *
 * Orden: v1.0 (base) → v1.4 → v1.5 → v1.6 → v1.7
 */

import createTables from './migrate.js'
import migrateV14 from './migrate-v1.4.js'
import migrarRecuperacionPassword from './migrate-v1.5.js'
import migrarV16 from './migrate-v1.6.js'
import migrarV17 from './migrate-v1.7.js'

const runAllMigrations = async () => {
  console.log('═══════════════════════════════════════════════')
  console.log('  EventRoll — Migraciones completas            ')
  console.log('═══════════════════════════════════════════════\n')

  await createTables()
  await migrateV14()
  await migrarRecuperacionPassword()
  await migrarV16()
  await migrarV17()

  console.log('\n═══════════════════════════════════════════════')
  console.log('  Todas las migraciones completadas            ')
  console.log('═══════════════════════════════════════════════')
}

runAllMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error ejecutando migraciones:', error)
    process.exit(1)
  })
