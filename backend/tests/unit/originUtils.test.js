import { describe, expect, it } from 'vitest'
import {
  normalizeOrigin,
  parseAllowedOrigins,
  isOriginAllowed,
  isRefererAllowed,
} from '../../src/utils/origin.js'

describe('origin utils', () => {
  it('normaliza una URL con ruta a solo origin', () => {
    expect(normalizeOrigin('https://runer0101.github.io/EventRoll/')).toBe('https://runer0101.github.io')
  })

  it('retorna null para protocolos no permitidos', () => {
    expect(normalizeOrigin('javascript:alert(1)')).toBeNull()
  })

  it('parsea y deduplica origenes permitidos', () => {
    const origins = parseAllowedOrigins('https://a.com/app, https://a.com, https://b.com/path')
    expect(origins).toEqual(['https://a.com', 'https://b.com'])
  })

  it('valida origin contra lista normalizada', () => {
    const allowed = parseAllowedOrigins('https://runer0101.github.io/EventRoll')
    expect(isOriginAllowed('https://runer0101.github.io', allowed)).toBe(true)
  })

  it('valida referer por origin y no por path exacto', () => {
    const allowed = parseAllowedOrigins('https://runer0101.github.io/EventRoll')
    expect(isRefererAllowed('https://runer0101.github.io/EventRoll/#/login', allowed)).toBe(true)
  })
})
