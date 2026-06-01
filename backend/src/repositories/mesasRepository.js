import { query } from '../config/database.js'

export const mesasRepository = {
  async findByEvento(eventoId) {
    const result = await query(
      `SELECT m.*, COALESCE(
        json_agg(
          json_build_object(
            'id', a.id,
            'posicion', a.posicion,
            'invitado_id', a.invitado_id,
            'invitado_nombre', i.nombre,
            'invitado_apellido', i.apellido,
            'invitado_categoria', i.categoria,
            'invitado_confirmado', i.confirmado
          ) ORDER BY a.posicion
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'
      ) AS asignaciones
      FROM mesas m
      LEFT JOIN asignaciones a ON a.mesa_id = m.id
      LEFT JOIN invitados i ON i.id = a.invitado_id
      WHERE m.evento_id = $1
      GROUP BY m.id
      ORDER BY m.nombre`,
      [eventoId]
    )
    return result.rows
  },

  async findById(id) {
    const result = await query('SELECT * FROM mesas WHERE id = $1', [id])
    return result.rows[0] || null
  },

  async create({ evento_id, nombre, sillas = 8, pos_x = 0, pos_y = 0 }) {
    const result = await query(
      `INSERT INTO mesas (evento_id, nombre, sillas, pos_x, pos_y)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [evento_id, nombre, sillas, pos_x, pos_y]
    )
    return result.rows[0]
  },

  async updateById(id, fields) {
    const updates = []
    const values = []
    let paramCount = 1

    const allowedFields = ['nombre', 'sillas', 'pos_x', 'pos_y']
    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`)
        values.push(fields[field])
        paramCount++
      }
    }

    if (updates.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE mesas SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    )
    return result.rows[0] || null
  },

  async deleteById(id) {
    const result = await query('DELETE FROM mesas WHERE id = $1 RETURNING *', [id])
    return result.rows[0] || null
  },

  async asignarInvitado(mesaId, invitadoId, posicion) {
    const result = await query(
      `INSERT INTO asignaciones (mesa_id, invitado_id, posicion)
       VALUES ($1, $2, $3)
       ON CONFLICT (invitado_id) DO UPDATE SET mesa_id = $1, posicion = $3
       RETURNING *`,
      [mesaId, invitadoId, posicion]
    )
    return result.rows[0]
  },

  async desasignarInvitado(invitadoId) {
    const result = await query(
      'DELETE FROM asignaciones WHERE invitado_id = $1 RETURNING *',
      [invitadoId]
    )
    return result.rows[0] || null
  },

  async getInvitadosSinMesa(eventoId) {
    const result = await query(
      `SELECT i.* FROM invitados i
       WHERE i.evento_id IS NOT DISTINCT FROM $1
       AND i.id NOT IN (SELECT invitado_id FROM asignaciones)
       ORDER BY i.apellido, i.nombre`,
      [eventoId]
    )
    return result.rows
  }
}
