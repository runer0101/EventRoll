import { describe, expect, it } from 'vitest'
import { resolveApiBaseUrl, resolveHealthUrl } from '../../utils/apiUrl'

describe('apiUrl utils', () => {
  it('mantiene una URL valida terminada en /api', () => {
    expect(resolveApiBaseUrl('https://eventroll.onrender.com/api')).toBe('https://eventroll.onrender.com/api')
  })

  it('normaliza /api/v1 a /api', () => {
    expect(resolveApiBaseUrl('https://eventroll.onrender.com/api/v1')).toBe('https://eventroll.onrender.com/api')
  })

  it('agrega /api cuando el origen no incluye path', () => {
    expect(resolveApiBaseUrl('https://eventroll.onrender.com')).toBe('https://eventroll.onrender.com/api')
  })

  it('resuelve URL de health desde /api', () => {
    expect(resolveHealthUrl('https://eventroll.onrender.com/api')).toBe('https://eventroll.onrender.com/health')
  })
})
