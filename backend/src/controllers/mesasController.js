import { asyncHandler } from '../utils/asyncHandler.js'
import { mesasService } from '../services/mesasService.js'

export const getMesas = asyncHandler(async (req, res) => {
  const eventoId = req.query.evento_id
  if (!eventoId) {
    return res.status(400).json({ success: false, message: 'evento_id es requerido' })
  }
  const mesas = await mesasService.getMesas(eventoId)
  res.json({ success: true, data: mesas })
})

export const createMesa = asyncHandler(async (req, res) => {
  const mesa = await mesasService.createMesa(req.body)
  res.status(201).json({ success: true, data: mesa })
})

export const updateMesa = asyncHandler(async (req, res) => {
  const mesa = await mesasService.updateMesa(req.params.id, req.body)
  res.json({ success: true, data: mesa })
})

export const deleteMesa = asyncHandler(async (req, res) => {
  await mesasService.deleteMesa(req.params.id)
  res.json({ success: true, message: 'Mesa eliminada' })
})

export const asignarInvitado = asyncHandler(async (req, res) => {
  const { mesaId } = req.params
  const { invitado_id, posicion } = req.body
  const asignacion = await mesasService.asignarInvitado(mesaId, invitado_id, posicion)
  res.json({ success: true, data: asignacion })
})

export const desasignarInvitado = asyncHandler(async (req, res) => {
  const resultado = await mesasService.desasignarInvitado(req.params.invitadoId)
  res.json({ success: true, data: resultado })
})

export const getInvitadosSinMesa = asyncHandler(async (req, res) => {
  const eventoId = req.query.evento_id
  if (!eventoId) {
    return res.status(400).json({ success: false, message: 'evento_id es requerido' })
  }
  const invitados = await mesasService.getInvitadosSinMesa(eventoId)
  res.json({ success: true, data: invitados })
})
