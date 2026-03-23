import express from 'express'
import {
  getInvitados,
  createInvitado,
  updateInvitado,
  deleteInvitado,
  importInvitados
} from '../controllers/invitadosController.js'
import { authenticateToken, requireOrganizer } from '../middleware/auth.js'
import { validateCreateInvitado, validateUpdateInvitado, validateDeleteInvitado, validateGetInvitados, validateImportInvitados } from '../middleware/validators.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

router.route('/')
  .get(validateGetInvitados, getInvitados)
  .post(requireOrganizer, validateCreateInvitado, createInvitado)

router.post('/import', requireOrganizer, validateImportInvitados, importInvitados)

router.route('/:id')
  .put(requireOrganizer, validateUpdateInvitado, updateInvitado)
  .delete(requireOrganizer, validateDeleteInvitado, deleteInvitado)

export default router
