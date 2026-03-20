import { query } from '../config/database.js'

export const authRepository = {
  async findUserByEmail(email) {
    const result = await query('SELECT * FROM usuarios WHERE email = $1', [email])
    return result.rows[0] || null
  }
}
