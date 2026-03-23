import { query } from '../config/database.js'

const buildFilters = ({ evento_id, categoria, confirmado, search }) => {
  let whereClause = 'WHERE 1=1'
  const params = []
  let paramCount = 1

  if (evento_id) {
    whereClause += ` AND evento_id = $${paramCount}`
    params.push(evento_id)
    paramCount++
  }

  if (categoria) {
    whereClause += ` AND categoria = $${paramCount}`
    params.push(categoria)
    paramCount++
  }

  if (confirmado !== undefined) {
    whereClause += ` AND confirmado = $${paramCount}`
    params.push(confirmado === true || confirmado === 'true')
    paramCount++
  }

  if (search) {
    whereClause += ` AND (nombre ILIKE $${paramCount} OR apellido ILIKE $${paramCount + 1})`
    params.push(`%${search}%`, `%${search}%`)
    paramCount += 2
  }

  return { whereClause, params, paramCount }
}

export const invitadosRepository = {
  async findAllPaginated(filters, pagination) {
    const { whereClause, params, paramCount } = buildFilters(filters)

    // Whitelist explícita para sortDir — previene inyección SQL en ORDER BY
    const safeSortDir = pagination.sortDir?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'

    const countResult = await query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE confirmado = true) AS confirmados,
         COUNT(*) FILTER (WHERE confirmado = false) AS pendientes
       FROM invitados ${whereClause}`,
      params
    )

    const dataResult = await query(
      `SELECT * FROM invitados ${whereClause}
       ORDER BY apellido ${safeSortDir}, nombre ${safeSortDir}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, pagination.limit, pagination.offset]
    )

    return {
      rows: dataResult.rows,
      counters: countResult.rows[0]
    }
  },

  async findById(id) {
    const result = await query('SELECT * FROM invitados WHERE id = $1', [id])
    return result.rows[0] || null
  },

  async findDuplicate({ eventoId, nombre, apellido = '' }) {
    const result = await query(
      "SELECT id FROM invitados WHERE evento_id IS NOT DISTINCT FROM $1 AND LOWER(nombre) = LOWER($2) AND LOWER(COALESCE(apellido, '')) = LOWER($3)",
      [eventoId ?? null, nombre, apellido]
    )
    return result.rows[0] || null
  },

  async create({ evento_id, nombre, apellido, categoria, confirmado }) {
    const result = await query(
      `INSERT INTO invitados (evento_id, nombre, apellido, categoria, confirmado)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [evento_id ?? null, nombre, apellido ?? null, categoria ?? 'General', Boolean(confirmado)]
    )

    return result.rows[0] || null
  },

  async batchCreate(invitados) {
    if (invitados.length === 0) return { insertados: [], duplicados: 0 }

    const valuePlaceholders = []
    const params = []

    invitados.forEach((inv, i) => {
      const base = i * 5
      valuePlaceholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`)
      params.push(
        inv.evento_id ?? null,
        inv.nombre,
        inv.apellido ?? null,
        inv.categoria ?? 'General',
        Boolean(inv.confirmado)
      )
    })

    const result = await query(
      `INSERT INTO invitados (evento_id, nombre, apellido, categoria, confirmado)
       VALUES ${valuePlaceholders.join(', ')}
       ON CONFLICT DO NOTHING
       RETURNING *`,
      params
    )

    return {
      insertados: result.rows,
      duplicados: invitados.length - result.rows.length
    }
  },

  async updateById(id, fields) {
    const updates = []
    const values = []
    let paramCount = 1

    const allowedFields = ['nombre', 'apellido', 'categoria', 'confirmado']

    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`)
        values.push(fields[field])
        paramCount++
      }
    }

    if (updates.length === 0) {
      return null
    }

    values.push(id)

    const result = await query(
      `UPDATE invitados SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    )

    return result.rows[0] || null
  },

  async deleteById(id) {
    await query('DELETE FROM invitados WHERE id = $1', [id])
  }
}
