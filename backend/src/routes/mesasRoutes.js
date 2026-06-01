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
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticateToken)

router.route('/')
  .get(getMesas)
  .post(createMesa)

router.route('/:id')
  .put(updateMesa)
  .delete(deleteMesa)

router.get('/sin-mesa', getInvitadosSinMesa)
router.post('/:mesaId/asignar', asignarInvitado)
router.delete('/desasignar/:invitadoId', desasignarInvitado)

export default router
