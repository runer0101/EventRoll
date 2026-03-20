import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcrypt'

vi.mock('../../src/repositories/usuariosRepository.js')
vi.mock('../../src/services/activityService.js')
vi.mock('bcrypt')

import { usuariosService } from '../../src/services/usuariosService.js'
import { usuariosRepository } from '../../src/repositories/usuariosRepository.js'
import { activityService } from '../../src/services/activityService.js'

const ACTOR_ID = 'admin-uuid'

const mockUsuario = {
  id: 'user-uuid-1',
  nombre: 'Carlos López',
  email: 'carlos@test.com',
  rol: 'organizador',
}

beforeEach(() => {
  vi.clearAllMocks()
  activityService.register = vi.fn().mockResolvedValue(undefined)
  bcrypt.hash = vi.fn().mockResolvedValue('$hashed')
})

// ─── getUsuarios ────────────────────────────────────────────────
describe('getUsuarios', () => {
  it('retorna la lista de usuarios del repositorio', async () => {
    usuariosRepository.findAll = vi.fn().mockResolvedValue([mockUsuario])

    const result = await usuariosService.getUsuarios()
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(mockUsuario)
  })
})

// ─── createUsuario ────────────────────────────────────────────────
describe('createUsuario', () => {
  it('crea usuario cuando el email no está en uso', async () => {
    usuariosRepository.findByEmail = vi.fn().mockResolvedValue(null)
    usuariosRepository.create = vi.fn().mockResolvedValue(mockUsuario)

    const result = await usuariosService.createUsuario(
      { nombre: 'Carlos López', email: 'carlos@test.com', password: 'segura123', rol: 'organizador' },
      ACTOR_ID
    )

    expect(result).toEqual(mockUsuario)
    expect(bcrypt.hash).toHaveBeenCalledOnce()
    expect(activityService.register).toHaveBeenCalledOnce()
  })

  it('lanza 400 si el email ya está registrado', async () => {
    usuariosRepository.findByEmail = vi.fn().mockResolvedValue(mockUsuario)

    await expect(
      usuariosService.createUsuario(
        { nombre: 'Otro', email: 'carlos@test.com', password: 'pass1234', rol: 'asistente' },
        ACTOR_ID
      )
    ).rejects.toMatchObject({ statusCode: 400 })
  })
})

// ─── updateUsuario ────────────────────────────────────────────────
describe('updateUsuario', () => {
  it('actualiza nombre correctamente', async () => {
    const updated = { ...mockUsuario, nombre: 'Carlos Modificado' }
    usuariosRepository.findById = vi.fn().mockResolvedValue(mockUsuario)
    usuariosRepository.updateById = vi.fn().mockResolvedValue(updated)

    const result = await usuariosService.updateUsuario(
      mockUsuario.id,
      { nombre: 'Carlos Modificado' },
      ACTOR_ID
    )

    expect(result.nombre).toBe('Carlos Modificado')
    expect(activityService.register).toHaveBeenCalledOnce()
  })

  it('lanza 404 si el usuario no existe', async () => {
    usuariosRepository.findById = vi.fn().mockResolvedValue(null)

    await expect(
      usuariosService.updateUsuario('no-existe', { nombre: 'X' }, ACTOR_ID)
    ).rejects.toMatchObject({ statusCode: 404 })
  })

  it('lanza 400 si el email nuevo ya está en uso por otro usuario', async () => {
    usuariosRepository.findById = vi.fn().mockResolvedValue(mockUsuario)
    usuariosRepository.findByEmailExcludingId = vi.fn().mockResolvedValue({ id: 'otro-usuario' })

    await expect(
      usuariosService.updateUsuario(
        mockUsuario.id,
        { email: 'enuso@test.com' },
        ACTOR_ID
      )
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('lanza 400 si la contraseña nueva tiene menos de 8 caracteres', async () => {
    usuariosRepository.findById = vi.fn().mockResolvedValue(mockUsuario)

    await expect(
      usuariosService.updateUsuario(mockUsuario.id, { password: 'corta' }, ACTOR_ID)
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('lanza 400 si el rol es inválido', async () => {
    usuariosRepository.findById = vi.fn().mockResolvedValue(mockUsuario)

    await expect(
      usuariosService.updateUsuario(mockUsuario.id, { rol: 'superadmin' }, ACTOR_ID)
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('lanza 400 cuando no se pasan campos actualizables', async () => {
    usuariosRepository.findById = vi.fn().mockResolvedValue(mockUsuario)

    await expect(
      usuariosService.updateUsuario(mockUsuario.id, {}, ACTOR_ID)
    ).rejects.toMatchObject({ statusCode: 400 })
  })
})

// ─── deleteUsuario ────────────────────────────────────────────────
describe('deleteUsuario', () => {
  it('elimina usuario y registra actividad', async () => {
    usuariosRepository.findById = vi.fn().mockResolvedValue(mockUsuario)
    usuariosRepository.deleteById = vi.fn().mockResolvedValue(undefined)

    await usuariosService.deleteUsuario(mockUsuario.id, ACTOR_ID)

    expect(usuariosRepository.deleteById).toHaveBeenCalledWith(mockUsuario.id)
    expect(activityService.register).toHaveBeenCalledOnce()
  })

  it('lanza 404 si el usuario no existe', async () => {
    usuariosRepository.findById = vi.fn().mockResolvedValue(null)

    await expect(
      usuariosService.deleteUsuario('no-existe', ACTOR_ID)
    ).rejects.toMatchObject({ statusCode: 404 })
  })

  it('lanza 400 si el actor intenta eliminarse a sí mismo', async () => {
    await expect(
      usuariosService.deleteUsuario(ACTOR_ID, ACTOR_ID)
    ).rejects.toMatchObject({ statusCode: 400 })
  })
})
