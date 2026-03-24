import { query } from '../config/database.js'

export const usuariosRepository = {
  async findAll() {
    const result = await query(
      'SELECT id, nombre, email, rol, permisos, access_code, created_at FROM usuarios ORDER BY created_at DESC'
    )
    return result.rows
  },

  async findById(id) {
    const result = await query(
      'SELECT id, nombre, email, rol, permisos, access_code, access_code_expires_at, created_at, updated_at FROM usuarios WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  },

  async findByEmail(email) {
    const result = await query(
      'SELECT id, nombre, email, rol, permisos, access_code, access_code_expires_at, created_at, updated_at FROM usuarios WHERE email = $1',
      [email]
    )
    return result.rows[0] || null
  },

  async findByEmailExcludingId(email, id) {
    const result = await query(
      'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
      [email, id]
    )
    return result.rows[0] || null
  },

  async create({ nombre, email, passwordHash, rol, permisos }) {
    const result = await query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol, permisos)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, email, rol, permisos, created_at`,
      [nombre, email, passwordHash, rol, JSON.stringify(permisos)]
    )

    return result.rows[0]
  },

  async updateById(id, fields) {
    const updates = []
    const values = []
    let paramCount = 1

    if (fields.nombre !== undefined) {
      updates.push(`nombre = $${paramCount}`)
      values.push(fields.nombre)
      paramCount++
    }

    if (fields.email !== undefined) {
      updates.push(`email = $${paramCount}`)
      values.push(fields.email)
      paramCount++
    }

    if (fields.passwordHash !== undefined) {
      updates.push(`password_hash = $${paramCount}`)
      values.push(fields.passwordHash)
      paramCount++
    }

    if (fields.rol !== undefined) {
      updates.push(`rol = $${paramCount}`)
      values.push(fields.rol)
      paramCount++
    }

    if (fields.permisos !== undefined) {
      updates.push(`permisos = $${paramCount}`)
      values.push(JSON.stringify(fields.permisos))
      paramCount++
    }

    if (updates.length === 0) {
      return null
    }

    values.push(id)

    const result = await query(
      `UPDATE usuarios SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, nombre, email, rol, permisos, created_at, updated_at`,
      values
    )

    return result.rows[0] || null
  },

  async deleteById(id) {
    await query('DELETE FROM usuarios WHERE id = $1', [id])
  },

  async findByAccessCode(code) {
    const result = await query(
      `SELECT id, nombre, email, rol FROM usuarios
       WHERE access_code = $1
         AND (access_code_expires_at IS NULL OR access_code_expires_at > NOW())`,
      [code]
    )
    return result.rows[0] || null
  },

  async setAccessCode(id, code) {
    const result = await query(
      `UPDATE usuarios
       SET access_code = $1, access_code_expires_at = NOW() + INTERVAL '30 days'
       WHERE id = $2
       RETURNING id, nombre, email, rol, access_code, access_code_expires_at`,
      [code, id]
    )
    return result.rows[0] || null
  },

  async clearAccessCode(id) {
    const result = await query(
      'UPDATE usuarios SET access_code = NULL, access_code_expires_at = NULL WHERE id = $1 RETURNING id',
      [id]
    )
    return result.rows[0] || null
  }
}
