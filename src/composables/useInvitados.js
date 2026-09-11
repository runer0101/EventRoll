import { watch } from 'vue'
import { useInvitadosState } from './useInvitadosState.js'
import { useInvitadosData } from './useInvitadosData.js'
import { useInvitadosCRUD } from './useInvitadosCRUD.js'

/**
 * Composable principal para gestión de invitados
 * Orquesta los sub-composables: state, data, y CRUD
 */
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
  // Estado reactivo
  const state = useInvitadosState({
    textoBusqueda,
    filtroCategoria,
    filtroEstado,
    ordenAscendente,
  })

  // Capa de datos
  const data = useInvitadosData({
    ...state,
    textoBusqueda,
    filtroCategoria,
    filtroEstado,
    ordenAscendente,
    eventoIdActual,
    toast,
  })

  // Operaciones CRUD
  const crud = useInvitadosCRUD({
    ...state,
    cargarDatos: data.cargarDatos,
    permisos,
    eventoIdActual,
    registrarActividad,
    toast,
    loading,
    nuevoNombre,
    nuevoApellido,
    nuevaCategoria,
  })

  // Watcher para búsqueda (registrar en historial)
  watch(textoBusqueda, (newValue, oldValue) => {
    if (newValue && newValue.length >= 3 && newValue !== oldValue) {
      setTimeout(() => {
        if (textoBusqueda.value === newValue) {
          addSearch(newValue)
        }
      }, 1000)
    }
  })

  return {
    // Estado
    invitados: state.invitados,
    modoBackend: state.modoBackend,
    isFetching: state.isFetching,
    backendPagination: state.backendPagination,
    sillasDisponibles: state.sillasDisponibles,
    currentPage: state.currentPage,
    pageSize: state.pageSize,
    editandoId: state.editandoId,
    nombreEditando: state.nombreEditando,
    apellidoEditando: state.apellidoEditando,
    
    // Computed
    invitadosConfirmados: state.invitadosConfirmados,
    invitadosPendientes: state.invitadosPendientes,
    sillasRestantes: state.sillasRestantes,
    porcentajeOcupacion: state.porcentajeOcupacion,
    totalFiltrados: state.totalFiltrados,
    hayFiltrosActivos: state.hayFiltrosActivos,
    invitadosFiltrados: state.invitadosFiltrados,
    invitadosMostrados: state.invitadosMostrados,
    
    // Data
    cargarDatos: data.cargarDatos,
    cargarDatosLocalStorage: data.cargarDatosLocalStorage,
    guardarDatos: data.guardarDatos,
    programarRecargaBackend: data.programarRecargaBackend,
    irAPagina: data.irAPagina,
    
    // CRUD
    agregarInvitado: crud.agregarInvitado,
    toggleConfirmacion: crud.toggleConfirmacion,
    eliminarInvitado: crud.eliminarInvitado,
    iniciarEdicion: crud.iniciarEdicion,
    guardarEdicion: crud.guardarEdicion,
    cancelarEdicion: crud.cancelarEdicion,
  }
}
