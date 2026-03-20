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
        field: err.param,
        message: err.msg
      }))
    })
  }
  next()
}

/**
 * Validadores para Autenticación
 */
export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email no puede exceder 255 caracteres'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Contraseña es requerida')
    .isLength({ max: 255 })
    .withMessage('Contraseña muy larga'),
  handleValidationErrors
]

/**
 * Validadores para Usuarios
 */
export const validateCreateUsuario = [
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
    .withMessage('Contraseña debe tener entre 8 y 255 caracteres'),
  body('rol')
    .trim()
    .isIn(['admin', 'organizador', 'asistente', 'guardia'])
    .withMessage('Rol inválido'),
  body('permisos')
    .optional()
    .isObject()
    .withMessage('Permisos debe ser un objeto'),
  handleValidationErrors
]

export const validateUpdateUsuario = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número válido'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nombre no puede exceder 100 caracteres'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email no puede exceder 255 caracteres'),
  body('password')
    .optional()
    .isLength({ min: 8, max: 255 })
    .withMessage('Contraseña debe tener entre 8 y 255 caracteres'),
  body('rol')
    .optional()
    .trim()
    .isIn(['admin', 'organizador', 'asistente', 'guardia'])
    .withMessage('Rol inválido'),
  handleValidationErrors
]

export const validateDeleteUsuario = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número válido'),
  handleValidationErrors
]

/**
 * Validadores para Invitados
 */
export const validateCreateInvitado = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('Nombre es requerido')
    .isLength({ max: 100 })
    .withMessage('Nombre no puede exceder 100 caracteres'),
  body('apellido')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Apellido no puede exceder 100 caracteres'),
  body('categoria')
    .optional()
    .trim()
    .isIn(['General', 'VIP', 'Familia', 'Amigos', 'Trabajo'])
    .withMessage('Categoría inválida'),
  body('evento_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('evento_id debe ser un número válido'),
  body('confirmado')
    .optional()
    .isBoolean()
    .withMessage('confirmado debe ser un booleano'),
  handleValidationErrors
]

export const validateUpdateInvitado = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número válido'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nombre no puede exceder 100 caracteres'),
  body('apellido')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Apellido no puede exceder 100 caracteres'),
  body('categoria')
    .optional()
    .trim()
    .isIn(['General', 'VIP', 'Familia', 'Amigos', 'Trabajo'])
    .withMessage('Categoría inválida'),
  body('confirmado')
    .optional()
    .isBoolean()
    .withMessage('confirmado debe ser un booleano'),
  handleValidationErrors
]

export const validateDeleteInvitado = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número válido'),
  handleValidationErrors
]

export const validateGetInvitados = [
  query('evento_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('evento_id debe ser un número válido'),
  query('categoria')
    .optional()
    .trim()
    .isIn(['General', 'VIP', 'Familia', 'Amigos', 'Trabajo'])
    .withMessage('Categoría inválida'),
  query('confirmado')
    .optional()
    .isBoolean()
    .withMessage('confirmado debe ser un booleano'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Búsqueda no puede exceder 100 caracteres')
    .matches(/^[a-zA-Z0-9\s\-áéíóúñ]*$/)
    .withMessage('Búsqueda contiene caracteres inválidos'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page debe ser un entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('limit debe ser entre 1 y 200'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order debe ser asc o desc'),
  handleValidationErrors
]

export const validateImportInvitados = [
  body('evento_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('evento_id debe ser un número válido'),
  body('invitados')
    .isArray({ min: 1, max: 1000 })
    .withMessage('invitados debe ser un array con al menos 1 elemento y máximo 1000'),
  body('invitados.*.nombre')
    .trim()
    .notEmpty()
    .withMessage('Nombre es requerido para cada invitado')
    .isLength({ max: 100 })
    .withMessage('Nombre no puede exceder 100 caracteres'),
  body('invitados.*.apellido')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Apellido no puede exceder 100 caracteres'),
  body('invitados.*.categoria')
    .optional()
    .trim()
    .isIn(['General', 'VIP', 'Familia', 'Amigos', 'Trabajo'])
    .withMessage('Categoría inválida'),
  body('invitados.*.confirmado')
    .optional()
    .isBoolean()
    .withMessage('confirmado debe ser un booleano'),
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
    .matches(/^\d{6}$/)
    .withMessage('Código debe ser 6 dígitos'),
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
    .matches(/^\d{6}$/)
    .withMessage('Código debe ser 6 dígitos'),
  body('nuevaPassword')
    .isLength({ min: 8, max: 255 })
    .withMessage('Contraseña debe tener entre 8 y 255 caracteres'),
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
