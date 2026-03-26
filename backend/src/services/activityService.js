import { query } from '../config/database.js'
import { logger } from '../utils/logger.js'

export const activityService = {
  async register({ usuarioId, accion, detalles }) {
    try {
      await query(
        'INSERT INTO actividad (usuario_id, accion, detalles) VALUES ($1, $2, $3)',
        [usuarioId, accion, detalles != null ? JSON.stringify(detalles) : null]
      )
    } catch (err) {
      // El fallo de auditoría no debe interrumpir la operación principal
      logger.warn('No se pudo registrar actividad', { accion, message: err.message })
    }
  }
}
