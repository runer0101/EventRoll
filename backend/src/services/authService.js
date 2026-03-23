import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authRepository } from '../repositories/authRepository.js'
import { revokeToken } from '../middleware/auth.js'
import { usuariosRepository } from '../repositories/usuariosRepository.js'
import { activityService } from './activityService.js'
import { unauthorizedError } from '../core/errors/AppError.js'

const buildAuthUser = (usuario) => ({
  id: usuario.id,
  nombre: usuario.nombre,
  email: usuario.email,
  rol: usuario.rol
})

export const authService = {
  async login({ email, password }) {
    const usuario = await authRepository.findUserByEmail(email)

    if (!usuario) {
      throw unauthorizedError('Credenciales inválidas')
    }

    const isValidPassword = await bcrypt.compare(password, usuario.password_hash)

    if (!isValidPassword) {
      throw unauthorizedError('Credenciales inválidas')
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no está configurado')
    }

    const token = jwt.sign(
      {
        userId: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    )

    await activityService.register({
      usuarioId: usuario.id,
      accion: 'Login exitoso',
      detalles: { email: usuario.email }
    })

    return {
      token,
      usuario: buildAuthUser(usuario)
    }
  },

  async logout(user, token) {
    if (token) {
      // Calcular tiempo restante de vida del token para limpiar la blacklist automáticamente
      try {
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        const remainingMs = (decoded.exp * 1000) - Date.now()
        if (remainingMs > 0) revokeToken(token, remainingMs)
      } catch { /* token malformado, ignorar */ }
    }
    await activityService.register({
      usuarioId: user.id,
      accion: 'Logout',
      detalles: { email: user.email }
    })
  },

  async loginConCodigo({ codigo }) {
    if (!codigo || typeof codigo !== 'string' || codigo.trim().length < 4) {
      throw unauthorizedError('Código inválido')
    }

    const usuario = await usuariosRepository.findByAccessCode(codigo.trim().toUpperCase())

    if (!usuario) {
      throw unauthorizedError('Código de acceso incorrecto')
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no está configurado')
    }

    const token = jwt.sign(
      { userId: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    )

    await activityService.register({
      usuarioId: usuario.id,
      accion: 'Login con código de acceso',
      detalles: { nombre: usuario.nombre }
    })

    return { token, usuario: buildAuthUser(usuario) }
  },

  getCurrentUser(user) {
    return { usuario: user }
  }
}
