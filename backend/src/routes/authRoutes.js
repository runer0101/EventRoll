import express from 'express'
import { login, loginConCodigo, getMe, logout } from '../controllers/authController.js'
import { authenticateToken, loginLimiter } from '../middleware/auth.js'
import { validateLogin } from '../middleware/validators.js'

const router = express.Router()

router.post('/login', loginLimiter, validateLogin, login)
router.post('/login-con-codigo', loginLimiter, loginConCodigo)
router.get('/me', authenticateToken, getMe)
router.post('/logout', authenticateToken, logout)

export default router
