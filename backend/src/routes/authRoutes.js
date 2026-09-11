import express from 'express'
import { register, login, loginConCodigo, getMe, logout } from '../controllers/authController.js'
import { authenticateToken, loginLimiter, requireAdmin } from '../middleware/auth.js'
import { validateLogin, validateLoginConCodigo, validateRegister } from '../middleware/validators.js'

const router = express.Router()

// Registro restringido a admins autenticados
router.post('/register', authenticateToken, requireAdmin, validateRegister, register)
router.post('/login', loginLimiter, validateLogin, login)
router.post('/login-con-codigo', loginLimiter, validateLoginConCodigo, loginConCodigo)
router.get('/me', authenticateToken, getMe)
router.post('/logout', authenticateToken, logout)

export default router
