import { invitadosAPI } from '../services/api'

/**
 * Operaciones CRUD para useInvitados
 * Maneja agregar, editar, eliminar y toggle confirmación
 */
export function useInvitadosCRUD({
  invitados,
  modoBackend,
  currentPage,
  backendPagination,
  sillasRestantes,
  editandoId,
  nombreEditando,
  apellidoEditando,
  cargarDatos,
  permisos,
  eventoIdActual,
  registrarActividad,
  toast,
  loading,
  nuevoNombre,
  nuevoApellido,
  nuevaCategoria,
}) {
  const { success, error, warning } = toast
  const { show: showLoading, hide: hideLoading } = loading

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
    agregarInvitado,
    toggleConfirmacion,
    eliminarInvitado,
    iniciarEdicion,
    guardarEdicion,
    cancelarEdicion,
  }
}
