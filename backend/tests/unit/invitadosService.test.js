import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/repositories/invitadosRepository.js')
vi.mock('../../src/services/activityService.js')

import { invitadosService } from '../../src/services/invitadosService.js'
import { invitadosRepository } from '../../src/repositories/invitadosRepository.js'
import { activityService } from '../../src/services/activityService.js'

const ACTOR_ID = 'actor-uuid'

const mockInvitado = {
  id: 'inv-uuid-1',
  evento_id: '1',
  nombre: 'María',
  apellido: 'García',
  categoria: 'VIP',
  confirmado: false,
}

beforeEach(() => {
  vi.clearAllMocks()
  activityService.register = vi.fn().mockResolvedValue(undefined)
})

// ─── getInvitados ────────────────────────────────────────────────
describe('getInvitados', () => {
  it('retorna data y metadatos de paginación', async () => {
    invitadosRepository.findAllPaginated = vi.fn().mockResolvedValue({
      rows: [mockInvitado],
      counters: { total: '1', confirmados: '0', pendientes: '1' },
    })

    const result = await invitadosService.getInvitados({ page: 1, limit: 10 })

    expect(result.data).toHaveLength(1)
    expect(result.pagination).toMatchObject({
      total: 1,
      confirmados: 0,
      pendientes: 1,
      page: 1,
      totalPages: 1,
    })
  })

  it('retorna totalPages = 0 cuando no hay resultados', async () => {
    invitadosRepository.findAllPaginated = vi.fn().mockResolvedValue({
      rows: [],
      counters: { total: '0', confirmados: '0', pendientes: '0' },
    })

    const result = await invitadosService.getInvitados({})
    expect(result.pagination.totalPages).toBe(0)
  })

  it('aplica límite máximo de 200 al parsear paginación', async () => {
    invitadosRepository.findAllPaginated = vi.fn().mockResolvedValue({
      rows: [],
      counters: { total: '0', confirmados: '0', pendientes: '0' },
    })

    await invitadosService.getInvitados({ limit: 9999 })

    const callArgs = invitadosRepository.findAllPaginated.mock.calls[0][1]
    expect(callArgs.limit).toBe(200)
  })
})

// ─── createInvitado ────────────────────────────────────────────────
describe('createInvitado', () => {
  it('crea invitado cuando no hay duplicado', async () => {
    invitadosRepository.findDuplicate = vi.fn().mockResolvedValue(null)
    invitadosRepository.create = vi.fn().mockResolvedValue(mockInvitado)

    const result = await invitadosService.createInvitado(
      { evento_id: '1', nombre: 'María', apellido: 'García', categoria: 'VIP' },
      ACTOR_ID
    )

    expect(result).toEqual(mockInvitado)
    expect(activityService.register).toHaveBeenCalledOnce()
  })

  it('lanza 400 cuando hay duplicado', async () => {
    invitadosRepository.create = vi.fn().mockResolvedValue(null)

    await expect(
      invitadosService.createInvitado(
        { nombre: 'María', apellido: 'García', categoria: 'General' },
        ACTOR_ID
      )
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('lanza 400 con categoría inválida', async () => {
    await expect(
      invitadosService.createInvitado({ nombre: 'Test', categoria: 'Inexistente' }, ACTOR_ID)
    ).rejects.toMatchObject({ statusCode: 400 })
  })
})

// ─── updateInvitado ────────────────────────────────────────────────
describe('updateInvitado', () => {
  it('actualiza correctamente un invitado existente', async () => {
    const updated = { ...mockInvitado, confirmado: true }
    invitadosRepository.findById = vi.fn().mockResolvedValue(mockInvitado)
    invitadosRepository.updateById = vi.fn().mockResolvedValue(updated)

    const result = await invitadosService.updateInvitado(
      mockInvitado.id,
      { confirmado: true },
      ACTOR_ID
    )

    expect(result.confirmado).toBe(true)
    expect(activityService.register).toHaveBeenCalledOnce()
  })

  it('lanza 404 cuando el invitado no existe', async () => {
    invitadosRepository.findById = vi.fn().mockResolvedValue(null)

    await expect(
      invitadosService.updateInvitado('no-existe', { confirmado: true }, ACTOR_ID)
    ).rejects.toMatchObject({ statusCode: 404 })
  })

  it('lanza 400 si no se pasan campos actualizables', async () => {
    invitadosRepository.findById = vi.fn().mockResolvedValue(mockInvitado)

    await expect(
      invitadosService.updateInvitado(mockInvitado.id, {}, ACTOR_ID)
    ).rejects.toMatchObject({ statusCode: 400 })
  })
})

// ─── deleteInvitado ────────────────────────────────────────────────
describe('deleteInvitado', () => {
  it('elimina un invitado existente y registra actividad', async () => {
    invitadosRepository.findById = vi.fn().mockResolvedValue(mockInvitado)
    invitadosRepository.deleteById = vi.fn().mockResolvedValue(undefined)

    await invitadosService.deleteInvitado(mockInvitado.id, ACTOR_ID)

    expect(invitadosRepository.deleteById).toHaveBeenCalledWith(mockInvitado.id)
    expect(activityService.register).toHaveBeenCalledOnce()
  })

  it('lanza 404 si el invitado no existe', async () => {
    invitadosRepository.findById = vi.fn().mockResolvedValue(null)

    await expect(
      invitadosService.deleteInvitado('no-existe', ACTOR_ID)
    ).rejects.toMatchObject({ statusCode: 404 })
  })
})

// ─── importInvitados ────────────────────────────────────────────────
describe('importInvitados', () => {
  it('importa invitados válidos y omite duplicados', async () => {
    invitadosRepository.batchCreate = vi.fn().mockResolvedValue({
      insertados: [mockInvitado],
      duplicados: 1,
    })

    const result = await invitadosService.importInvitados(
      {
        evento_id: '1',
        invitados: [
          { nombre: 'Ana', apellido: 'Pérez' },
          { nombre: 'Ana', apellido: 'Pérez' }, // duplicado
        ],
      },
      ACTOR_ID
    )

    expect(result.importados).toBe(1)
    expect(result.duplicados).toBe(1)
    expect(result.errores).toBe(0)
  })

  it('lanza 400 con array vacío', async () => {
    await expect(
      invitadosService.importInvitados({ invitados: [] }, ACTOR_ID)
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('reporta error por invitado sin nombre', async () => {
    invitadosRepository.findDuplicate = vi.fn().mockResolvedValue(null)

    const result = await invitadosService.importInvitados(
      { invitados: [{ apellido: 'SinNombre' }] },
      ACTOR_ID
    )

    expect(result.errores).toBe(1)
    expect(result.importados).toBe(0)
  })
})
