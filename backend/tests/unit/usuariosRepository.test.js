import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/config/database.js', () => ({
  query: vi.fn(),
}))

import { usuariosRepository } from '../../src/repositories/usuariosRepository.js'
import { query } from '../../src/config/database.js'

const mockUsuario = {
  id: 'user-uuid-1',
  nombre: 'Ana López',
  email: 'ana@ejemplo.com',
  rol: 'asistente',
  permisos: {},
  created_at: new Date().toISOString(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── findAll ──────────────────────────────────────────────────────────
describe('findAll', () => {
  it('retorna lista de usuarios', async () => {
    query.mockResolvedValue({ rows: [mockUsuario] })

    const result = await usuariosRepository.findAll()
    expect(result).toHaveLength(1)
    expect(result[0].email).toBe('ana@ejemplo.com')
  })
})

// ─── findById ─────────────────────────────────────────────────────────
describe('findById', () => {
  it('retorna el usuario cuando existe', async () => {
    query.mockResolvedValue({ rows: [mockUsuario] })

    const result = await usuariosRepository.findById('user-uuid-1')
    expect(result).toEqual(mockUsuario)
  })

  it('retorna null cuando no existe', async () => {
    query.mockResolvedValue({ rows: [] })

    const result = await usuariosRepository.findById('no-existe')
    expect(result).toBeNull()
  })
})

// ─── findByEmail ──────────────────────────────────────────────────────
describe('findByEmail', () => {
  it('retorna el usuario por email', async () => {
    query.mockResolvedValue({ rows: [mockUsuario] })

    const result = await usuariosRepository.findByEmail('ana@ejemplo.com')
    expect(result?.email).toBe('ana@ejemplo.com')
  })

  it('retorna null si no existe', async () => {
    query.mockResolvedValue({ rows: [] })

    const result = await usuariosRepository.findByEmail('noexiste@x.com')
    expect(result).toBeNull()
  })
})

// ─── findByEmailExcludingId ───────────────────────────────────────────
describe('findByEmailExcludingId', () => {
  it('retorna fila si otro usuario usa ese email', async () => {
    query.mockResolvedValue({ rows: [{ id: 'other-uuid' }] })

    const result = await usuariosRepository.findByEmailExcludingId('ana@ejemplo.com', 'user-uuid-1')
    expect(result).not.toBeNull()
  })

  it('retorna null si el mismo usuario tiene ese email', async () => {
    query.mockResolvedValue({ rows: [] })

    const result = await usuariosRepository.findByEmailExcludingId('ana@ejemplo.com', 'user-uuid-1')
    expect(result).toBeNull()
  })
})

// ─── create ──────────────────────────────────────────────────────────
describe('create', () => {
  it('retorna el usuario creado', async () => {
    query.mockResolvedValue({ rows: [mockUsuario] })

    const result = await usuariosRepository.create({
      nombre: 'Ana López',
      email: 'ana@ejemplo.com',
      passwordHash: 'hash',
      rol: 'asistente',
      permisos: {},
    })
    expect(result).toEqual(mockUsuario)
  })
})

// ─── updateById ──────────────────────────────────────────────────────
describe('updateById', () => {
  it('retorna el usuario actualizado', async () => {
    const updated = { ...mockUsuario, nombre: 'Ana Actualizada' }
    query.mockResolvedValue({ rows: [updated] })

    const result = await usuariosRepository.updateById('user-uuid-1', { nombre: 'Ana Actualizada' })
    expect(result?.nombre).toBe('Ana Actualizada')
  })

  it('retorna null si no hay campos para actualizar', async () => {
    const result = await usuariosRepository.updateById('user-uuid-1', {})
    expect(result).toBeNull()
    expect(query).not.toHaveBeenCalled()
  })
})

// ─── deleteById ──────────────────────────────────────────────────────
describe('deleteById', () => {
  it('ejecuta el DELETE sin error', async () => {
    query.mockResolvedValue({ rows: [] })

    await expect(usuariosRepository.deleteById('user-uuid-1')).resolves.toBeUndefined()
    expect(query).toHaveBeenCalledOnce()
  })
})

// ─── findByAccessCode ─────────────────────────────────────────────────
describe('findByAccessCode', () => {
  it('retorna el usuario si el código es válido', async () => {
    query.mockResolvedValue({ rows: [{ id: 'user-uuid-1', nombre: 'Ana', email: 'ana@ejemplo.com', rol: 'guardia' }] })

    const result = await usuariosRepository.findByAccessCode('ABC12345')
    expect(result?.id).toBe('user-uuid-1')
  })

  it('retorna null si el código no existe o expiró', async () => {
    query.mockResolvedValue({ rows: [] })

    const result = await usuariosRepository.findByAccessCode('INVALIDO')
    expect(result).toBeNull()
  })
})

// ─── setAccessCode / clearAccessCode ──────────────────────────────────
describe('setAccessCode', () => {
  it('retorna el usuario con el código seteado', async () => {
    const withCode = { ...mockUsuario, access_code: 'XYZ99' }
    query.mockResolvedValue({ rows: [withCode] })

    const result = await usuariosRepository.setAccessCode('user-uuid-1', 'XYZ99')
    expect(result?.access_code).toBe('XYZ99')
  })
})

describe('clearAccessCode', () => {
  it('retorna el id del usuario al limpiar el código', async () => {
    query.mockResolvedValue({ rows: [{ id: 'user-uuid-1' }] })

    const result = await usuariosRepository.clearAccessCode('user-uuid-1')
    expect(result?.id).toBe('user-uuid-1')
  })
})
