import express from 'express'
import {
  authenticateToken,
  recoveryRequestLimiter,
  recoveryResetLimiter,
  recoveryVerifyLimiter,
  requireAdmin
} from '../middleware/auth.js'
import {
  requestRecoveryCode,
  verifyRecoveryCode,
  resetPassword,
  getBackupClientEmailConfig,
  updateBackupClientEmailConfig
} from '../controllers/passwordRecoveryController.js'
import { validateRequestRecoveryCode, validateVerifyCode, validateResetPassword, validateUpdateEmailConfig } from '../middleware/validators.js'

const router = express.Router()

router.post('/solicitar-codigo', recoveryRequestLimiter, validateRequestRecoveryCode, requestRecoveryCode)

router.post('/verificar-codigo', recoveryVerifyLimiter, validateVerifyCode, verifyRecoveryCode)

router.post('/restablecer-password', recoveryResetLimiter, validateResetPassword, resetPassword)

router.get('/config/email-cliente', authenticateToken, requireAdmin, getBackupClientEmailConfig)

router.put('/config/email-cliente', authenticateToken, requireAdmin, validateUpdateEmailConfig, updateBackupClientEmailConfig)

export default router
