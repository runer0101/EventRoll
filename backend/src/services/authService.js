import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authRepository } from '../repositories/authRepository.js'
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

  async logout(user) {
    await activityService.register({
      usuarioId: user.id,
      accion: 'Logout',
      detalles: { email: user.email }
    })
  },

  getCurrentUser(user) {
    return { usuario: user }
  }
}
