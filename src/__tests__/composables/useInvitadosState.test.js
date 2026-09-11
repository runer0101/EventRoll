import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useInvitadosState } from '../../composables/useInvitadosState.js'

describe('useInvitadosState', () => {
  let textoBusqueda
  let filtroCategoria
  let filtroEstado
  let ordenAscendente

  beforeEach(() => {
    textoBusqueda = ref('')
    filtroCategoria = ref('')
    filtroEstado = ref('')
    ordenAscendente = ref(true)
  })

  it('inicia con estado vacío', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    expect(state.invitados.value).toEqual([])
    expect(state.modoBackend.value).toBe(true)
    expect(state.isFetching.value).toBe(false)
    expect(state.currentPage.value).toBe(1)
    expect(state.pageSize.value).toBe(50)
  })

  it('invitadosFiltrados retorna todos cuando no hay filtros (modo local)', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    state.modoBackend.value = false
    state.invitados.value = [
      { id: 1, nombre: 'Juan', apellido: 'Pérez', categoria: 'General', confirmado: false },
      { id: 2, nombre: 'María', apellido: 'García', categoria: 'VIP', confirmado: true },
    ]

    expect(state.invitadosFiltrados.value).toHaveLength(2)
  })

  it('filtra por texto de búsqueda (modo local)', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    state.modoBackend.value = false
    state.invitados.value = [
      { id: 1, nombre: 'Juan', apellido: 'Pérez', categoria: 'General', confirmado: false },
      { id: 2, nombre: 'María', apellido: 'García', categoria: 'VIP', confirmado: true },
    ]

    textoBusqueda.value = 'Juan'

    expect(state.invitadosFiltrados.value).toHaveLength(1)
    expect(state.invitadosFiltrados.value[0].nombre).toBe('Juan')
  })

  it('filtra por categoría (modo local)', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    state.modoBackend.value = false
    state.invitados.value = [
      { id: 1, nombre: 'Juan', apellido: 'Pérez', categoria: 'General', confirmado: false },
      { id: 2, nombre: 'María', apellido: 'García', categoria: 'VIP', confirmado: true },
    ]

    filtroCategoria.value = 'VIP'

    expect(state.invitadosFiltrados.value).toHaveLength(1)
    expect(state.invitadosFiltrados.value[0].categoria).toBe('VIP')
  })

  it('filtra por estado de confirmación (modo local)', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    state.modoBackend.value = false
    state.invitados.value = [
      { id: 1, nombre: 'Juan', apellido: 'Pérez', categoria: 'General', confirmado: false },
      { id: 2, nombre: 'María', apellido: 'García', categoria: 'VIP', confirmado: true },
    ]

    filtroEstado.value = 'confirmado'

    expect(state.invitadosFiltrados.value).toHaveLength(1)
    expect(state.invitadosFiltrados.value[0].confirmado).toBe(true)
  })

  it('ordena ascendente por apellido y nombre (modo local)', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    state.modoBackend.value = false
    state.invitados.value = [
      { id: 1, nombre: 'María', apellido: 'García', categoria: 'General', confirmado: false },
      { id: 2, nombre: 'Juan', apellido: 'Pérez', categoria: 'VIP', confirmado: true },
    ]

    ordenAscendente.value = true

    expect(state.invitadosFiltrados.value[0].apellido).toBe('García')
    expect(state.invitadosFiltrados.value[1].apellido).toBe('Pérez')
  })

  it('ordena descendente por apellido y nombre (modo local)', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    state.modoBackend.value = false
    state.invitados.value = [
      { id: 1, nombre: 'María', apellido: 'García', categoria: 'General', confirmado: false },
      { id: 2, nombre: 'Juan', apellido: 'Pérez', categoria: 'VIP', confirmado: true },
    ]

    ordenAscendente.value = false

    expect(state.invitadosFiltrados.value[0].apellido).toBe('Pérez')
    expect(state.invitadosFiltrados.value[1].apellido).toBe('García')
  })

  it('calcula invitadosConfirmados correctamente (modo local)', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    state.modoBackend.value = false
    state.invitados.value = [
      { id: 1, nombre: 'Juan', apellido: 'Pérez', categoria: 'General', confirmado: false },
      { id: 2, nombre: 'María', apellido: 'García', categoria: 'VIP', confirmado: true },
      { id: 3, nombre: 'Pedro', apellido: 'López', categoria: 'Familia', confirmado: true },
    ]

    expect(state.invitadosConfirmados.value).toBe(2)
  })

  it('calcula invitadosPendientes correctamente (modo local)', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    state.modoBackend.value = false
    state.invitados.value = [
      { id: 1, nombre: 'Juan', apellido: 'Pérez', categoria: 'General', confirmado: false },
      { id: 2, nombre: 'María', apellido: 'García', categoria: 'VIP', confirmado: true },
      { id: 3, nombre: 'Pedro', apellido: 'López', categoria: 'Familia', confirmado: true },
    ]

    expect(state.invitadosPendientes.value).toBe(1)
  })

  it('calcula sillasRestantes correctamente (modo local)', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    state.modoBackend.value = false
    state.sillasDisponibles.value = 100
    state.invitados.value = [
      { id: 1, nombre: 'Juan', apellido: 'Pérez', categoria: 'General', confirmado: true },
      { id: 2, nombre: 'María', apellido: 'García', categoria: 'VIP', confirmado: true },
    ]

    expect(state.sillasRestantes.value).toBe(98)
  })

  it('sillasRestantes no puede ser negativo (modo local)', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    state.modoBackend.value = false
    state.sillasDisponibles.value = 1
    state.invitados.value = [
      { id: 1, nombre: 'Juan', apellido: 'Pérez', categoria: 'General', confirmado: true },
      { id: 2, nombre: 'María', apellido: 'García', categoria: 'VIP', confirmado: true },
    ]

    expect(state.sillasRestantes.value).toBe(0)
  })

  it('calcula porcentajeOcupacion correctamente (modo local)', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    state.modoBackend.value = false
    state.sillasDisponibles.value = 100
    state.invitados.value = [
      { id: 1, nombre: 'Juan', apellido: 'Pérez', categoria: 'General', confirmado: true },
      { id: 2, nombre: 'María', apellido: 'García', categoria: 'VIP', confirmado: true },
    ]

    expect(state.porcentajeOcupacion.value).toBe(2)
  })

  it('hayFiltrosActivos retorna true cuando hay búsqueda', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    textoBusqueda.value = 'Juan'

    expect(state.hayFiltrosActivos.value).toBe(true)
  })

  it('hayFiltrosActivos retorna true cuando hay categoría', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    filtroCategoria.value = 'VIP'

    expect(state.hayFiltrosActivos.value).toBe(true)
  })

  it('hayFiltrosActivos retorna true cuando hay estado', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    filtroEstado.value = 'confirmado'

    expect(state.hayFiltrosActivos.value).toBe(true)
  })

  it('hayFiltrosActivos retorna false cuando no hay filtros', () => {
    const state = useInvitadosState({
      textoBusqueda,
      filtroCategoria,
      filtroEstado,
      ordenAscendente,
    })

    expect(state.hayFiltrosActivos.value).toBe(false)
  })
})
