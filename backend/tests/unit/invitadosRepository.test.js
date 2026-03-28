import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/config/database.js', () => ({
  query: vi.fn(),
}))

import { invitadosRepository } from '../../src/repositories/invitadosRepository.js'
import { query } from '../../src/config/database.js'

const mockInvitado = {
  id: 'inv-uuid-1',
  evento_id: 'ev-uuid-1',
  nombre: 'María',
  apellido: 'García',
  categoria: 'VIP',
  confirmado: false,
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── findAllPaginated ────────────────────────────────────────────────
describe('findAllPaginated', () => {
  it('retorna rows limpios y contadores correctos', async () => {
    const rawRow = {
      ...mockInvitado,
      _total: '5',
      _confirmados: '2',
      _pendientes: '3',
    }
    query.mockResolvedValue({ rows: [rawRow] })

    const { rows, counters } = await invitadosRepository.findAllPaginated(
      { evento_id: 'ev-uuid-1' },
      { limit: 10, offset: 0, sortDir: 'ASC' }
    )

    expect(rows).toHaveLength(1)
    expect(rows[0]).not.toHaveProperty('_total')
    expect(counters).toEqual({ total: '5', confirmados: '2', pendientes: '3' })
  })

  it('retorna contadores en cero cuando no hay resultados', async () => {
    query.mockResolvedValue({ rows: [] })

    const { rows, counters } = await invitadosRepository.findAllPaginated(
      {},
      { limit: 10, offset: 0 }
    )

    expect(rows).toHaveLength(0)
    expect(counters).toEqual({ total: '0', confirmados: '0', pendientes: '0' })
  })

  it('usa DESC cuando sortDir es DESC', async () => {
    query.mockResolvedValue({ rows: [] })

    await invitadosRepository.findAllPaginated({}, { limit: 10, offset: 0, sortDir: 'DESC' })

    const sql = query.mock.calls[0][0]
    expect(sql).toContain('DESC')
  })
})

// ─── findById ─────────────────────────────────────────────────────────
describe('findById', () => {
  it('retorna el invitado cuando existe', async () => {
    query.mockResolvedValue({ rows: [mockInvitado] })

    const result = await invitadosRepository.findById('inv-uuid-1')
    expect(result).toEqual(mockInvitado)
  })

  it('retorna null cuando no existe', async () => {
    query.mockResolvedValue({ rows: [] })

    const result = await invitadosRepository.findById('no-existe')
    expect(result).toBeNull()
  })
})

// ─── findDuplicate ────────────────────────────────────────────────────
describe('findDuplicate', () => {
  it('retorna fila si hay duplicado', async () => {
    query.mockResolvedValue({ rows: [{ id: 'inv-uuid-1' }] })

    const result = await invitadosRepository.findDuplicate({
      eventoId: 'ev-uuid-1',
      nombre: 'María',
      apellido: 'García',
    })
    expect(result).toEqual({ id: 'inv-uuid-1' })
  })

  it('retorna null si no hay duplicado', async () => {
    query.mockResolvedValue({ rows: [] })

    const result = await invitadosRepository.findDuplicate({
      eventoId: 'ev-uuid-1',
      nombre: 'Ana',
    })
    expect(result).toBeNull()
  })
})

// ─── create ──────────────────────────────────────────────────────────
describe('create', () => {
  it('retorna el invitado creado', async () => {
    query.mockResolvedValue({ rows: [mockInvitado] })

    const result = await invitadosRepository.create({
      evento_id: 'ev-uuid-1',
      nombre: 'María',
      apellido: 'García',
      categoria: 'VIP',
      confirmado: false,
    })
    expect(result).toEqual(mockInvitado)
  })

  it('retorna null en conflicto (ON CONFLICT DO NOTHING)', async () => {
    query.mockResolvedValue({ rows: [] })

    const result = await invitadosRepository.create({
      nombre: 'Duplicado',
    })
    expect(result).toBeNull()
  })
})

// ─── batchCreate ──────────────────────────────────────────────────────
describe('batchCreate', () => {
  it('retorna array vacío y 0 duplicados si no hay invitados', async () => {
    const result = await invitadosRepository.batchCreate([])
    expect(result).toEqual({ insertados: [], duplicados: 0 })
    expect(query).not.toHaveBeenCalled()
  })

  it('calcula duplicados correctamente', async () => {
    query.mockResolvedValue({ rows: [mockInvitado] })

    const result = await invitadosRepository.batchCreate([
      { nombre: 'María', apellido: 'García' },
      { nombre: 'Ana', apellido: 'Pérez' },
    ])

    expect(result.insertados).toHaveLength(1)
    expect(result.duplicados).toBe(1)
  })
})

// ─── updateById ──────────────────────────────────────────────────────
describe('updateById', () => {
  it('retorna el invitado actualizado', async () => {
    const updated = { ...mockInvitado, confirmado: true }
    query.mockResolvedValue({ rows: [updated] })

    const result = await invitadosRepository.updateById('inv-uuid-1', { confirmado: true })
    expect(result?.confirmado).toBe(true)
  })

  it('retorna null si no hay campos válidos', async () => {
    const result = await invitadosRepository.updateById('inv-uuid-1', {})
    expect(result).toBeNull()
    expect(query).not.toHaveBeenCalled()
  })
})

// ─── deleteById ──────────────────────────────────────────────────────
describe('deleteById', () => {
  it('retorna el invitado eliminado', async () => {
    query.mockResolvedValue({ rows: [mockInvitado] })

    const result = await invitadosRepository.deleteById('inv-uuid-1')
    expect(result).toEqual(mockInvitado)
  })

  it('retorna null si no existía', async () => {
    query.mockResolvedValue({ rows: [] })

    const result = await invitadosRepository.deleteById('no-existe')
    expect(result).toBeNull()
  })
})
