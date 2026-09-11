import { body, validationResult } from 'express-validator'

/**
 * Middleware para validar errores de express-validator
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validación fallida',
      errors: errors.array().map(err => ({
        field: err.path ?? err.param,
        message: err.msg
      }))
    })
  }
  next()
}

/**
 * Validadores para Auth (Login)
 */
export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Contraseña es requerida'),
  handleValidationErrors
]

/**
 * Validadores para Auth (Login con código)
 */
export const validateLoginConCodigo = [
  body('codigo')
    .trim()
    .notEmpty()
    .withMessage('Código de acceso requerido')
    .isLength({ min: 6, max: 12 })
    .withMessage('Código inválido')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Código contiene caracteres inválidos'),
  handleValidationErrors
]

/**
 * Validadores para Auth (Register)
 */
export const validateRegister = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('Nombre es requerido')
    .isLength({ max: 100 })
    .withMessage('Nombre no puede exceder 100 caracteres'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email no puede exceder 255 caracteres'),
  body('password')
    .isLength({ min: 8, max: 255 })
    .withMessage('Contraseña debe tener entre 8 y 255 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Contraseña debe contener al menos una letra y un número'),
  body('rol')
    .optional()
    .trim()
    .isIn(['organizador', 'asistente', 'guardia', 'visualizador'])
    .withMessage('Rol inválido. Solo se permiten roles no-admin'),
  handleValidationErrors
]

/**
 * Validadores para Password Recovery
 */
export const validateRequestRecoveryCode = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email no puede exceder 255 caracteres'),
  handleValidationErrors
]

export const validateVerifyCode = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('codigo')
    .trim()
    .matches(/^\d{8}$/)
    .withMessage('Código debe ser 8 dígitos'),
  handleValidationErrors
]

export const validateResetPassword = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('codigo')
    .trim()
    .matches(/^\d{8}$/)
    .withMessage('Código debe ser 8 dígitos'),
  body('nuevaPassword')
    .isLength({ min: 8, max: 255 })
    .withMessage('Contraseña debe tener entre 8 y 255 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Contraseña debe contener al menos una letra y un número'),
  handleValidationErrors
]

export const validateUpdateEmailConfig = [
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email no puede exceder 255 caracteres'),
  handleValidationErrors
]
