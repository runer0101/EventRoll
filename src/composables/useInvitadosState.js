import { ref, computed } from 'vue'

/**
 * Estado reactivo para useInvitados
 * Separado para facilitar testing y reutilización
 */
export function useInvitadosState({
  textoBusqueda,
  filtroCategoria,
  filtroEstado,
  ordenAscendente,
}) {
  const invitados = ref([])
  const modoBackend = ref(true)
  const isFetching = ref(false)
  const backendPagination = ref({
    total: 0,
    confirmados: 0,
    pendientes: 0,
    page: 1,
    limit: 50,
    totalPages: 1
  })
  const sillasDisponibles = ref(100)
  const currentPage = ref(1)
  const pageSize = ref(50)
  const editandoId = ref(null)
  const nombreEditando = ref('')
  const apellidoEditando = ref('')

  // Computed properties
  const invitadosFiltrados = computed(() => {
    if (modoBackend.value) {
      return invitados.value
    }

    let resultado = [...invitados.value]

    if (textoBusqueda.value.trim() !== '') {
      const termino = textoBusqueda.value.toLowerCase()
      resultado = resultado.filter(inv => {
        const coincideNombre = inv.nombre.toLowerCase().includes(termino)
        const coincideApellido = inv.apellido.toLowerCase().includes(termino)
        const nombreCompleto = `${inv.nombre} ${inv.apellido}`.toLowerCase()
        const coincideCompleto = nombreCompleto.includes(termino)
        return coincideNombre || coincideApellido || coincideCompleto
      })
    }

    if (filtroCategoria.value !== '') {
      resultado = resultado.filter(inv => inv.categoria === filtroCategoria.value)
    }

    if (filtroEstado.value === 'confirmado') {
      resultado = resultado.filter(inv => inv.confirmado)
    } else if (filtroEstado.value === 'pendiente') {
      resultado = resultado.filter(inv => !inv.confirmado)
    }

    resultado.sort((a, b) => {
      const apellidoA = a.apellido.toLowerCase()
      const apellidoB = b.apellido.toLowerCase()
      const nombreA = a.nombre.toLowerCase()
      const nombreB = b.nombre.toLowerCase()

      if (ordenAscendente.value) {
        if (apellidoA < apellidoB) return -1
        if (apellidoA > apellidoB) return 1
        if (nombreA < nombreB) return -1
        if (nombreA > nombreB) return 1
        return 0
      }

      if (apellidoA > apellidoB) return -1
      if (apellidoA < apellidoB) return 1
      if (nombreA > nombreB) return -1
      if (nombreA < nombreB) return 1
      return 0
    })

    return resultado
  })

  const invitadosMostrados = computed(() => invitadosFiltrados.value)

  const totalFiltrados = computed(() => {
    return modoBackend.value ? backendPagination.value.total : invitadosFiltrados.value.length
  })

  const hayFiltrosActivos = computed(() => {
    return Boolean(textoBusqueda.value.trim() || filtroCategoria.value || filtroEstado.value)
  })

  const invitadosConfirmados = computed(() => {
    if (modoBackend.value) return backendPagination.value.confirmados
    return invitados.value.filter(inv => inv.confirmado).length
  })

  const invitadosPendientes = computed(() => {
    if (modoBackend.value) return backendPagination.value.pendientes
    return invitados.value.filter(inv => !inv.confirmado).length
  })

  const sillasRestantes = computed(() => {
    const restantes = sillasDisponibles.value - invitadosConfirmados.value
    return Math.max(0, restantes)
  })

  const porcentajeOcupacion = computed(() => {
    if (sillasDisponibles.value === 0) return 0
    return Math.round((invitadosConfirmados.value / sillasDisponibles.value) * 100)
  })

  return {
    invitados,
    modoBackend,
    isFetching,
    backendPagination,
    sillasDisponibles,
    currentPage,
    pageSize,
    editandoId,
    nombreEditando,
    apellidoEditando,
    invitadosFiltrados,
    invitadosMostrados,
    totalFiltrados,
    hayFiltrosActivos,
    invitadosConfirmados,
    invitadosPendientes,
    sillasRestantes,
    porcentajeOcupacion,
  }
}
