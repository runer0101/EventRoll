import { randomUUID } from 'crypto'

/**
 * Assigns a unique X-Request-ID to every incoming request.
 * If the client sends one, it is reused (useful for distributed tracing).
 * The ID is available as req.requestId and reflected back in the response header.
 */
export const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || randomUUID()
  req.requestId = id
  res.setHeader('X-Request-ID', id)
  next()
}
