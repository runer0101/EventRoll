import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useInvitadosCRUD } from '../../composables/useInvitadosCRUD.js'

vi.mock('../../services/api.js', () => ({
  invitadosAPI: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

import { invitadosAPI } from '../../services/api.js'

describe('useInvitadosCRUD', () => {
  let state
  let mockToast
  let mockLoading
  let mockPermisos
  let mockRegistrarActividad

  beforeEach(() => {
    vi.clearAllMocks()

    state = {
      invitados: ref([]),
      modoBackend: ref(true),
      currentPage: ref(1),
      backendPagination: ref({ totalPages: 1 }),
      sillasRestantes: ref(100),
      editandoId: ref(null),
      nombreEditando: ref(''),
      apellidoEditando: ref(''),
    }

    mockToast = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    }

    mockLoading = {
      show: vi.fn(),
      hide: vi.fn(),
    }

    mockPermisos = ref({
      agregarInvitados: true,
      editarInvitados: true,
      eliminarInvitados: true,
      confirmarInvitados: true,
    })

    mockRegistrarActividad = vi.fn()
  })

  describe('agregarInvitado', () => {
    it('agrega invitado exitosamente en modo backend', async () => {
      const nuevoNombre = ref('Juan')
      const nuevoApellido = ref('Pérez')
      const nuevaCategoria = ref('General')
      const cargarDatos = vi.fn().mockResolvedValue()

      invitadosAPI.create.mockResolvedValue({ success: true, data: { id: '1' } })

      const crud = useInvitadosCRUD({
        ...state,
        cargarDatos,
        permisos: mockPermisos,
        eventoIdActual: ref('evento-1'),
        registrarActividad: mockRegistrarActividad,
        toast: mockToast,
        loading: mockLoading,
        nuevoNombre,
        nuevoApellido,
        nuevaCategoria,
      })

      await crud.agregarInvitado()

      expect(invitadosAPI.create).toHaveBeenCalledWith({
        nombre: 'Juan',
        apellido: 'Pérez',
        categoria: 'General',
        confirmado: false,
        evento_id: 'evento-1',
      })
      expect(mockToast.success).toHaveBeenCalled()
      expect(mockRegistrarActividad).toHaveBeenCalled()
    })

    it('muestra error cuando no hay permisos', async () => {
      mockPermisos.value.agregarInvitados = false
      const nuevoNombre = ref('Juan')
      const nuevoApellido = ref('Pérez')
      const nuevaCategoria = ref('General')

      const crud = useInvitadosCRUD({
        ...state,
        cargarDatos: vi.fn(),
        permisos: mockPermisos,
        eventoIdActual: ref('evento-1'),
        registrarActividad: mockRegistrarActividad,
        toast: mockToast,
        loading: mockLoading,
        nuevoNombre,
        nuevoApellido,
        nuevaCategoria,
      })

      await crud.agregarInvitado()

      expect(mockToast.error).toHaveBeenCalledWith(
        'No tienes permiso para agregar invitados',
        'Acceso Denegado'
      )
    })

    it('muestra warning cuando nombre está vacío', async () => {
      const nuevoNombre = ref('')
      const nuevoApellido = ref('Pérez')
      const nuevaCategoria = ref('General')

      const crud = useInvitadosCRUD({
        ...state,
        cargarDatos: vi.fn(),
        permisos: mockPermisos,
        eventoIdActual: ref('evento-1'),
        registrarActividad: mockRegistrarActividad,
        toast: mockToast,
        loading: mockLoading,
        nuevoNombre,
        nuevoApellido,
        nuevaCategoria,
      })

      await crud.agregarInvitado()

      expect(mockToast.warning).toHaveBeenCalledWith(
        'Por favor escribe al menos el nombre',
        'Nombre Requerido'
      )
    })

    it('muestra warning cuando el invitado ya existe', async () => {
      state.invitados.value = [
        { id: 1, nombre: 'Juan', apellido: 'Pérez', categoria: 'General', confirmado: false },
      ]

      const nuevoNombre = ref('Juan')
      const nuevoApellido = ref('Pérez')
      const nuevaCategoria = ref('General')

      const crud = useInvitadosCRUD({
        ...state,
        cargarDatos: vi.fn(),
        permisos: mockPermisos,
        eventoIdActual: ref('evento-1'),
        registrarActividad: mockRegistrarActividad,
        toast: mockToast,
        loading: mockLoading,
        nuevoNombre,
        nuevoApellido,
        nuevaCategoria,
      })

      await crud.agregarInvitado()

      expect(mockToast.warning).toHaveBeenCalledWith(
        'Este invitado ya está en la lista',
        'Duplicado'
      )
    })
  })

  describe('toggleConfirmacion', () => {
    it('cambia estado de confirmación exitosamente', async () => {
      state.invitados.value = [
        { id: '1', nombre: 'Juan', apellido: 'Pérez', categoria: 'General', confirmado: false },
      ]

      invitadosAPI.update.mockResolvedValue({ success: true })

      const crud = useInvitadosCRUD({
        ...state,
        cargarDatos: vi.fn(),
        permisos: mockPermisos,
        eventoIdActual: ref('evento-1'),
        registrarActividad: mockRegistrarActividad,
        toast: mockToast,
        loading: mockLoading,
        nuevoNombre: ref(''),
        nuevoApellido: ref(''),
        nuevaCategoria: ref('General'),
      })

      await crud.toggleConfirmacion('1')

      expect(invitadosAPI.update).toHaveBeenCalledWith('1', { confirmado: true })
      expect(state.invitados.value[0].confirmado).toBe(true)
      expect(mockToast.success).toHaveBeenCalled()
    })

    it('muestra error cuando no hay permisos', async () => {
      mockPermisos.value.confirmarInvitados = false
      state.invitados.value = [
        { id: '1', nombre: 'Juan', apellido: 'Pérez', categoria: 'General', confirmado: false },
      ]

      const crud = useInvitadosCRUD({
        ...state,
        cargarDatos: vi.fn(),
        permisos: mockPermisos,
        eventoIdActual: ref('evento-1'),
        registrarActividad: mockRegistrarActividad,
        toast: mockToast,
        loading: mockLoading,
        nuevoNombre: ref(''),
        nuevoApellido: ref(''),
        nuevaCategoria: ref('General'),
      })

      await crud.toggleConfirmacion('1')

      expect(mockToast.error).toHaveBeenCalledWith(
        'No tienes permiso para confirmar invitados',
        'Acceso Denegado'
      )
    })
  })

  describe('eliminarInvitado', () => {
    it('elimina invitado exitosamente', async () => {
      state.invitados.value = [
        { id: '1', nombre: 'Juan', apellido: 'Pérez', categoria: 'General', confirmado: false },
      ]

      vi.spyOn(window, 'confirm').mockReturnValue(true)
      invitadosAPI.delete.mockResolvedValue({ success: true })

      const crud = useInvitadosCRUD({
        ...state,
        cargarDatos: vi.fn().mockResolvedValue(),
        permisos: mockPermisos,
        eventoIdActual: ref('evento-1'),
        registrarActividad: mockRegistrarActividad,
        toast: mockToast,
        loading: mockLoading,
        nuevoNombre: ref(''),
        nuevoApellido: ref(''),
        nuevaCategoria: ref('General'),
      })

      await crud.eliminarInvitado('1')

      expect(invitadosAPI.delete).toHaveBeenCalledWith('1')
      expect(mockToast.success).toHaveBeenCalled()
      expect(mockRegistrarActividad).toHaveBeenCalled()
    })

    it('muestra error cuando no hay permisos', async () => {
      mockPermisos.value.eliminarInvitados = false
      state.invitados.value = [
        { id: '1', nombre: 'Juan', apellido: 'Pérez', categoria: 'General', confirmado: false },
      ]

      const crud = useInvitadosCRUD({
        ...state,
        cargarDatos: vi.fn(),
        permisos: mockPermisos,
        eventoIdActual: ref('evento-1'),
        registrarActividad: mockRegistrarActividad,
        toast: mockToast,
        loading: mockLoading,
        nuevoNombre: ref(''),
        nuevoApellido: ref(''),
        nuevaCategoria: ref('General'),
      })

      await crud.eliminarInvitado('1')

      expect(mockToast.error).toHaveBeenCalledWith(
        'No tienes permiso para eliminar invitados',
        'Acceso Denegado'
      )
    })
  })

  describe('iniciarEdicion', () => {
    it('inicia edición correctamente', () => {
      const crud = useInvitadosCRUD({
        ...state,
        cargarDatos: vi.fn(),
        permisos: mockPermisos,
        eventoIdActual: ref('evento-1'),
        registrarActividad: mockRegistrarActividad,
        toast: mockToast,
        loading: mockLoading,
        nuevoNombre: ref(''),
        nuevoApellido: ref(''),
        nuevaCategoria: ref('General'),
      })

      crud.iniciarEdicion({ id: '1', nombre: 'Juan', apellido: 'Pérez' })

      expect(state.editandoId.value).toBe('1')
      expect(state.nombreEditando.value).toBe('Juan')
      expect(state.apellidoEditando.value).toBe('Pérez')
    })

    it('muestra warning cuando no hay permisos', () => {
      mockPermisos.value.editarInvitados = false

      const crud = useInvitadosCRUD({
        ...state,
        cargarDatos: vi.fn(),
        permisos: mockPermisos,
        eventoIdActual: ref('evento-1'),
        registrarActividad: mockRegistrarActividad,
        toast: mockToast,
        loading: mockLoading,
        nuevoNombre: ref(''),
        nuevoApellido: ref(''),
        nuevaCategoria: ref('General'),
      })

      crud.iniciarEdicion({ id: '1', nombre: 'Juan', apellido: 'Pérez' })

      expect(mockToast.warning).toHaveBeenCalledWith(
        'No tienes permiso para editar invitados',
        'Sin permiso'
      )
    })
  })

  describe('guardarEdicion', () => {
    it('guarda edición exitosamente', async () => {
      state.editandoId.value = '1'
      state.nombreEditando.value = 'Juan Updated'
      state.apellidoEditando.value = 'Pérez Updated'
      state.invitados.value = [
        { id: '1', nombre: 'Juan', apellido: 'Pérez', categoria: 'General', confirmado: false },
      ]

      invitadosAPI.update.mockResolvedValue({ success: true })

      const crud = useInvitadosCRUD({
        ...state,
        cargarDatos: vi.fn(),
        permisos: mockPermisos,
        eventoIdActual: ref('evento-1'),
        registrarActividad: mockRegistrarActividad,
        toast: mockToast,
        loading: mockLoading,
        nuevoNombre: ref(''),
        nuevoApellido: ref(''),
        nuevaCategoria: ref('General'),
      })

      await crud.guardarEdicion()

      expect(invitadosAPI.update).toHaveBeenCalledWith('1', {
        nombre: 'Juan Updated',
        apellido: 'Pérez Updated',
      })
      expect(state.invitados.value[0].nombre).toBe('Juan Updated')
      expect(state.invitados.value[0].apellido).toBe('Pérez Updated')
      expect(mockToast.success).toHaveBeenCalled()
      expect(state.editandoId.value).toBeNull()
    })

    it('muestra warning cuando nombre está vacío', async () => {
      state.editandoId.value = '1'
      state.nombreEditando.value = ''
      state.apellidoEditando.value = 'Pérez'

      const crud = useInvitadosCRUD({
        ...state,
        cargarDatos: vi.fn(),
        permisos: mockPermisos,
        eventoIdActual: ref('evento-1'),
        registrarActividad: mockRegistrarActividad,
        toast: mockToast,
        loading: mockLoading,
        nuevoNombre: ref(''),
        nuevoApellido: ref(''),
        nuevaCategoria: ref('General'),
      })

      await crud.guardarEdicion()

      expect(mockToast.warning).toHaveBeenCalledWith(
        'El nombre no puede estar vacío',
        'Nombre Requerido'
      )
    })
  })

  describe('cancelarEdicion', () => {
    it('cancela edición correctamente', () => {
      state.editandoId.value = '1'
      state.nombreEditando.value = 'Juan'
      state.apellidoEditando.value = 'Pérez'

      const crud = useInvitadosCRUD({
        ...state,
        cargarDatos: vi.fn(),
        permisos: mockPermisos,
        eventoIdActual: ref('evento-1'),
        registrarActividad: mockRegistrarActividad,
        toast: mockToast,
        loading: mockLoading,
        nuevoNombre: ref(''),
        nuevoApellido: ref(''),
        nuevaCategoria: ref('General'),
      })

      crud.cancelarEdicion()

      expect(state.editandoId.value).toBeNull()
      expect(state.nombreEditando.value).toBe('')
      expect(state.apellidoEditando.value).toBe('')
    })
  })
})
