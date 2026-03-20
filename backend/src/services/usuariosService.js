import bcrypt from 'bcryptjs'
import { usuariosRepository } from '../repositories/usuariosRepository.js'
import { activityService } from './activityService.js'
import { badRequest, notFoundError } from '../core/errors/AppError.js'

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10
const ROLES_VALIDOS = ['admin', 'organizador', 'asistente', 'guardia']

const buildDefaultPermisos = (rol) => ({
  ver_invitados: true,
  crear_invitados: rol !== 'guardia',
  editar_invitados: rol !== 'guardia',
  eliminar_invitados: rol === 'admin',
  importar_excel: rol === 'admin' || rol === 'organizador',
  exportar_excel: true,
  confirmar_asistencia: true,
  marcar_asistencia: true
})

export const usuariosService = {
  async getUsuarios() {
    return usuariosRepository.findAll()
  },

  async createUsuario(payload, actorId) {
    const { nombre, email, password, rol, permisos } = payload

    const existingUser = await usuariosRepository.findByEmail(email)
    if (existingUser) {
      throw badRequest('El email ya está registrado')
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const permisosFinales = permisos || buildDefaultPermisos(rol)

    const user = await usuariosRepository.create({
      nombre,
      email,
      passwordHash,
      rol,
      permisos: permisosFinales
    })

    await activityService.register({
      usuarioId: actorId,
      accion: 'Creó usuario',
      detalles: { nuevoUsuario: user.nombre, email }
    })

    return user
  },

  async updateUsuario(id, payload, actorId) {
    const existingUser = await usuariosRepository.findById(id)
    if (!existingUser) {
      throw notFoundError('Usuario no encontrado')
    }

    const updates = {}

    if (payload.nombre !== undefined) {
      updates.nombre = payload.nombre
    }

    if (payload.email !== undefined) {
      const emailInUse = await usuariosRepository.findByEmailExcludingId(payload.email, id)
      if (emailInUse) {
        throw badRequest('El email ya está en uso')
      }
      updates.email = payload.email
    }

    if (payload.password !== undefined) {
      if (payload.password.length < 8) {
        throw badRequest('La contraseña debe tener al menos 8 caracteres')
      }
      updates.passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS)
    }

    if (payload.rol !== undefined) {
      if (!ROLES_VALIDOS.includes(payload.rol)) {
        throw badRequest('Rol inválido')
      }
      updates.rol = payload.rol
    }

    if (payload.permisos !== undefined) {
      updates.permisos = payload.permisos
    }

    if (Object.keys(updates).length === 0) {
      throw badRequest('No hay campos para actualizar')
    }

    const updatedUser = await usuariosRepository.updateById(id, updates)
    if (!updatedUser) {
      throw notFoundError('Usuario no encontrado')
    }

    await activityService.register({
      usuarioId: actorId,
      accion: 'Actualizó usuario',
      detalles: { usuarioActualizado: updatedUser.nombre }
    })

    return updatedUser
  },

  async deleteUsuario(id, actorId) {
    if (String(id) === String(actorId)) {
      throw badRequest('No puedes eliminar tu propia cuenta')
    }

    const existingUser = await usuariosRepository.findById(id)
    if (!existingUser) {
      throw notFoundError('Usuario no encontrado')
    }

    await usuariosRepository.deleteById(id)

    await activityService.register({
      usuarioId: actorId,
      accion: 'Eliminó usuario',
      detalles: {
        usuarioEliminado: existingUser.nombre,
        email: existingUser.email
      }
    })
  }
}
