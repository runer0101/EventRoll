import express from 'express'
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  generarCodigo,
  revocarCodigo
} from '../controllers/usuariosController.js'
import { authenticateToken, requireAdmin, codigoLimiter } from '../middleware/auth.js'
import { validateCreateUsuario, validateUpdateUsuario, validateDeleteUsuario, validateIdParam } from '../middleware/validators.js'

const router = express.Router()

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticateToken)
router.use(requireAdmin)

router.route('/')
  .get(getUsuarios)
  .post(validateCreateUsuario, createUsuario)

router.route('/:id')
  .put(validateUpdateUsuario, updateUsuario)
  .delete(validateDeleteUsuario, deleteUsuario)

router.post('/:id/generar-codigo', validateIdParam, codigoLimiter, generarCodigo)
router.delete('/:id/revocar-codigo', validateIdParam, revocarCodigo)

export default router
