import { asyncHandler } from '../utils/asyncHandler.js'
import { invitadosService } from '../services/invitadosService.js'

// @desc    Obtener todos los invitados (con filtros opcionales)
// @route   GET /api/invitados
// @access  Private
export const getInvitados = asyncHandler(async (req, res) => {
  const result = await invitadosService.getInvitados(req.query)

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  })
})

// @desc    Crear nuevo invitado
// @route   POST /api/invitados
// @access  Private
export const createInvitado = asyncHandler(async (req, res) => {
  const invitado = await invitadosService.createInvitado(req.body, req.user.id)

  res.status(201).json({
    success: true,
    data: invitado
  })
})

// @desc    Actualizar invitado
// @route   PUT /api/invitados/:id
// @access  Private
export const updateInvitado = asyncHandler(async (req, res) => {
  const invitado = await invitadosService.updateInvitado(req.params.id, req.body, req.user.id)

  res.json({
    success: true,
    data: invitado
  })
})

// @desc    Eliminar invitado
// @route   DELETE /api/invitados/:id
// @access  Private
export const deleteInvitado = asyncHandler(async (req, res) => {
  await invitadosService.deleteInvitado(req.params.id, req.user.id)

  res.json({
    success: true,
    message: 'Invitado eliminado correctamente'
  })
})

// @desc    Importar múltiples invitados
// @route   POST /api/invitados/import
// @access  Private
export const importInvitados = asyncHandler(async (req, res) => {
  const result = await invitadosService.importInvitados(req.body, req.user.id)

  res.json({
    success: true,
    data: result
  })
})
