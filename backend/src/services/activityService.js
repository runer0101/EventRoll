import { query } from '../config/database.js'

export const activityService = {
  async register({ usuarioId, accion, detalles }) {
    await query(
      'INSERT INTO actividad (usuario_id, accion, detalles) VALUES ($1, $2, $3)',
      [usuarioId, accion, detalles]
    )
  }
}
