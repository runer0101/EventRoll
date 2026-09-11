import { body, param, validationResult } from 'express-validator'

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
 * Validador genérico de :id como UUID
 */
export const validateIdParam = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),
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
    .withMessage('Contraseña debe tener entre 8 y 255 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Contraseña debe contener al menos una letra y un número'),
  body('rol')
    .trim()
    .isIn(['admin', 'organizador', 'asistente', 'guardia', 'visualizador'])
    .withMessage('Rol inválido'),
  body('permisos')
    .optional()
    .isObject()
    .withMessage('Permisos debe ser un objeto')
    .custom((val) => {
      if (val == null) return true
      const claves = ['verInvitados','agregarInvitados','editarInvitados','eliminarInvitados','confirmarInvitados','exportarExcel','importarExcel','configurarSillas','gestionarUsuarios']
      for (const [k, v] of Object.entries(val)) {
        if (!claves.includes(k)) throw new Error(`Permiso desconocido: ${k}`)
        if (typeof v !== 'boolean') throw new Error(`El permiso "${k}" debe ser true o false`)
      }
      return true
    }),
  handleValidationErrors
]

export const validateUpdateUsuario = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),
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
    .withMessage('Contraseña debe tener entre 8 y 255 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Contraseña debe contener al menos una letra y un número'),
  body('rol')
    .optional()
    .trim()
    .isIn(['admin', 'organizador', 'asistente', 'guardia', 'visualizador'])
    .withMessage('Rol inválido'),
  handleValidationErrors
]

export const validateDeleteUsuario = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),
  handleValidationErrors
]
