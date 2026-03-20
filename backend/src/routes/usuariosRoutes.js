import express from 'express'
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario
} from '../controllers/usuariosController.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import { validateCreateUsuario, validateUpdateUsuario, validateDeleteUsuario } from '../middleware/validators.js'

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

export default router
