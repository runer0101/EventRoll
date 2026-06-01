import { ref, computed, watch } from 'vue'
import { invitadosAPI } from '../services/api'

export function useInvitados({
  permisos,
  eventoIdActual,
  registrarActividad,
  toast,
  loading,
  addSearch,
  filtroCategoria,
  filtroEstado,
  ordenAscendente,
  textoBusqueda,
  nuevoNombre,
  nuevoApellido,
  nuevaCategoria,
}) {
  const { success, error, warning } = toast
  const { show: showLoading, hide: hideLoading } = loading

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

  watch([invitados, sillasDisponibles], () => {
    guardarDatos()
  }, { deep: true })

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

  watch(textoBusqueda, (newValue, oldValue) => {
    if (newValue && newValue.length >= 3 && newValue !== oldValue) {
      setTimeout(() => {
        if (textoBusqueda.value === newValue) {
          addSearch(newValue)
        }
      }, 1000)
    }
  })

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

  function irAPagina(page) {
    const pageNum = Number(page)
    if (!Number.isInteger(pageNum)) return
    if (pageNum < 1 || pageNum > backendPagination.value.totalPages) return
    if (pageNum === currentPage.value) return
    currentPage.value = pageNum
  }

  async function agregarInvitado() {
    if (!permisos.value.agregarInvitados) {
      error('No tienes permiso para agregar invitados', 'Acceso Denegado')
      return
    }

    const nombre = nuevoNombre.value.trim()
    const apellido = nuevoApellido.value.trim()

    if (nombre === '') {
      warning('Por favor escribe al menos el nombre', 'Nombre Requerido')
      return
    }

    const existe = invitados.value.some(inv =>
      inv.nombre.toLowerCase() === nombre.toLowerCase() &&
      inv.apellido.toLowerCase() === apellido.toLowerCase()
    )

    if (existe) {
      warning('Este invitado ya está en la lista', 'Duplicado')
      return
    }

    if (sillasRestantes.value === 0) {
      warning('No hay sillas disponibles', 'Sillas Agotadas')
    }

    try {
      if (modoBackend.value) {
        showLoading({ message: 'Agregando invitado...' })

        const invitadoPayload = {
          nombre,
          apellido,
          categoria: nuevaCategoria.value,
          confirmado: false,
          ...(eventoIdActual.value ? { evento_id: eventoIdActual.value } : {})
        }

        const response = await invitadosAPI.create(invitadoPayload)

        if (response.success && response.data) {
          await cargarDatos(currentPage.value)
          success(`Invitado ${nombre} ${apellido} agregado`, 'Invitado Agregado')
        }

        hideLoading()
      } else {
        invitados.value.push({
          id: Date.now(),
          nombre,
          apellido,
          categoria: nuevaCategoria.value,
          confirmado: false
        })
        success(`Invitado ${nombre} ${apellido} agregado`, 'Invitado Agregado')
      }

      registrarActividad(`Agregó invitado: ${nombre} ${apellido}`)

      nuevoNombre.value = ''
      nuevoApellido.value = ''
      nuevaCategoria.value = 'General'
    } catch (err) {
      hideLoading()

      error(err.message || 'No se pudo agregar el invitado', 'Error')
    }
  }

  async function toggleConfirmacion(id) {
    if (!permisos.value.confirmarInvitados) {
      error('No tienes permiso para confirmar invitados', 'Acceso Denegado')
      return
    }

    const invitado = invitados.value.find(inv => inv.id === id)

    if (invitado) {
      if (!invitado.confirmado && sillasRestantes.value === 0) {
        warning('No hay sillas disponibles', 'Sillas Agotadas')
        return
      }

      const nuevoEstado = !invitado.confirmado

      try {
        if (modoBackend.value) {
          const response = await invitadosAPI.update(id, {
            confirmado: nuevoEstado
          })

          if (response.success) {
            invitado.confirmado = nuevoEstado
            const mensaje = nuevoEstado ? 'confirmado' : 'marcado como pendiente'
            success(`Invitado ${mensaje}`, 'Estado Actualizado')
          }
        } else {
          invitado.confirmado = nuevoEstado
        }

        const estado = nuevoEstado ? 'confirmó' : 'marcó como pendiente'
        registrarActividad(`${estado} a: ${invitado.nombre} ${invitado.apellido}`)
      } catch (err) {
        error(err.message || 'No se pudo actualizar el estado', 'Error')
      }
    }
  }

  async function eliminarInvitado(id) {
    if (!permisos.value.eliminarInvitados) {
      error('No tienes permiso para eliminar invitados', 'Acceso Denegado')
      return
    }

    const invitado = invitados.value.find(inv => inv.id === id)

    if (confirm(`¿Estás seguro de eliminar a "${invitado.nombre} ${invitado.apellido}"?`)) {
      try {
        if (modoBackend.value) {
          showLoading({ message: 'Eliminando invitado...' })

          const response = await invitadosAPI.delete(id)

          if (response.success) {
            const targetPage = invitados.value.length === 1 && currentPage.value > 1
              ? currentPage.value - 1
              : currentPage.value
            await cargarDatos(targetPage)
            success(`Invitado ${invitado.nombre} ${invitado.apellido} eliminado`, 'Invitado Eliminado')
          }

          hideLoading()
        } else {
          const index = invitados.value.findIndex(inv => inv.id === id)
          invitados.value.splice(index, 1)
          success(`Invitado ${invitado.nombre} ${invitado.apellido} eliminado`, 'Invitado Eliminado')
        }

        registrarActividad(`Eliminó invitado: ${invitado.nombre} ${invitado.apellido}`)
      } catch (err) {
        hideLoading()

        error(err.message || 'No se pudo eliminar el invitado', 'Error')
      }
    }
  }

  function iniciarEdicion(invitado) {
    if (!permisos.value.editarInvitados) {
      warning('No tienes permiso para editar invitados', 'Sin permiso')
      return
    }

    editandoId.value = invitado.id
    nombreEditando.value = invitado.nombre
    apellidoEditando.value = invitado.apellido
  }

  async function guardarEdicion() {
    const nombre = nombreEditando.value.trim()
    const apellido = apellidoEditando.value.trim()

    if (nombre === '') {
      warning('El nombre no puede estar vacío', 'Nombre Requerido')
      return
    }

    const invitado = invitados.value.find(inv => inv.id === editandoId.value)

    if (invitado) {
      try {
        if (modoBackend.value) {
          showLoading({ message: 'Guardando cambios...' })

          const response = await invitadosAPI.update(editandoId.value, {
            nombre,
            apellido
          })

          if (response.success) {
            invitado.nombre = nombre
            invitado.apellido = apellido
            success('Invitado actualizado correctamente', 'Guardado')
          }

          hideLoading()
        } else {
          invitado.nombre = nombre
          invitado.apellido = apellido
          success('Invitado actualizado correctamente', 'Guardado')
        }

        registrarActividad(`Editó invitado: ${nombre} ${apellido}`)
        cancelarEdicion()
      } catch (err) {
        hideLoading()

        error(err.message || 'No se pudo guardar los cambios', 'Error')
      }
    }
  }

  function cancelarEdicion() {
    editandoId.value = null
    nombreEditando.value = ''
    apellidoEditando.value = ''
  }

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
    cargarDatos,
    cargarDatosLocalStorage,
    guardarDatos,
    programarRecargaBackend,
    agregarInvitado,
    toggleConfirmacion,
    eliminarInvitado,
    iniciarEdicion,
    guardarEdicion,
    cancelarEdicion,
    irAPagina,
    invitadosConfirmados,
    invitadosPendientes,
    sillasRestantes,
    porcentajeOcupacion,
    totalFiltrados,
    hayFiltrosActivos,
    invitadosFiltrados,
    invitadosMostrados,
  }
}
