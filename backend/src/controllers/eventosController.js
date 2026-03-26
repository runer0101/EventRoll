import { query } from '../config/database.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getEventos = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT id, nombre, fecha, sillas_totales, created_at
     FROM eventos
     ORDER BY created_at ASC`
  )
  res.json({ success: true, data: rows })
})
