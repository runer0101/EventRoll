import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/config/database.js', () => ({
  query: vi.fn(),
}))

import { authRepository } from '../../src/repositories/authRepository.js'
import { query } from '../../src/config/database.js'

const mockUserWithHash = {
  id: 'user-uuid-1',
  nombre: 'Admin',
  email: 'admin@ejemplo.com',
  password_hash: '$2b$10$hashedpassword',
  rol: 'admin',
  permisos: {},
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── findUserByEmail ──────────────────────────────────────────────────
describe('findUserByEmail', () => {
  it('retorna el usuario con password_hash cuando existe', async () => {
    query.mockResolvedValue({ rows: [mockUserWithHash] })

    const result = await authRepository.findUserByEmail('admin@ejemplo.com')

    expect(result).toEqual(mockUserWithHash)
    expect(result?.password_hash).toBeDefined()
  })

  it('retorna null cuando el email no existe', async () => {
    query.mockResolvedValue({ rows: [] })

    const result = await authRepository.findUserByEmail('noexiste@x.com')
    expect(result).toBeNull()
  })

  it('llama a query con el email correcto', async () => {
    query.mockResolvedValue({ rows: [] })

    await authRepository.findUserByEmail('test@test.com')

    expect(query).toHaveBeenCalledOnce()
    expect(query.mock.calls[0][1]).toContain('test@test.com')
  })
})

// ─── findUserById ─────────────────────────────────────────────────────
describe('findUserById', () => {
  it('retorna el usuario cuando existe', async () => {
    const { password_hash: _, ...userWithoutHash } = mockUserWithHash
    query.mockResolvedValue({ rows: [userWithoutHash] })

    const result = await authRepository.findUserById('user-uuid-1')
    expect(result?.id).toBe('user-uuid-1')
  })

  it('retorna null cuando no existe', async () => {
    query.mockResolvedValue({ rows: [] })

    const result = await authRepository.findUserById('no-existe')
    expect(result).toBeNull()
  })
})

// ─── invalidateAccessCode ─────────────────────────────────────────────
describe('invalidateAccessCode', () => {
  it('ejecuta el UPDATE sin lanzar error', async () => {
    query.mockResolvedValue({ rows: [] })

    await expect(authRepository.invalidateAccessCode('user-uuid-1')).resolves.toBeUndefined()
    expect(query).toHaveBeenCalledOnce()
  })

  it('llama a query con el userId correcto', async () => {
    query.mockResolvedValue({ rows: [] })

    await authRepository.invalidateAccessCode('user-uuid-1')

    expect(query.mock.calls[0][1]).toContain('user-uuid-1')
  })
})
