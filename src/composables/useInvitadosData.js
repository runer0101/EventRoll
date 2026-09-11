import { watch } from 'vue'
import { invitadosAPI } from '../services/api'

/**
 * Capa de datos para useInvitados
 * Maneja carga desde backend y localStorage
 */
export function useInvitadosData({
  invitados,
  modoBackend,
  isFetching,
  backendPagination,
  sillasDisponibles,
  currentPage,
  pageSize,
  textoBusqueda,
  filtroCategoria,
  filtroEstado,
  ordenAscendente,
  eventoIdActual,
  toast,
}) {
  const { warning } = toast

  let _fetchSeq = 0
  let recargaBackendTimer = null

  async function cargarDatos(page = currentPage.value) {
    const mySeq = ++_fetchSeq
    isFetching.value = true

    try {
      const filters = {
        page,
        limit: pageSize.value,
        order: ordenAscendente.value ? 'asc' : 'desc'
      }

      if (eventoIdActual.value) filters.evento_id = eventoIdActual.value
      if (filtroCategoria.value) filters.categoria = filtroCategoria.value
      if (textoBusqueda.value.trim()) filters.search = textoBusqueda.value.trim()
      if (filtroEstado.value === 'confirmado') filters.confirmado = true
      if (filtroEstado.value === 'pendiente') filters.confirmado = false

      const response = await invitadosAPI.getAll(filters)

      if (mySeq !== _fetchSeq) return

      if (response.success && Array.isArray(response.data)) {
        invitados.value = response.data.map(inv => ({
          id: inv.id,
          nombre: inv.nombre,
          apellido: inv.apellido || '',
          categoria: inv.categoria || 'General',
          confirmado: inv.confirmado || false
        }))

        if (response.pagination) {
          backendPagination.value = {
            total: Number(response.pagination.total || 0),
            confirmados: Number(response.pagination.confirmados || 0),
            pendientes: Number(response.pagination.pendientes || 0),
            page: Number(response.pagination.page || 1),
            limit: Number(response.pagination.limit || pageSize.value),
            totalPages: Math.max(1, Number(response.pagination.totalPages || 1))
          }
          currentPage.value = backendPagination.value.page
        } else {
          backendPagination.value = {
            total: invitados.value.length,
            confirmados: invitados.value.filter(inv => inv.confirmado).length,
            pendientes: invitados.value.filter(inv => !inv.confirmado).length,
            page: 1,
            limit: pageSize.value,
            totalPages: 1
          }
        }

        modoBackend.value = true
      }
    } catch {
      if (mySeq !== _fetchSeq) return
      modoBackend.value = false
      cargarDatosLocalStorage()
    } finally {
      if (mySeq === _fetchSeq) isFetching.value = false
    }
  }

  function cargarDatosLocalStorage() {
    try {
      const invitadosGuardados = localStorage.getItem('invitados')
      const sillasGuardadas = localStorage.getItem('sillasDisponibles')

      if (invitadosGuardados) {
        const parsed = JSON.parse(invitadosGuardados)
        if (Array.isArray(parsed)) {
          invitados.value = parsed
        }
      }

      if (sillasGuardadas) {
        const parsed = parseInt(sillasGuardadas, 10)
        if (!isNaN(parsed) && parsed >= 0) {
          sillasDisponibles.value = parsed
        }
      }
    } catch {
      invitados.value = []
      sillasDisponibles.value = 100
    }
  }

  function guardarDatos() {
    if (!modoBackend.value) {
      try {
        localStorage.setItem('invitados', JSON.stringify(invitados.value))
        localStorage.setItem('sillasDisponibles', sillasDisponibles.value.toString())
      } catch (storageErr) {
        if (storageErr.name === 'QuotaExceededError') {
          warning('Espacio de almacenamiento lleno. Algunos datos pueden no guardarse.', 'Almacenamiento')
        }
      }
    }
  }

  function programarRecargaBackend(resetPage = true, delay = 250) {
    if (!modoBackend.value) return

    if (recargaBackendTimer) {
      clearTimeout(recargaBackendTimer)
    }

    recargaBackendTimer = setTimeout(async () => {
      if (resetPage && currentPage.value !== 1) {
        currentPage.value = 1
        return
      }
      await cargarDatos(currentPage.value)
    }, delay)
  }

  function irAPagina(page) {
    const pageNum = Number(page)
    if (!Number.isInteger(pageNum)) return
    if (pageNum < 1 || pageNum > backendPagination.value.totalPages) return
    if (pageNum === currentPage.value) return
    currentPage.value = pageNum
  }

  // Watchers para recarga automática
  watch([invitados, sillasDisponibles], () => {
    guardarDatos()
  }, { deep: true })

  watch([filtroCategoria, filtroEstado, ordenAscendente, pageSize, eventoIdActual], () => {
    programarRecargaBackend(true, 250)
  })

  watch(textoBusqueda, () => {
    programarRecargaBackend(true, 400)
  })

  watch(currentPage, (newPage, oldPage) => {
    if (modoBackend.value && newPage !== oldPage) {
      cargarDatos(newPage)
    }
  })

  return {
    cargarDatos,
    cargarDatosLocalStorage,
    guardarDatos,
    programarRecargaBackend,
    irAPagina,
  }
}
