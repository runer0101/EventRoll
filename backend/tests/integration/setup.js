import bcrypt from 'bcryptjs'
import { query } from '../../src/config/database.js'

export const TEST_USER = {
  nombre: 'Test Admin',
  email: 'test.admin@integration.test',
  password: 'TestPass123!',
  rol: 'admin',
}

export const TEST_ORGANIZER = {
  nombre: 'Test Organizer',
  email: 'test.organizer@integration.test',
  password: 'TestPass123!',
  rol: 'organizador',
}

/** Inserta un usuario de prueba y retorna su id */
export const createTestUser = async (user = TEST_USER) => {
  const hash = await bcrypt.hash(user.password, 10)
  const result = await query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol, permisos)
     VALUES ($1, $2, $3, $4, NULL)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, permisos = NULL
     RETURNING id`,
    [user.nombre, user.email, hash, user.rol]
  )
  return result.rows[0].id
}

/** Inserta un evento de prueba y retorna su id */
export const createTestEvento = async (createdBy) => {
  const result = await query(
    `INSERT INTO eventos (nombre, fecha, sillas_totales, creado_por)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    ['Evento Test', '2026-12-31', 100, createdBy]
  )
  return result.rows[0].id
}

/** Elimina todos los datos creados por los tests */
export const cleanupTestData = async () => {
  await query(`DELETE FROM invitados WHERE nombre LIKE 'Test Invitado%'`)
  await query(`DELETE FROM actividad WHERE usuario_id IN (
    SELECT id FROM usuarios WHERE email LIKE '%@integration.test'
  )`)
  await query(`DELETE FROM eventos WHERE nombre = 'Evento Test'`)
  await query(`DELETE FROM usuarios WHERE email LIKE '%@integration.test'`)
}
