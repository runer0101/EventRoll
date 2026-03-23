import { asyncHandler } from '../utils/asyncHandler.js'
import { passwordRecoveryService } from '../services/passwordRecoveryService.js'

export const requestRecoveryCode = asyncHandler(async (req, res) => {
  const result = await passwordRecoveryService.requestRecoveryCode(req.body.email)

  res.status(result.statusCode || 200).json(result)
})

export const verifyRecoveryCode = asyncHandler(async (req, res) => {
  const result = await passwordRecoveryService.verifyRecoveryCode(req.body.email, req.body.codigo)

  res.status(result.statusCode || 200).json(result)
})

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await passwordRecoveryService.resetPassword(
    req.body.email,
    req.body.codigo,
    req.body.nuevaPassword
  )

  res.status(result.statusCode || 200).json({
    success: result.success,
    message: result.message
  })
})

export const getBackupClientEmailConfig = asyncHandler(async (req, res) => {
  const result = await passwordRecoveryService.getBackupClientEmailConfig()

  res.json(result)
})

export const updateBackupClientEmailConfig = asyncHandler(async (req, res) => {
  const result = await passwordRecoveryService.updateBackupClientEmailConfig(req.body.email)

  res.json(result)
})
