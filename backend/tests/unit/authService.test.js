import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Mocks antes de importar el servicio
vi.mock('../../src/repositories/authRepository.js')
vi.mock('../../src/services/activityService.js')
vi.mock('bcrypt')
vi.mock('jsonwebtoken')

import { authService } from '../../src/services/authService.js'
import { authRepository } from '../../src/repositories/authRepository.js'
import { activityService } from '../../src/services/activityService.js'

const mockUser = {
  id: 'uuid-1',
  nombre: 'Admin Test',
  email: 'admin@test.com',
  password_hash: '$2b$10$hashedpassword',
  rol: 'admin',
}

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret-key-for-testing-only'
    activityService.register = vi.fn().mockResolvedValue(undefined)
  })

  // ─── login ──────────────────────────────────────────────────────
  describe('login', () => {
    it('lanza 401 cuando el usuario no existe', async () => {
      authRepository.findUserByEmail = vi.fn().mockResolvedValue(null)

      await expect(
        authService.login({ email: 'noexiste@test.com', password: '12345678' })
      ).rejects.toMatchObject({ statusCode: 401 })
    })

    it('lanza 401 cuando la contraseña es incorrecta', async () => {
      authRepository.findUserByEmail = vi.fn().mockResolvedValue(mockUser)
      bcrypt.compare = vi.fn().mockResolvedValue(false)

      await expect(
        authService.login({ email: mockUser.email, password: 'wrong' })
      ).rejects.toMatchObject({ statusCode: 401 })
    })

    it('retorna token y usuario cuando las credenciales son válidas', async () => {
      authRepository.findUserByEmail = vi.fn().mockResolvedValue(mockUser)
      bcrypt.compare = vi.fn().mockResolvedValue(true)
      jwt.sign = vi.fn().mockReturnValue('mocked.jwt.token')

      const result = await authService.login({ email: mockUser.email, password: 'correcta' })

      expect(result).toEqual({
        token: 'mocked.jwt.token',
        usuario: {
          id: mockUser.id,
          nombre: mockUser.nombre,
          email: mockUser.email,
          rol: mockUser.rol,
        },
      })
    })

    it('registra actividad de login exitoso', async () => {
      authRepository.findUserByEmail = vi.fn().mockResolvedValue(mockUser)
      bcrypt.compare = vi.fn().mockResolvedValue(true)
      jwt.sign = vi.fn().mockReturnValue('token')

      await authService.login({ email: mockUser.email, password: 'pass' })

      expect(activityService.register).toHaveBeenCalledWith(
        expect.objectContaining({ accion: 'Login exitoso' })
      )
    })

    it('no expone password_hash en el resultado', async () => {
      authRepository.findUserByEmail = vi.fn().mockResolvedValue(mockUser)
      bcrypt.compare = vi.fn().mockResolvedValue(true)
      jwt.sign = vi.fn().mockReturnValue('token')

      const result = await authService.login({ email: mockUser.email, password: 'pass' })

      expect(result.usuario).not.toHaveProperty('password_hash')
    })

    it('lanza Error si JWT_SECRET no está configurado', async () => {
      delete process.env.JWT_SECRET
      authRepository.findUserByEmail = vi.fn().mockResolvedValue(mockUser)
      bcrypt.compare = vi.fn().mockResolvedValue(true)

      await expect(
        authService.login({ email: mockUser.email, password: 'pass' })
      ).rejects.toThrow('JWT_SECRET no está configurado')
    })
  })

  // ─── logout ──────────────────────────────────────────────────────
  describe('logout', () => {
    it('registra actividad de logout', async () => {
      await authService.logout({ id: 'uuid-1', email: 'admin@test.com' })

      expect(activityService.register).toHaveBeenCalledWith(
        expect.objectContaining({ accion: 'Logout' })
      )
    })
  })

  // ─── getCurrentUser ───────────────────────────────────────────────
  describe('getCurrentUser', () => {
    it('retorna el usuario envuelto en { usuario }', () => {
      const result = authService.getCurrentUser(mockUser)
      expect(result).toEqual({ usuario: mockUser })
    })
  })
})
