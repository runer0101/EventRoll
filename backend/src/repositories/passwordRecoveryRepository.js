import { getClient, query } from '../config/database.js'

export const passwordRecoveryRepository = {
  getClient,

  async findUserByEmail(email) {
    const result = await query(
      'SELECT id, nombre, email FROM usuarios WHERE email = $1',
      [email]
    )
    return result.rows[0] || null
  },

  async createRecoveryCode(usuarioId, codigo, expiraEn) {
    await query(
      `INSERT INTO password_recovery_codes (usuario_id, codigo, expira_en)
       VALUES ($1, $2, $3)`,
      [usuarioId, codigo, expiraEn]
    )
  },

  async getBackupClientEmail() {
    const result = await query("SELECT valor FROM email_config WHERE clave = 'email_cliente_backup'")
    return result.rows.length > 0 ? result.rows[0].valor : null
  },

  async findLatestRecoveryCodeForUser(usuarioId, codigo) {
    const result = await query(
      `SELECT id, usado, expira_en
       FROM password_recovery_codes
       WHERE usuario_id = $1 AND codigo = $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [usuarioId, codigo]
    )

    return result.rows[0] || null
  },

  async consumeValidRecoveryCode(client, email, codigo) {
    const result = await client.query(
      `WITH codigo_valido AS (
         SELECT prc.id, prc.usuario_id
         FROM password_recovery_codes prc
         INNER JOIN usuarios u ON u.id = prc.usuario_id
         WHERE u.email = $1
           AND prc.codigo = $2
           AND prc.usado = FALSE
           AND prc.expira_en > NOW()
         ORDER BY prc.created_at DESC
         LIMIT 1
         FOR UPDATE SKIP LOCKED
       )
       UPDATE password_recovery_codes prc
       SET usado = TRUE,
           updated_at = NOW()
       FROM codigo_valido cv
       WHERE prc.id = cv.id
       RETURNING cv.usuario_id, prc.id`,
      [email, codigo]
    )

    return result.rows[0] || null
  },

  async updateUserPassword(client, usuarioId, passwordHash) {
    await client.query(
      'UPDATE usuarios SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, usuarioId]
    )
  },

  async registerActivityWithClient(client, usuarioId, accion, detalles) {
    await client.query(
      `INSERT INTO actividad (usuario_id, accion, detalles)
       VALUES ($1, $2, $3)`,
      [usuarioId, accion, detalles]
    )
  },

  async upsertBackupClientEmail(email) {
    await query(
      `INSERT INTO email_config (clave, valor, descripcion)
       VALUES ('email_cliente_backup', $1, 'Email del cliente que recibe copia')
       ON CONFLICT (clave) DO UPDATE SET
         valor = EXCLUDED.valor,
         updated_at = NOW()`,
      [email || '']
    )
  }
}
