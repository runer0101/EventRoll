import { asyncHandler } from '../utils/asyncHandler.js'
import { usuariosService } from '../services/usuariosService.js'
import { usuariosRepository } from '../repositories/usuariosRepository.js'
import { invalidateCachedUser } from '../middleware/auth.js'

// @desc    Obtener todos los usuarios
// @route   GET /api/usuarios
// @access  Private (admin)
export const getUsuarios = asyncHandler(async (req, res) => {
  const users = await usuariosService.getUsuarios()

  res.json({
    success: true,
    data: users
  })
})

// @desc    Crear nuevo usuario
// @route   POST /api/usuarios
// @access  Private (admin)
export const createUsuario = asyncHandler(async (req, res) => {
  const user = await usuariosService.createUsuario(req.body, req.user.id)

  res.status(201).json({
    success: true,
    data: user
  })
})

// @desc    Actualizar usuario
// @route   PUT /api/usuarios/:id
// @access  Private (admin)
export const updateUsuario = asyncHandler(async (req, res) => {
  const user = await usuariosService.updateUsuario(req.params.id, req.body, req.user.id)

  // Invalidar cache para que el próximo request recargue datos actualizados
  invalidateCachedUser(req.params.id)

  res.json({
    success: true,
    data: user
  })
})

// @desc    Eliminar usuario
// @route   DELETE /api/usuarios/:id
// @access  Private (admin)
export const deleteUsuario = asyncHandler(async (req, res) => {
  await usuariosService.deleteUsuario(req.params.id, req.user.id)

  invalidateCachedUser(req.params.id)

  res.json({
    success: true,
    message: 'Usuario eliminado correctamente'
  })
})

// Genera un código alfanumérico único de 8 caracteres
const generarCodigoAleatorio = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

// @desc    Generar código de acceso para un usuario
// @route   POST /api/usuarios/:id/generar-codigo
// @access  Private (admin)
export const generarCodigo = asyncHandler(async (req, res) => {
  const code = generarCodigoAleatorio()
  const usuario = await usuariosRepository.setAccessCode(req.params.id, code)

  if (!usuario) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
  }

  invalidateCachedUser(req.params.id)

  res.json({
    success: true,
    data: { access_code: usuario.access_code }
  })
})

// @desc    Revocar código de acceso de un usuario
// @route   DELETE /api/usuarios/:id/revocar-codigo
// @access  Private (admin)
export const revocarCodigo = asyncHandler(async (req, res) => {
  const usuario = await usuariosRepository.clearAccessCode(req.params.id)

  if (!usuario) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
  }

  invalidateCachedUser(req.params.id)

  res.json({
    success: true,
    message: 'Código revocado correctamente'
  })
})
