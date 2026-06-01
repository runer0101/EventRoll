import { mesasRepository } from '../repositories/mesasRepository.js'
import { badRequest, notFoundError } from '../core/errors/AppError.js'

export const mesasService = {
  async getMesas(eventoId) {
    return mesasRepository.findByEvento(eventoId)
  },

  async createMesa(payload) {
    const { evento_id, nombre, sillas, pos_x, pos_y } = payload
    if (!evento_id) throw badRequest('evento_id es requerido')
    if (!nombre) throw badRequest('nombre es requerido')
    return mesasRepository.create({ evento_id, nombre, sillas, pos_x, pos_y })
  },

  async updateMesa(id, payload) {
    const mesa = await mesasRepository.findById(id)
    if (!mesa) throw notFoundError('Mesa no encontrada')
    return mesasRepository.updateById(id, payload)
  },

  async deleteMesa(id) {
    const mesa = await mesasRepository.findById(id)
    if (!mesa) throw notFoundError('Mesa no encontrada')
    return mesasRepository.deleteById(id)
  },

  async asignarInvitado(mesaId, invitadoId, posicion) {
    const mesa = await mesasRepository.findById(mesaId)
    if (!mesa) throw notFoundError('Mesa no encontrada')
    if (posicion < 1 || posicion > mesa.sillas) {
      throw badRequest(`Posición inválida. La mesa tiene ${mesa.sillas} sillas`)
    }
    return mesasRepository.asignarInvitado(mesaId, invitadoId, posicion)
  },

  async desasignarInvitado(invitadoId) {
    const result = await mesasRepository.desasignarInvitado(invitadoId)
    if (!result) throw notFoundError('Invitado no estaba asignado a ninguna mesa')
    return result
  },

  async getInvitadosSinMesa(eventoId) {
    return mesasRepository.getInvitadosSinMesa(eventoId)
  }
}
