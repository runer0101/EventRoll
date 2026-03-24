import { query } from '../config/database.js'

export const authRepository = {
  async findUserByEmail(email) {
    const result = await query('SELECT * FROM usuarios WHERE email = $1', [email])
    return result.rows[0] || null
  },

  async findUserById(id) {
    const result = await query(
      'SELECT id, nombre, email, rol, permisos, access_code, access_code_expires_at FROM usuarios WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  },

  async invalidateAccessCode(userId) {
    await query(
      'UPDATE usuarios SET access_code = NULL, access_code_expires_at = NULL WHERE id = $1',
      [userId]
    )
  }
}
