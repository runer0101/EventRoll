import { body, param, query, validationResult } from 'express-validator'

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
 * Validadores para Mesas
 */
export const validateCreateMesa = [
  body('evento_id')
    .trim()
    .notEmpty()
    .withMessage('evento_id es requerido')
    .isUUID()
    .withMessage('evento_id debe ser un UUID válido'),
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('nombre es requerido')
    .isLength({ max: 50 })
    .withMessage('nombre no puede exceder 50 caracteres'),
  body('sillas')
    .optional()
    .isInt({ min: 2, max: 20 })
    .withMessage('sillas debe ser un número entre 2 y 20'),
  body('pos_x')
    .optional()
    .isFloat()
    .withMessage('pos_x debe ser un número'),
  body('pos_y')
    .optional()
    .isFloat()
    .withMessage('pos_y debe ser un número'),
  handleValidationErrors
]

export const validateUpdateMesa = [
  param('id')
    .isUUID()
    .withMessage('id debe ser un UUID válido'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('nombre no puede exceder 50 caracteres'),
  body('sillas')
    .optional()
    .isInt({ min: 2, max: 20 })
    .withMessage('sillas debe ser un número entre 2 y 20'),
  body('pos_x')
    .optional()
    .isFloat()
    .withMessage('pos_x debe ser un número'),
  body('pos_y')
    .optional()
    .isFloat()
    .withMessage('pos_y debe ser un número'),
  handleValidationErrors
]

export const validateAsignarInvitado = [
  param('mesaId')
    .isUUID()
    .withMessage('mesaId debe ser un UUID válido'),
  body('invitado_id')
    .trim()
    .notEmpty()
    .withMessage('invitado_id es requerido')
    .isUUID()
    .withMessage('invitado_id debe ser un UUID válido'),
  body('posicion')
    .isInt({ min: 1, max: 20 })
    .withMessage('posicion debe ser un número entre 1 y 20'),
  handleValidationErrors
]

export const validateDesasignarInvitado = [
  param('invitadoId')
    .isUUID()
    .withMessage('invitadoId debe ser un UUID válido'),
  handleValidationErrors
]

export const validateGetMesas = [
  query('evento_id')
    .trim()
    .notEmpty()
    .withMessage('evento_id es requerido')
    .isUUID()
    .withMessage('evento_id debe ser un UUID válido'),
  handleValidationErrors
]
