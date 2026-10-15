/**
 * Prisma client singleton.
 *
 * En desarrollo Next.js recarga el módulo varias veces,
 * por lo que guardamos la instancia en `global` para evitar crear
 * múltiples conexiones concurrentes.
 */

import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma
}

export default prisma
