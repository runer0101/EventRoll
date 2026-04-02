import { logger } from '../utils/logger.js'

// Middleware para manejar errores 404
export const notFound = (req, res, next) => {
  // No incluir req.originalUrl en el mensaje de respuesta para no revelar estructura de rutas.
  // La URL se loguea internamente vía el errorHandler (req.method + req.originalUrl).
  const error = new Error('Ruta no encontrada')
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

  const reqId = req.requestId || null
  const userId = req.user?.id || null

  // Log 5xx como error, 4xx como warn — incluye requestId y userId para trazabilidad
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${statusCode}`, {
      requestId: reqId,
      userId,
      message: err.message,
      stack: err.stack,
    })
  } else if (statusCode >= 400) {
    logger.warn(`${req.method} ${req.originalUrl} → ${statusCode}: ${err.message}`, {
      requestId: reqId,
      userId,
    })
  }

  res.status(statusCode).json({
    success: false,
    message: responseMessage,
    ...(reqId && { requestId: reqId }),
    ...(err.details && { details: err.details }),
    ...(showStack && { stack: err.stack }),
  })
}
