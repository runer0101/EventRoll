import { query } from './database.js'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import { normalize } from 'path'

// Credenciales fijas para demo pública
const DEMO_EMAIL = 'arch'
const DEMO_PASSWORD = 'arch'

const seedDatabase = async () => {
  console.log('Iniciando seed de base de datos...\n')

  try {
    // 1. Crear usuario admin con credenciales fijas
    console.log('Creando usuario admin...')
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)

    const adminResult = await query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET
         nombre = EXCLUDED.nombre,
         password_hash = EXCLUDED.password_hash,
         rol = EXCLUDED.rol
       RETURNING id`,
      ['Administrador', DEMO_EMAIL, passwordHash, 'admin']
    )
    const adminId = adminResult.rows[0].id
    console.log(`Usuario admin creado/actualizado (ID: ${adminId})\n`)

    // 2. Crear evento de ejemplo
    console.log('Creando evento de ejemplo...')
    const eventoResult = await query(
      `INSERT INTO eventos (nombre, fecha, sillas_totales, creado_por)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ['Boda de Ejemplo', '2026-06-15', 150, adminId]
    )

    if (eventoResult.rows.length > 0) {
      const eventoId = eventoResult.rows[0].id
      console.log(`Evento creado (ID: ${eventoId})\n`)

      // 3. Crear invitados de ejemplo
      console.log('Creando invitados de ejemplo...')
      const invitados = [
        { nombre: 'Carlos', apellido: 'García', categoria: 'VIP', confirmado: true },
        { nombre: 'Ana', apellido: 'Martínez', categoria: 'Familia', confirmado: true },
        { nombre: 'Luis', apellido: 'Rodríguez', categoria: 'Amigos', confirmado: false },
        { nombre: 'Elena', apellido: 'López', categoria: 'Trabajo', confirmado: true },
        { nombre: 'Miguel', apellido: 'Sánchez', categoria: 'General', confirmado: false },
        { nombre: 'Sofia', apellido: 'Fernández', categoria: 'VIP', confirmado: true },
        { nombre: 'David', apellido: 'Torres', categoria: 'Familia', confirmado: true },
        { nombre: 'Laura', apellido: 'Ramírez', categoria: 'Amigos', confirmado: false }
      ]

      for (const invitado of invitados) {
        await query(
          `INSERT INTO invitados (evento_id, nombre, apellido, categoria, confirmado)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [eventoId, invitado.nombre, invitado.apellido, invitado.categoria, invitado.confirmado]
        )
      }
      console.log(`${invitados.length} invitados de ejemplo creados\n`)
    } else {
      console.log('Evento ya existe, omitiendo invitados\n')
    }

    console.log('=== DEMO PUBLICA ===')
    console.log(`Email:    ${DEMO_EMAIL}`)
    console.log(`Password: ${DEMO_PASSWORD}`)
    console.log('====================\n')

  } catch (error) {
    console.error('Error durante el seed:', error)
    throw error
  }
}

// Ejecutar seed si se ejecuta directamente
const currentFile = fileURLToPath(import.meta.url)
const executedFile = normalize(process.argv[1])

if (currentFile === executedFile || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default seedDatabase
