import express from 'express'
import {
  getMesas,
  createMesa,
  updateMesa,
  deleteMesa,
  asignarInvitado,
  desasignarInvitado,
  getInvitadosSinMesa
} from '../controllers/mesasController.js'
import { authenticateToken, requirePermiso } from '../middleware/auth.js'
import {
  validateCreateMesa,
  validateUpdateMesa,
  validateAsignarInvitado,
  validateDesasignarInvitado,
  validateGetMesas
} from '../middleware/validators.js'

const router = express.Router()

router.use(authenticateToken)

router.route('/')
  .get(validateGetMesas, requirePermiso('verInvitados'), getMesas)
  .post(validateCreateMesa, requirePermiso('agregarInvitados'), createMesa)

router.route('/:id')
  .put(validateUpdateMesa, requirePermiso('editarInvitados'), updateMesa)
  .delete(requirePermiso('eliminarInvitados'), deleteMesa)

router.get('/sin-mesa', validateGetMesas, requirePermiso('verInvitados'), getInvitadosSinMesa)
router.post('/:mesaId/asignar', validateAsignarInvitado, requirePermiso('editarInvitados'), asignarInvitado)
router.delete('/desasignar/:invitadoId', validateDesasignarInvitado, requirePermiso('editarInvitados'), desasignarInvitado)

export default router
