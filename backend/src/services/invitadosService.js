import { invitadosRepository } from '../repositories/invitadosRepository.js'
import { activityService } from './activityService.js'
import { badRequest, notFoundError } from '../core/errors/AppError.js'

const CATEGORIAS_VALIDAS = ['General', 'VIP', 'Familia', 'Amigos', 'Trabajo']

const parsePagination = ({ page = 1, limit = 50, order = 'asc' }) => {
  const pageNum = Math.max(1, parseInt(page, 10))
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)))

  return {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
    sortDir: order === 'desc' ? 'DESC' : 'ASC'
  }
}

const validateCategoria = (categoria) => {
  if (categoria !== undefined && !CATEGORIAS_VALIDAS.includes(categoria)) {
    throw badRequest('Categoría inválida')
  }
}

export const invitadosService = {
  async getInvitados(filters) {
    const pagination = parsePagination(filters)
    const { rows, counters } = await invitadosRepository.findAllPaginated(filters, pagination)

    const total = Number(counters.total || 0)
    const totalPages = total === 0 ? 0 : Math.ceil(total / pagination.limit)

    return {
      data: rows,
      pagination: {
        total,
        confirmados: Number(counters.confirmados || 0),
        pendientes: Number(counters.pendientes || 0),
        page: pagination.page,
        limit: pagination.limit,
        totalPages
      }
    }
  },

  async createInvitado(payload, actorId) {
    const { nombre, apellido, categoria } = payload

    validateCategoria(categoria)

    // La restricción UNIQUE de BD previene duplicados incluso bajo concurrencia
    const invitado = await invitadosRepository.create(payload)

    if (!invitado) {
      throw badRequest('Ya existe un invitado con ese nombre y apellido')
    }

    await activityService.register({
      usuarioId: actorId,
      accion: 'Creó invitado',
      detalles: { nombre, apellido }
    })

    return invitado
  },

  async updateInvitado(id, payload, actorId) {
    const existingInvitado = await invitadosRepository.findById(id)

    if (!existingInvitado) {
      throw notFoundError('Invitado no encontrado')
    }

    validateCategoria(payload.categoria)

    const hasFieldsToUpdate = ['nombre', 'apellido', 'categoria', 'confirmado']
      .some((field) => payload[field] !== undefined)

    if (!hasFieldsToUpdate) {
      throw badRequest('No hay campos para actualizar')
    }

    const updated = await invitadosRepository.updateById(id, payload)

    if (!updated) {
      throw notFoundError('Invitado no encontrado')
    }

    await activityService.register({
      usuarioId: actorId,
      accion: 'Actualizó invitado',
      detalles: { invitado: updated.nombre }
    })

    return updated
  },

  async deleteInvitado(id, actorId) {
    const existingInvitado = await invitadosRepository.findById(id)

    if (!existingInvitado) {
      throw notFoundError('Invitado no encontrado')
    }

    await invitadosRepository.deleteById(id)

    await activityService.register({
      usuarioId: actorId,
      accion: 'Eliminó invitado',
      detalles: {
        nombre: existingInvitado.nombre,
        apellido: existingInvitado.apellido
      }
    })
  },

  async importInvitados({ evento_id, invitados }, actorId) {
    if (!Array.isArray(invitados) || invitados.length === 0) {
      throw badRequest('Se requiere un array de invitados')
    }

    const errores = []
    const validos = []

    // Validar todos los items primero sin tocar la BD
    for (const inv of invitados) {
      if (!inv.nombre) {
        errores.push({ invitado: inv, error: 'Falta el nombre' })
        continue
      }
      const cat = inv.categoria || 'General'
      if (!CATEGORIAS_VALIDAS.includes(cat)) {
        errores.push({ invitado: inv, error: `Categoría inválida: ${cat}` })
        continue
      }
      validos.push({
        evento_id: evento_id || null,
        nombre: inv.nombre,
        apellido: inv.apellido || null,
        categoria: cat,
        confirmado: Boolean(inv.confirmado)
      })
    }

    // Batch insert: un solo query por cada lote de 500
    // ON CONFLICT DO NOTHING maneja duplicados atómicamente (sin race condition)
    const BATCH_SIZE = 500
    let importados = 0
    let duplicados = 0

    for (let i = 0; i < validos.length; i += BATCH_SIZE) {
      const lote = validos.slice(i, i + BATCH_SIZE)
      const resultado = await invitadosRepository.batchCreate(lote)
      importados += resultado.insertados.length
      duplicados += resultado.duplicados
    }

    await activityService.register({
      usuarioId: actorId,
      accion: 'Importó invitados',
      detalles: { importados, duplicados, errores: errores.length }
    })

    return {
      importados,
      duplicados,
      errores: errores.length,
      detalleErrores: errores
    }
  }
}
