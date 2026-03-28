import express from 'express'
import {
  getInvitados,
  createInvitado,
  updateInvitado,
  deleteInvitado,
  importInvitados
} from '../controllers/invitadosController.js'
import { authenticateToken, requirePermiso } from '../middleware/auth.js'
import { validateCreateInvitado, validateUpdateInvitado, validateDeleteInvitado, validateGetInvitados, validateImportInvitados } from '../middleware/validators.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

router.route('/')
  .get(requirePermiso('verInvitados'), validateGetInvitados, getInvitados)
  .post(requirePermiso('agregarInvitados'), validateCreateInvitado, createInvitado)

router.post('/import', requirePermiso('importarExcel'), validateImportInvitados, importInvitados)

router.route('/:id')
  .put(requirePermiso('editarInvitados'), validateUpdateInvitado, updateInvitado)
  .delete(requirePermiso('eliminarInvitados'), validateDeleteInvitado, deleteInvitado)

export default router
