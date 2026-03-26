import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/config/database.js')
vi.mock('../../src/utils/logger.js', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() }
}))

import { activityService } from '../../src/services/activityService.js'
import { query } from '../../src/config/database.js'
import { logger } from '../../src/utils/logger.js'

describe('activityService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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
      ['uuid-1', 'Login exitoso', JSON.stringify({ ip: '127.0.0.1' })]
    )
  })

  it('absorbe el error de BD y lo registra en el logger', async () => {
    query.mockRejectedValue(new Error('DB error'))

    // No debe lanzar — el servicio absorbe el fallo para no interrumpir la operación principal
    await expect(
      activityService.register({ usuarioId: 'uuid-1', accion: 'test', detalles: {} })
    ).resolves.toBeUndefined()

    expect(logger.warn).toHaveBeenCalledOnce()
    expect(logger.warn).toHaveBeenCalledWith(
      'No se pudo registrar actividad',
      expect.objectContaining({ accion: 'test', message: 'DB error' })
    )
  })
})
