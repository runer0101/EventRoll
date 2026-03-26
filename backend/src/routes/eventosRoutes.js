import express from 'express'
import { getEventos } from '../controllers/eventosController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticateToken)

router.get('/', getEventos)

export default router
