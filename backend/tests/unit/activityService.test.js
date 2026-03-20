import { describe, it, expect, vi } from 'vitest'

vi.mock('../../src/config/database.js')

import { activityService } from '../../src/services/activityService.js'
import { query } from '../../src/config/database.js'

describe('activityService', () => {
  it('inserta un registro de actividad en la BD', async () => {
    query.mockResolvedValue({ rowCount: 1 })

    await activityService.register({
      usuarioId: 'uuid-1',
      accion: 'Login exitoso',
      detalles: { ip: '127.0.0.1' },
    })

    expect(query).toHaveBeenCalledOnce()
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO actividad'),
      ['uuid-1', 'Login exitoso', { ip: '127.0.0.1' }]
    )
  })

  it('propaga el error si falla la BD', async () => {
    query.mockRejectedValue(new Error('DB error'))

    await expect(
      activityService.register({ usuarioId: 'uuid-1', accion: 'test', detalles: {} })
    ).rejects.toThrow('DB error')
  })
})
