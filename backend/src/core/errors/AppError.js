export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.details = details
    Error.captureStackTrace?.(this, this.constructor)
  }
}

export const badRequest = (message, details = null) => new AppError(message, 400, details)
export const unauthorizedError = (message, details = null) => new AppError(message, 401, details)
export const notFoundError = (message, details = null) => new AppError(message, 404, details)
