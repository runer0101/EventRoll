import { query } from './database.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { normalize } from 'path'

const seedDatabase = async () => {
  console.log('Iniciando seed de base de datos...\n')

  try {
    // 1. Crear usuario admin por defecto
    console.log('Creando usuario admin...')
    // Usar DEFAULT_ADMIN_PASSWORD si está definido, sino generar uno aleatorio en desarrollo
    const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || null
    let adminPassword = DEFAULT_ADMIN_PASSWORD
    if (!adminPassword) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('DEFAULT_ADMIN_PASSWORD es requerido en producción. Defínelo en las variables de entorno.')
      }
      adminPassword = crypto.randomBytes(16).toString('base64')
    }
    const passwordHash = await bcrypt.hash(adminPassword, 12)

    // En producción, nunca sobreescribir contraseña existente del admin
    let adminResult
    if (process.env.NODE_ENV === 'production') {
      adminResult = await query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET
           nombre = EXCLUDED.nombre,
           rol = EXCLUDED.rol
         RETURNING id`,
        ['Administrador', 'admin@prueba.com', passwordHash, 'admin']
      )
      console.warn('⚠️  PRODUCCIÓN: contraseña del admin NO fue modificada (registro existente)')
    } else {
      adminResult = await query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET
           nombre = EXCLUDED.nombre,
           password_hash = EXCLUDED.password_hash,
           rol = EXCLUDED.rol
         RETURNING id`,
        ['Administrador', 'admin@prueba.com', passwordHash, 'admin']
      )
    }
    const adminId = adminResult.rows[0].id
    console.log(`Usuario admin creado/actualizado (ID: ${adminId})\n`)

    // 2. Crear usuarios de ejemplo
    console.log('Creando usuarios de ejemplo...')
    const usuarios = [
      { nombre: 'Juan Organizador', email: 'juan@prueba', rol: 'organizador' },
      { nombre: 'María Asistente', email: 'maria@prueba', rol: 'asistente' },
      { nombre: 'Pedro Guardia', email: 'pedro@prueba', rol: 'guardia' }
    ]

    for (const usuario of usuarios) {
      const hash = await bcrypt.hash(adminPassword, 12)
      await query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [usuario.nombre, usuario.email, hash, usuario.rol]
      )
    }
    console.log(`${usuarios.length} usuarios de ejemplo creados\n`)

    // 3. Crear evento de ejemplo
    console.log('Creando evento de ejemplo...')
    const eventoResult = await query(
      `INSERT INTO eventos (nombre, fecha, sillas_totales, creado_por)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['Boda de Ejemplo', '2026-06-15', 150, adminId]
    )
    const eventoId = eventoResult.rows[0].id
    console.log(`Evento creado (ID: ${eventoId})\n`)

    // 4. Crear invitados de ejemplo
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
         VALUES ($1, $2, $3, $4, $5)`,
        [eventoId, invitado.nombre, invitado.apellido, invitado.categoria, invitado.confirmado]
      )
    }
    console.log(`${invitados.length} invitados de ejemplo creados\n`)

    // 5. Crear actividad de ejemplo
    console.log('Creando actividad de ejemplo...')
    await query(
      `INSERT INTO actividad (usuario_id, accion, detalles)
       VALUES ($1, $2, $3)`,
      [adminId, 'Seed de base de datos', { mensaje: 'Base de datos inicializada con datos de ejemplo' }]
    )
    console.log('Actividad creada\n')

    console.log('Seed completado exitosamente')
    if (process.env.NODE_ENV === 'development') {
      console.log('\nCredenciales de prueba (desarrollo):')
      console.log('   Email: admin@prueba.com')
      console.log('   Password: [GUARDADA EN VARIABLE DE ENTORNO]')
      console.log('   Usa DEFAULT_ADMIN_PASSWORD del .env o ejecuta: npm run cambiar-password')
      console.log('   Rol: admin\n')
    } else {
      console.log('\nCredenciales: define DEFAULT_ADMIN_PASSWORD en tu .env o ejecuta cambiar-password script\n')
    }

  } catch (error) {
    console.error('Error durante el seed:', error)
    throw error
  }
}

// Ejecutar seed si se ejecuta directamente
// Normalizar rutas para Windows
const currentFile = fileURLToPath(import.meta.url)
const executedFile = normalize(process.argv[1])

if (currentFile === executedFile || process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default seedDatabase
