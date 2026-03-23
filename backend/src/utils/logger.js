import winston from 'winston'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = process.env.NODE_ENV !== 'production'

const { combine, timestamp, printf, colorize, errors, json } = winston.format

const SENSITIVE_KEYS = new Set(['password', 'password_hash', 'token', 'authorization', 'secret', 'EMAIL_PASS', 'codigo', 'nuevaPassword', 'token_recuperacion', 'email', 'destinatario', 'access_code'])

/** Recursively redact sensitive fields from log metadata objects. */
const redact = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) =>
      SENSITIVE_KEYS.has(k.toLowerCase()) ? [k, '[REDACTED]'] : [k, redact(v)]
    )
  )
}

const redactFormat = winston.format((info) => {
  const { level, message, timestamp, stack, ...meta } = info
  return { ...redact(meta), level, message, timestamp, stack }
})()

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  redactFormat,
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    return `${timestamp} [${level}]: ${stack || message}${metaStr}`
  })
)

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  redactFormat,
  json()
)

const transports = [new winston.transports.Console()]

if (!isDev) {
  const logsDir = path.join(__dirname, '../../logs')
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5_242_880, // 5 MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5_242_880,
      maxFiles: 10,
    })
  )
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  format: isDev ? devFormat : prodFormat,
  transports,
})

// Backward-compatible named exports
export const debug = (...args) => logger.debug(args.join(' '))
export const info = (...args) => logger.info(args.join(' '))
export const warn = (...args) => logger.warn(args.join(' '))
export const error = (...args) => logger.error(args.join(' '))
export { isDev }
