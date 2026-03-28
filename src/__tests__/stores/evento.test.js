import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEventoStore } from '../../stores/evento.js'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

const UUID_VALIDO = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const UUID_VALIDO_2 = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorageMock.clear()
  vi.clearAllMocks()
  // Restaurar implementación base (limpia mockReturnValue de tests anteriores)
  localStorageMock.getItem.mockImplementation(() => null)
})

describe('useEventoStore', () => {
  // ─── Estado inicial ────────────────────────────────────────────────
  it('inicia con null si localStorage no tiene UUID válido', () => {
    localStorageMock.getItem.mockReturnValue(null)
    const store = useEventoStore()
    expect(store.eventoId).toBeNull()
  })

  it('inicia con el UUID si localStorage tiene uno válido', () => {
    localStorageMock.getItem.mockReturnValue(UUID_VALIDO)
    const store = useEventoStore()
    expect(store.eventoId).toBe(UUID_VALIDO)
  })

  it('inicia con null si localStorage tiene un valor no-UUID', () => {
    localStorageMock.getItem.mockReturnValue('no-es-uuid')
    const store = useEventoStore()
    expect(store.eventoId).toBeNull()
  })

  // ─── setEventoId ──────────────────────────────────────────────────
  it('setEventoId actualiza el store y persiste en localStorage', () => {
    const store = useEventoStore()
    store.setEventoId(UUID_VALIDO)

    expect(store.eventoId).toBe(UUID_VALIDO)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('eventoIdActual', UUID_VALIDO)
  })

  it('setEventoId ignora valores no-UUID sin cambiar el estado', () => {
    localStorageMock.getItem.mockReturnValue(UUID_VALIDO)
    const store = useEventoStore()

    store.setEventoId('uuid-invalido')

    expect(store.eventoId).toBe(UUID_VALIDO)
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
  })

  it('setEventoId ignora valores null', () => {
    const store = useEventoStore()
    store.setEventoId(null)
    expect(store.eventoId).toBeNull()
  })

  it('setEventoId permite cambiar de un UUID a otro', () => {
    localStorageMock.getItem.mockReturnValue(UUID_VALIDO)
    const store = useEventoStore()

    store.setEventoId(UUID_VALIDO_2)
    expect(store.eventoId).toBe(UUID_VALIDO_2)
  })

  it('setEventoId normaliza el UUID (trim)', () => {
    const store = useEventoStore()
    store.setEventoId(`  ${UUID_VALIDO}  `)
    expect(store.eventoId).toBe(UUID_VALIDO)
  })
})
