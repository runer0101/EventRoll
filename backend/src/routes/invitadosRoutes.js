import express from 'express'
import {
  getInvitados,
  createInvitado,
  updateInvitado,
  deleteInvitado,
  importInvitados
} from '../controllers/invitadosController.js'
import { authenticateToken, requireOrganizer, requirePermiso } from '../middleware/auth.js'
import { validateCreateInvitado, validateUpdateInvitado, validateDeleteInvitado, validateGetInvitados, validateImportInvitados } from '../middleware/validators.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

router.route('/')
  .get(validateGetInvitados, getInvitados)
  .post(requireOrganizer, requirePermiso('crear_invitados'), validateCreateInvitado, createInvitado)

router.post('/import', requireOrganizer, requirePermiso('importar_invitados'), validateImportInvitados, importInvitados)

router.route('/:id')
  .put(requireOrganizer, requirePermiso('editar_invitados'), validateUpdateInvitado, updateInvitado)
  .delete(requireOrganizer, requirePermiso('eliminar_invitados'), validateDeleteInvitado, deleteInvitado)

export default router
