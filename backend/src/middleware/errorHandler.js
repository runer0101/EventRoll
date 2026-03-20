import { logger } from '../utils/logger.js'

// Middleware para manejar errores 404
export const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// Middleware para manejar todos los errores
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode)
  const isDevelopment = process.env.NODE_ENV === 'development'
  const showStack = isDevelopment && process.env.EXPOSE_ERROR_STACK === 'true'
  const responseMessage = statusCode >= 500 && !isDevelopment
    ? 'Error interno del servidor'
    : err.message

  // Log 5xx como error, 4xx como warn
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${statusCode}`, {
      message: err.message,
      stack: err.stack,
    })
  } else if (statusCode >= 400) {
    logger.warn(`${req.method} ${req.originalUrl} → ${statusCode}: ${err.message}`)
  }

  res.status(statusCode).json({
    success: false,
    message: responseMessage,
    ...(err.details && { details: err.details }),
    ...(showStack && { stack: err.stack }),
  })
}
