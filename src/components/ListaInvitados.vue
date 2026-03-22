<template>
  <!-- SECCIÓN 1: LA VISTA (lo que el usuario ve) -->
  <div class="lista-invitados">

    <!-- Título principal -->
    <h2>Gestión de Invitados</h2>

    <!-- ========== PANEL DE SILLAS ========== -->
    <div class="panel-sillas">
      <div class="silla-config">
        <label>Sillas Totales:</label>
        <input
          v-model.number="sillasDisponibles"
          type="number"
          min="0"
          class="input-sillas"
          :disabled="!permisos.configurarSillas"
        />
      </div>
      <div class="silla-info">
        <div class="silla-stat">
          <span class="label">Disponibles:</span>
          <span class="valor disponible">{{ sillasRestantes }}</span>
        </div>
        <div class="silla-stat">
          <span class="label">Ocupadas:</span>
          <span class="valor ocupada">{{ invitadosConfirmados }}</span>
        </div>
        <div class="silla-stat">
          <span class="label">% Ocupación:</span>
          <span class="valor">{{ porcentajeOcupacion }}%</span>
        </div>
      </div>
    </div>

    <!-- ========== BOTONES DE IMPORTAR/EXPORTAR ========== -->
    <div class="acciones-excel">
      <button
        v-if="permisos.exportarExcel"
        class="btn-exportar"
        title="Exportar lista a formato Excel (.xlsx)"
        @click="exportarExcel"
      >
        Exportar Excel
      </button>

      <button
        v-if="permisos.exportarExcel"
        class="btn-exportar"
        title="Exportar lista a formato CSV"
        @click="exportarCSV"
      >
        Exportar CSV
      </button>

      <!-- Input oculto para seleccionar archivo -->
      <input
        ref="inputArchivo"
        type="file"
        accept=".xlsx, .xls"
        style="display: none"
        @change="importarExcel"
      />

      <button
        v-if="permisos.importarExcel"
        class="btn-importar"
        title="Importar invitados desde archivo Excel"
        @click="abrirSelectorArchivo"
      >
        Importar Excel
      </button>

      <button class="btn-plantilla" title="Descargar plantilla de ejemplo" @click="descargarPlantilla">
        Descargar Plantilla
      </button>
    </div>

    <!-- ========== FORMULARIO PARA AGREGAR ========== -->
    <div v-if="permisos.agregarInvitados" class="formulario">
      <input
        ref="nombreInput"
        v-model="nuevoNombre"
        type="text"
        placeholder="Nombre(s)"
        class="input-nombre"
        title="Ingresa el nombre del invitado (requerido)"
        @keyup.enter="agregarInvitado"
      />

      <input
        v-model="nuevoApellido"
        type="text"
        placeholder="Apellido(s)"
        class="input-nombre"
        title="Ingresa el apellido del invitado (opcional)"
        @keyup.enter="agregarInvitado"
      />

      <!-- SELECT de categoría -->
      <select v-model="nuevaCategoria" class="select-categoria" title="Selecciona la categoría del invitado">
        <option value="General">General</option>
        <option value="VIP">VIP - Invitados especiales</option>
        <option value="Familia">Familia - Familiares cercanos</option>
        <option value="Amigos">Amigos - Círculo social</option>
        <option value="Trabajo">Trabajo - Colegas y socios</option>
      </select>

      <button class="btn-agregar" title="Agregar invitado a la lista" @click="agregarInvitado">
        + Agregar
      </button>
    </div>

    <!-- ========== BÚSQUEDA Y FILTROS ========== -->
    <div class="barra-busqueda">
      <div class="search-container">
        <input
          ref="searchInput"
          v-model="textoBusqueda"
          type="text"
          placeholder="Buscar por nombre o apellido..."
          class="input-busqueda"
          @focus="mostrarHistorial = getRecentSearches().length > 0"
          @blur="setTimeout(() => mostrarHistorial = false, 200)"
        />

        <!-- Dropdown de historial de búsqueda -->
        <div v-if="mostrarHistorial && getRecentSearches().length > 0" class="historial-dropdown">
          <div class="historial-header">
            <span>Búsquedas recientes</span>
            <button class="btn-limpiar-historial" title="Limpiar historial" @click="clearHistory(); mostrarHistorial = false">Limpiar</button>
          </div>
          <div
            v-for="item in getRecentSearches()"
            :key="item.timestamp"
            class="historial-item"
            @click="aplicarBusquedaHistorial(item.text)"
          >
            <span class="historial-text">{{ item.text }}</span>
            <button class="btn-eliminar-historial" title="Eliminar" @click.stop="removeSearch(item.text)">×</button>
          </div>
        </div>
      </div>

      <select v-model="filtroCategoria" class="select-filtro">
        <option value="">Todas las categorías</option>
        <option value="General">General</option>
        <option value="VIP">VIP</option>
        <option value="Familia">Familia</option>
        <option value="Amigos">Amigos</option>
        <option value="Trabajo">Trabajo</option>
      </select>

      <select v-model="filtroEstado" class="select-filtro">
        <option value="">Todos los estados</option>
        <option value="confirmado">Confirmados</option>
        <option value="pendiente">Pendientes</option>
      </select>

      <button class="btn-ordenar" title="Ordenar alfabéticamente" @click="ordenarInvitados">
        {{ ordenAscendente ? 'A-Z ↑' : 'Z-A ↓' }}
      </button>

      <button class="btn-limpiar" title="Limpiar todos los filtros" @click="limpiarFiltros">
        Limpiar
      </button>

      <button class="btn-filtros-guardados" title="Gestionar filtros guardados" @click="mostrarFiltrosGuardados = !mostrarFiltrosGuardados">
        Filtros {{ savedFilters.length > 0 ? `(${savedFilters.length})` : '' }}
      </button>
    </div>

    <!-- Panel de filtros guardados -->
    <div v-if="mostrarFiltrosGuardados" class="panel-filtros-guardados">
      <div class="panel-header">
        <h3>Filtros Guardados</h3>
        <button class="btn-cerrar-panel" @click="mostrarFiltrosGuardados = false">×</button>
      </div>

      <!-- Guardar filtro actual -->
      <div class="guardar-filtro-section">
        <h4>Guardar Filtro Actual</h4>
        <div class="filtro-actual-info">
          <p>Búsqueda: <strong>{{ textoBusqueda || 'Todos' }}</strong></p>
          <p>Categoría: <strong>{{ filtroCategoria || 'Todas' }}</strong></p>
          <p>Estado: <strong>{{ filtroEstado || 'Todos' }}</strong></p>
        </div>
        <div class="guardar-filtro-form">
          <input
            v-model="nombreFiltroNuevo"
            type="text"
            placeholder="Nombre del filtro..."
            class="input-nombre-filtro"
            @keyup.enter="guardarFiltroActual"
          />
          <button class="btn-guardar-filtro" @click="guardarFiltroActual">Guardar</button>
        </div>
      </div>

      <!-- Lista de filtros guardados -->
      <div class="lista-filtros-guardados">
        <h4>Mis Filtros ({{ savedFilters.length }})</h4>
        <div v-if="savedFilters.length === 0" class="filtros-vacio">
          No hay filtros guardados aún
        </div>
        <div
          v-for="filtro in savedFilters"
          :key="filtro.id"
          class="filtro-guardado-item"
        >
          <div class="filtro-info">
            <div class="filtro-nombre">{{ filtro.name }}</div>
            <div class="filtro-descripcion">{{ filtro.description }}</div>
            <div class="filtro-meta">Usado {{ filtro.usageCount }} veces</div>
          </div>
          <div class="filtro-acciones">
            <button class="btn-aplicar-filtro" @click="aplicarFiltroGuardado(filtro.id)">Aplicar</button>
            <button class="btn-eliminar-filtro" @click="eliminarFiltroGuardado(filtro.id)">Eliminar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== ESTADÍSTICAS ========== -->
    <div class="estadisticas">
      <div class="stat-card">
        <div class="stat-numero">{{ totalFiltrados }}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-card confirmado">
        <div class="stat-numero">{{ invitadosConfirmados }}</div>
        <div class="stat-label">Confirmados</div>
      </div>
      <div class="stat-card pendiente">
        <div class="stat-numero">{{ invitadosPendientes }}</div>
        <div class="stat-label">Pendientes</div>
      </div>
    </div>

    <!-- ========== LISTA DE INVITADOS ========== -->
    <div class="lista-wrapper" :class="{ 'lista-fetching': isFetching }">
      <div v-if="isFetching" class="lista-loading-indicator" aria-live="polite">
        <span class="loading-dot"></span>
        <span>Cargando invitados...</span>
      </div>

      <TransitionGroup name="list" tag="div" class="lista">
        <div
          v-for="invitado in invitadosMostrados"
          :key="invitado.id"
          class="invitado-item"
          :class="{ confirmado: invitado.confirmado }"
        >
        <!-- Modo EDICIÓN -->
        <div v-if="editandoId === invitado.id" class="modo-edicion">
          <input
            v-model="nombreEditando"
            type="text"
            placeholder="Nombre(s)"
            class="input-editar"
            @keyup.enter="guardarEdicion"
            @keyup.esc="cancelarEdicion"
          />
          <input
            v-model="apellidoEditando"
            type="text"
            placeholder="Apellido(s)"
            class="input-editar"
            @keyup.enter="guardarEdicion"
            @keyup.esc="cancelarEdicion"
          />
          <button class="btn-guardar" @click="guardarEdicion">Guardar</button>
          <button class="btn-cancelar" @click="cancelarEdicion">Cancelar</button>
        </div>

        <!-- Modo NORMAL -->
        <div v-else class="info-invitado">
          <div class="nombre-categoria">
            <span class="nombre">{{ invitado.nombre }} {{ invitado.apellido }}</span>
            <span class="badge" :class="invitado.categoria.toLowerCase()">
              {{ invitado.categoria }}
            </span>
          </div>

          <div class="acciones">
            <button
              v-if="permisos.editarInvitados"
              class="btn-editar"
              title="Editar nombre"
              @click="iniciarEdicion(invitado)"
            >
              Editar
            </button>

            <button
              v-if="permisos.confirmarInvitados"
              class="btn-confirmar"
              :class="{ activo: invitado.confirmado }"
              @click="toggleConfirmacion(invitado.id)"
            >
              {{ invitado.confirmado ? 'Confirmado' : 'Pendiente' }}
            </button>

            <button
              v-if="permisos.eliminarInvitados"
              class="btn-eliminar"
              @click="eliminarInvitado(invitado.id)"
            >
              Eliminar
            </button>
          </div>
        </div>
        </div>
      </TransitionGroup>
    </div>

    <div v-if="modoBackend && backendPagination.totalPages > 1" class="paginacion">
      <div class="paginacion-info">
        Mostrando {{ invitadosMostrados.length }} de {{ backendPagination.total }} invitados
      </div>
      <div class="paginacion-controles">
        <button
          class="btn-paginacion"
          :disabled="currentPage === 1 || isFetching"
          @click="irAPagina(1)"
        >
          Primera
        </button>
        <button
          class="btn-paginacion"
          :disabled="currentPage === 1 || isFetching"
          @click="irAPagina(currentPage - 1)"
        >
          Anterior
        </button>
        <span class="pagina-actual">Página {{ currentPage }} de {{ backendPagination.totalPages }}</span>
        <button
          class="btn-paginacion"
          :disabled="currentPage >= backendPagination.totalPages || isFetching"
          @click="irAPagina(currentPage + 1)"
        >
          Siguiente
        </button>
        <button
          class="btn-paginacion"
          :disabled="currentPage >= backendPagination.totalPages || isFetching"
          @click="irAPagina(backendPagination.totalPages)"
        >
          Última
        </button>
      </div>
      <div class="paginacion-tamanio">
        <label for="page-size">Por página:</label>
        <select id="page-size" v-model.number="pageSize" :disabled="isFetching">
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Mensaje cuando no hay invitados -->
    <div v-if="totalFiltrados === 0 && !hayFiltrosActivos" class="vacio">
      <p>No hay invitados aún</p>
      <p class="subtexto">Agrega el primero usando el formulario de arriba o importa un archivo Excel</p>
    </div>

    <!-- Mensaje cuando la búsqueda no tiene resultados -->
    <div v-else-if="totalFiltrados === 0 && hayFiltrosActivos" class="vacio">
      <p>No se encontraron invitados con esos criterios</p>
      <p class="subtexto">Intenta cambiar los filtros de búsqueda</p>
    </div>

  </div>
</template>

<script setup>
// SECCIÓN 2: LA LÓGICA MEJORADA CON EXCEL

// Importamos funciones de Vue
import { ref, computed, watch, onMounted, inject } from 'vue'

// ExcelJS se carga dinámicamente cuando es necesario para reducir tamaño del bundle (lazy-load)
// Se usa un helper en src/utils/excelImporter.js para la lógica de parsing/plantilla cuando es posible

// Importamos composables
import { useToast } from '../composables/useToast'
import { useLoading } from '../composables/useLoading'
import { useSearchHistory } from '../composables/useSearchHistory'
import { useSavedFilters } from '../composables/useSavedFilters'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'

// Importar API de invitados
import { invitadosAPI } from '../services/api'

// Inicializar composables
const { success, error, warning } = useToast()
const { show: showLoading, hide: hideLoading, updateProgress } = useLoading()
const { addSearch, removeSearch, clearHistory, getRecentSearches } = useSearchHistory()
const { savedFilters, saveFilter, deleteFilter, applyFilter } = useSavedFilters()
const shortcuts = useKeyboardShortcuts()

// ========== PERMISOS ==========
const obtenerPermisos = inject('permisos', () => ({}))
const registrarActividad = inject('registrarActividad', () => {})
const obtenerEventoIdActual = inject('eventoIdActual', () => '1')

// Computed para obtener permisos actuales
const permisos = computed(() => obtenerPermisos())
const eventoIdActual = computed(() => {
  const value = obtenerEventoIdActual()
  const id = String(value ?? '').trim()
  return id ? id : null
})

// ========== DATOS REACTIVOS ==========

const nuevoNombre = ref('')             // Nombre del nuevo invitado
const nuevoApellido = ref('')           // Apellido del nuevo invitado
const nuevaCategoria = ref('General')   // Categoría del nuevo invitado
const invitados = ref([])               // Lista de todos los invitados
const textoBusqueda = ref('')           // Texto de búsqueda
const filtroCategoria = ref('')         // Filtro por categoría
const filtroEstado = ref('')            // Filtro por estado (confirmado/pendiente)
const sillasDisponibles = ref(100)      // Total de sillas disponibles
const editandoId = ref(null)            // ID del invitado que se está editando
const nombreEditando = ref('')          // Nombre temporal durante edición
const apellidoEditando = ref('')        // Apellido temporal durante edición
const inputArchivo = ref(null)          // Referencia al input de archivo
const ordenAscendente = ref(true)       // Orden de clasificación A-Z o Z-A
const mostrarHistorial = ref(false)     // Mostrar dropdown de historial
const mostrarFiltrosGuardados = ref(false) // Mostrar panel de filtros guardados
const nombreFiltroNuevo = ref('')       // Nombre para guardar filtro actual
const currentPage = ref(1)
const pageSize = ref(50)
const isFetching = ref(false)
const backendPagination = ref({
  total: 0,
  confirmados: 0,
  pendientes: 0,
  page: 1,
  limit: 50,
  totalPages: 1
})

// Referencias a elementos del DOM para atajos de teclado
const searchInput = ref(null)
const nombreInput = ref(null)

// Estado de modo de operación
const modoBackend = ref(true) // true = backend, false = localStorage

// ========== FUNCIONES DE PERSISTENCIA ==========

onMounted(() => {
  cargarDatos()
  configurarAtajosTeclado()
})

// ========== ATAJOS DE TECLADO ==========

function configurarAtajosTeclado() {
  // Inicializar el sistema de atajos
  shortcuts.init()

  // Ctrl+F: Enfocar búsqueda
  shortcuts.register('ctrl+f', (e) => {
    e.preventDefault()
    searchInput.value?.focus()
  }, 'Enfocar búsqueda')

  // Ctrl+K: Alternar panel de filtros guardados
  shortcuts.register('ctrl+k', () => {
    mostrarFiltrosGuardados.value = !mostrarFiltrosGuardados.value
  }, 'Alternar filtros guardados')

  // Esc: Limpiar búsqueda o cerrar panel
  shortcuts.register('escape', () => {
    if (mostrarFiltrosGuardados.value) {
      mostrarFiltrosGuardados.value = false
    } else if (textoBusqueda.value) {
      textoBusqueda.value = ''
    }
  }, 'Limpiar búsqueda/cerrar panel')

  // Ctrl+E: Exportar a Excel
  shortcuts.register('ctrl+e', () => {
    if (permisos.value.exportarExcel) {
      exportarExcel()
    }
  }, 'Exportar a Excel')

  // Ctrl+Shift+E: Exportar a CSV
  shortcuts.register('ctrl+shift+e', () => {
    if (permisos.value.exportarExcel) {
      exportarCSV()
    }
  }, 'Exportar a CSV')

  // Ctrl+I: Abrir importador
  shortcuts.register('ctrl+i', () => {
    if (permisos.value.importarExcel) {
      abrirSelectorArchivo()
    }
  }, 'Importar desde Excel')

  // Ctrl+N: Enfocar campo de nombre para nuevo invitado
  shortcuts.register('ctrl+n', () => {
    if (permisos.value.agregarInvitados) {
      nombreInput.value?.focus()
    }
  }, 'Nuevo invitado')
}

async function cargarDatos(page = currentPage.value) {
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
      console.warn('Invitados cargados desde backend:', invitados.value.length)
    }
  } catch (err) {
    console.error('Error al cargar desde backend, usando localStorage:', err)
    modoBackend.value = false
    cargarDatosLocalStorage()
  } finally {
    isFetching.value = false
  }
}

function cargarDatosLocalStorage() {
  try {
    const invitadosGuardados = localStorage.getItem('invitados')
    const sillasGuardadas = localStorage.getItem('sillasDisponibles')

    if (invitadosGuardados) {
      const parsed = JSON.parse(invitadosGuardados)
      // Validar que sea un array
      if (Array.isArray(parsed)) {
        invitados.value = parsed
      }
    }

    if (sillasGuardadas) {
      const parsed = parseInt(sillasGuardadas, 10)
      // Validar que sea un número válido
      if (!isNaN(parsed) && parsed >= 0) {
        sillasDisponibles.value = parsed
      }
    }
  } catch (error) {
    console.error('Error al cargar datos del localStorage:', error)
    // En caso de error, usar valores por defecto
    invitados.value = []
    sillasDisponibles.value = 100
  }
}

function guardarDatos() {
  // Solo guardar en localStorage si estamos en modo localStorage
  if (!modoBackend.value) {
    try {
      localStorage.setItem('invitados', JSON.stringify(invitados.value))
      localStorage.setItem('sillasDisponibles', sillasDisponibles.value.toString())
    } catch (error) {
      console.error('Error al guardar datos en localStorage:', error)
      // Posible causa: localStorage lleno o no disponible
      if (error.name === 'QuotaExceededError') {
        alert('Espacio de almacenamiento lleno. Algunos datos pueden no guardarse.')
      }
    }
  }
}

watch([invitados, sillasDisponibles], () => {
  guardarDatos()
}, { deep: true })

// ========== FUNCIONES DE EXCEL ==========

// Función para EXPORTAR a CSV
async function exportarCSV() {
  // Verificar permiso
  if (!permisos.value.exportarExcel) {
    error('No tienes permiso para exportar', 'Acceso Denegado')
    return
  }

  if (invitados.value.length === 0) {
    warning('No hay invitados para exportar', 'Lista Vacía')
    return
  }

  try {
    showLoading({ message: 'Exportando a CSV...', progress: 0 })

    // Crear encabezados
    const headers = ['Nombre', 'Apellido', 'Categoría', 'Estado']

    updateProgress(30, 'Procesando datos...')

    // Crear filas
    const rows = invitados.value.map(inv => [
      inv.nombre,
      inv.apellido,
      inv.categoria,
      inv.confirmado ? 'Confirmado' : 'Pendiente'
    ])

    updateProgress(60, 'Generando archivo...')
    await new Promise(resolve => setTimeout(resolve, 300))

    // Combinar encabezados y filas
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    updateProgress(90, 'Descargando archivo...')

    const fecha = new Date().toISOString().split('T')[0]
    link.setAttribute('href', url)
    link.setAttribute('download', `Invitados_${fecha}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    updateProgress(100, 'Completado')
    await new Promise(resolve => setTimeout(resolve, 300))

    registrarActividad(`Exportó ${invitados.value.length} invitados a CSV`)
    success(`Se exportaron ${invitados.value.length} invitados a CSV`, 'Exportación Exitosa', 4000)
  } catch (err) {
    console.error('Error al exportar CSV:', err)
    error('Ocurrió un error al exportar el archivo CSV', 'Error de Exportación')
  } finally {
    hideLoading()
  }
}

// Función para EXPORTAR a Excel
async function exportarExcel() {
  // Verificar permiso
  if (!permisos.value.exportarExcel) {
    error('No tienes permiso para exportar a Excel', 'Acceso Denegado')
    return
  }

  // Si no hay invitados, mostrar mensaje
  if (invitados.value.length === 0) {
    warning('No hay invitados para exportar', 'Lista Vacía')
    return
  }

  try {
    showLoading({ message: 'Exportando a Excel...', progress: 0 })

    // Preparar los datos para Excel
    // Convertimos el array de objetos a un formato tabular
    const datosExcel = invitados.value.map(inv => ({
      'Nombre': inv.nombre,
      'Apellido': inv.apellido,
      'Categoría': inv.categoria,
      'Estado': inv.confirmado ? 'Confirmado' : 'Pendiente'
    }))

    updateProgress(30, 'Procesando datos...')
    await new Promise(resolve => setTimeout(resolve, 300))

    // Cargar ExcelJS de forma dinámica para evitar cargarlo en el bundle inicial
    const mod = await import('exceljs')
    const ExcelJS = mod.default || mod
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Invitados')

    // Agregar encabezado
    const headers = ['Nombre', 'Apellido', 'Categoría', 'Estado']
    sheet.addRow(headers)

    // Agregar filas de datos
    for (const r of datosExcel) {
      sheet.addRow([r.Nombre, r.Apellido, r['Categoría'], r.Estado])
    }

    // Ajustar anchos básicos
    sheet.columns = [
      { width: 20 },
      { width: 20 },
      { width: 15 },
      { width: 15 }
    ]

    updateProgress(80, 'Creando archivo...')
    await new Promise(resolve => setTimeout(resolve, 400))

    // Generar nombre del archivo con la fecha actual
    const fecha = new Date().toISOString().split('T')[0]
    const nombreArchivo = `Invitados_${fecha}.xlsx`

    updateProgress(95, 'Descargando...')

    // Generar buffer y descargar usando Blob
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nombreArchivo
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    updateProgress(100, 'Completado')
    await new Promise(resolve => setTimeout(resolve, 300))

    registrarActividad(`Exportó ${invitados.value.length} invitados a Excel`)
    success(`Se exportaron ${invitados.value.length} invitados a Excel`, 'Exportación Exitosa', 4000)
  } catch (err) {
    console.error('Error al exportar Excel:', err)
    error('Ocurrió un error al exportar el archivo Excel', 'Error de Exportación')
  } finally {
    hideLoading()
  }
}

// Función para IMPORTAR desde Excel
async function importarExcel(evento) {
  // Verificar permiso
  if (!permisos.value.importarExcel) {
    error('No tienes permiso para importar desde Excel', 'Acceso Denegado')
    evento.target.value = '' // Limpiar input
    return
  }

  // Obtener el archivo seleccionado
  const archivo = evento.target.files[0]

  // Verificar que se seleccionó un archivo
  if (!archivo) return

  // Validaciones básicas de seguridad: tamaño y extensión
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
  const ALLOWED_EXT = /\.(xlsx|xls|csv)$/i
  const MAX_ROWS = 5000

  if (archivo.size > MAX_FILE_SIZE) {
    error('El archivo es demasiado grande. El límite es 5 MB.', 'Archivo Inválido')
    evento.target.value = ''
    return
  }

  if (!ALLOWED_EXT.test(archivo.name) && !(archivo.type && /spreadsheet|excel|csv|octet-stream/i.test(archivo.type))) {
    error('Tipo de archivo no soportado. Usa .xlsx, .xls o .csv', 'Archivo Inválido')
    evento.target.value = ''
    return
  }

  showLoading({ message: `Cargando archivo ${archivo.name}...`, progress: 0 })

  // FileReader es una API del navegador para leer archivos
  const lector = new FileReader()

  // Esta función se ejecuta cuando termina de leer el archivo
  lector.onload = async (e) => {
    try {
      updateProgress(20, 'Leyendo archivo Excel...')
      // e.target.result contiene los datos del archivo (ArrayBuffer)

      // Usar helper que parsea Excel y aplica límites (lazy-load de ExcelJS dentro)
      const { parseExcelBuffer } = await import('@/utils/excelImporter.js')
      let parsed
      try {
        parsed = await parseExcelBuffer(e.target.result, { maxRows: MAX_ROWS, maxFieldLength: 1000 })
      } catch (parseErr) {
        hideLoading()
        console.error('Error al parsear archivo Excel (helper):', parseErr)
        if (String(parseErr.message).includes('Too many rows')) {
          error(`El archivo contiene demasiadas filas. Límite: ${MAX_ROWS}`, 'Archivo Demasiado Grande')
        } else {
          error('El archivo no parece ser un Excel válido o está corrupto.', 'Archivo Inválido')
        }
        evento.target.value = ''
        return
      }

      if (!parsed || !Array.isArray(parsed.rows) || parsed.rows.length === 0) {
        hideLoading()
        error('El archivo Excel está vacío o no tiene la estructura correcta. Asegúrate de que tenga encabezados y datos.', 'Archivo Inválido', 6000)
        evento.target.value = ''
        return
      }

      updateProgress(40, 'Procesando datos...')
      await new Promise(resolve => setTimeout(resolve, 200))

      // Datos ya retornados por el helper
      let datosJson = parsed.rows

      // Validar que el archivo tenga datos
      if (!Array.isArray(datosJson) || datosJson.length === 0) {
        hideLoading()
        error('El archivo Excel está vacío o no tiene la estructura correcta. Asegúrate de que tenga encabezados y datos.', 'Archivo Inválido', 6000)
        evento.target.value = ''
        return
      }

      if (datosJson.length > MAX_ROWS) {
        hideLoading()
        error(`El archivo contiene demasiadas filas (${datosJson.length}). Límite: ${MAX_ROWS}`, 'Archivo Demasiado Grande')
        evento.target.value = ''
        return
      }

      // Sanitizar valores y limitar longitud de campos para evitar payloads excesivos
      datosJson = datosJson.slice(0, MAX_ROWS).map(row => {
        const cleaned = {}
        for (const [k, v] of Object.entries(row)) {
          const val = typeof v === 'string' ? v.trim() : String(v)
          cleaned[k] = val.length > 1000 ? val.slice(0, 1000) : val
        }
        return cleaned
      })

      updateProgress(60, `Importando ${datosJson.length} filas...`)

      // Si estamos en modo backend, usar la API de importación
      if (modoBackend.value) {
        try {
          // Preparar datos para importación al backend
          const invitadosParaImportar = datosJson.map(fila => {
            const buscarColumna = (variaciones) => {
              for (let variacion of variaciones) {
                if (fila[variacion] !== undefined && fila[variacion] !== null && fila[variacion] !== '') {
                  return String(fila[variacion]).trim()
                }
              }
              return ''
            }

            const nombre = buscarColumna([
              'Nombre', 'nombre', 'NOMBRE', 'Nombres', 'nombres', 'NOMBRES',
              'Name', 'name', 'NAME', 'First Name', 'first name', 'FIRST NAME',
              'FirstName', 'firstname', 'FIRSTNAME'
            ])

            const apellido = buscarColumna([
              'Apellido', 'apellido', 'APELLIDO', 'Apellidos', 'apellidos', 'APELLIDOS',
              'Last Name', 'last name', 'LAST NAME', 'LastName', 'lastname', 'LASTNAME',
              'Surname', 'surname', 'SURNAME'
            ])

            const categoria = buscarColumna([
              'Categoría', 'categoria', 'CATEGORIA', 'Categoria', 'CATEGORÍA',
              'Category', 'category', 'CATEGORY', 'Tipo', 'tipo', 'TIPO',
              'Type', 'type', 'TYPE'
            ]) || 'General'

            const estado = buscarColumna([
              'Estado', 'estado', 'ESTADO', 'Status', 'status', 'STATUS',
              'Confirmación', 'confirmacion', 'CONFIRMACION',
              'Confirmado', 'confirmado', 'CONFIRMADO',
              'Confirmed', 'confirmed', 'CONFIRMED'
            ]) || 'Pendiente'

            // Validar categoría
            const categoriasValidas = ['General', 'VIP', 'Familia', 'Amigos', 'Trabajo']
            const categoriaFinal = categoriasValidas.includes(categoria) ? categoria : 'General'

            return {
              nombre: nombre.trim(),
              apellido: apellido.trim(),
              categoria: categoriaFinal,
              confirmado: estado.toLowerCase().includes('confirmado')
            }
          }).filter(inv => inv.nombre !== '') // Solo invitados con nombre

          updateProgress(75, `Enviando ${invitadosParaImportar.length} invitados al servidor...`)

          const response = await invitadosAPI.import(invitadosParaImportar, eventoIdActual.value)

          if (response.success && response.data) {
            const { importados, duplicados, errores } = response.data

            updateProgress(90, 'Recargando lista...')
            await cargarDatos() // Recargar toda la lista desde backend

            updateProgress(100, 'Completado')
            await new Promise(resolve => setTimeout(resolve, 300))

            hideLoading()

            if (importados > 0 && errores.length === 0) {
              success(`Se importaron ${importados} invitados correctamente`, 'Importación Exitosa', 5000)
            } else if (importados > 0 && errores.length > 0) {
              warning(`Se importaron ${importados} invitados. ${duplicados} duplicados omitidos.`, 'Importación con Advertencias', 6000)
            } else {
              error(`No se importó ningún invitado. ${duplicados} duplicados.`, 'Importación Fallida', 6000)
            }

            registrarActividad(`Importó ${importados} invitados desde Excel (${duplicados} duplicados)`)
            evento.target.value = ''
            return
          }
        } catch (importError) {
          console.error('Error al importar con backend:', importError)
          warning('Error al importar con backend, usando modo local', 'Modo Local', 4000)
          modoBackend.value = false
          // Continuar con importación local
        }
      }

      // Modo localStorage (original)
      // Contador de invitados importados
      let importados = 0
      let duplicados = 0
      let filasInvalidas = 0
      const erroresPorFila = []

      // Procesar cada fila del Excel
      datosJson.forEach((fila, index) => {
        // FUNCIÓN AUXILIAR: Busca el valor en múltiples variaciones de columna
        const buscarColumna = (variaciones) => {
          // Busca en todas las variaciones posibles
          for (let variacion of variaciones) {
            if (fila[variacion] !== undefined && fila[variacion] !== null && fila[variacion] !== '') {
              return String(fila[variacion]).trim()
            }
          }
          return ''
        }

        // NOMBRE: Acepta muchas variaciones en español e inglés
        const nombre = buscarColumna([
          'Nombre', 'nombre', 'NOMBRE',           // Español variaciones
          'Nombres', 'nombres', 'NOMBRES',         // Plural
          'Name', 'name', 'NAME',                  // Inglés
          'First Name', 'first name', 'FIRST NAME', // Inglés con espacio
          'FirstName', 'firstname', 'FIRSTNAME'    // Inglés sin espacio
        ])

        // APELLIDO: Acepta muchas variaciones
        const apellido = buscarColumna([
          'Apellido', 'apellido', 'APELLIDO',      // Español variaciones
          'Apellidos', 'apellidos', 'APELLIDOS',   // Plural
          'Last Name', 'last name', 'LAST NAME',   // Inglés con espacio
          'LastName', 'lastname', 'LASTNAME',      // Inglés sin espacio
          'Surname', 'surname', 'SURNAME'          // Apellido formal
        ])

        // CATEGORÍA: Acepta muchas variaciones
        const categoria = buscarColumna([
          'Categoría', 'categoria', 'CATEGORIA',   // Español con/sin tilde
          'Categoria', 'CATEGORÍA',                // Variaciones tilde
          'Category', 'category', 'CATEGORY',      // Inglés
          'Tipo', 'tipo', 'TIPO',                  // Alternativa español
          'Type', 'type', 'TYPE'                   // Alternativa inglés
        ]) || 'General'

        // ESTADO: Acepta muchas variaciones
        const estado = buscarColumna([
          'Estado', 'estado', 'ESTADO',            // Español
          'Status', 'status', 'STATUS',            // Inglés
          'Confirmación', 'confirmacion', 'CONFIRMACION', // Español variaciones
          'Confirmado', 'confirmado', 'CONFIRMADO',
          'Confirmed', 'confirmed', 'CONFIRMED'    // Inglés
        ]) || 'Pendiente'

        // Validar que tenga al menos nombre
        if (!nombre.trim()) {
          filasInvalidas++
          erroresPorFila.push(`Fila ${index + 2}: Falta el nombre`)
          return // Saltar esta fila
        }

        // Verificar si ya existe (por nombre y apellido)
        const existe = invitados.value.some(inv =>
          inv.nombre.toLowerCase() === nombre.toLowerCase() &&
          inv.apellido.toLowerCase() === apellido.toLowerCase()
        )

        if (existe) {
          duplicados++
          erroresPorFila.push(`Fila ${index + 2}: "${nombre} ${apellido}" ya existe`)
          return // Saltar duplicado
        }

        // Validar categoría (usar General si no es válida)
        const categoriasValidas = ['General', 'VIP', 'Familia', 'Amigos', 'Trabajo']
        const categoriaFinal = categoriasValidas.includes(categoria) ? categoria : 'General'

        // Crear nuevo invitado
        invitados.value.push({
          id: Date.now() + importados, // ID único
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          categoria: categoriaFinal,
          confirmado: estado.toLowerCase().includes('confirmado')
        })

        importados++
      })

      updateProgress(90, 'Finalizando importación...')
      await new Promise(resolve => setTimeout(resolve, 300))

      updateProgress(100, 'Completado')
      await new Promise(resolve => setTimeout(resolve, 300))

      registrarActividad(`Importó ${importados} invitados desde Excel (${duplicados} duplicados, ${filasInvalidas} inválidos)`)

      hideLoading()

      // Mostrar toast según el resultado
      if (importados > 0 && erroresPorFila.length === 0) {
        success(`Se importaron ${importados} invitados correctamente`, 'Importación Exitosa', 5000)
      } else if (importados > 0 && erroresPorFila.length > 0) {
        warning(`Se importaron ${importados} invitados. ${duplicados} duplicados y ${filasInvalidas} inválidos omitidos.`, 'Importación con Advertencias', 6000)
      } else {
        error(`No se importó ningún invitado. ${duplicados} duplicados y ${filasInvalidas} inválidos.`, 'Importación Fallida', 6000)
      }

    } catch (err) {
      hideLoading()

      let mensajeError = ''

      if (err.message.includes('Unsupported file')) {
        mensajeError = 'El archivo no es un formato Excel válido. Formatos aceptados: .xlsx, .xls'
      } else if (err.message.includes('Cannot read')) {
        mensajeError = 'No se pudo leer el archivo. Puede estar corrupto, protegido con contraseña o abierto en otro programa.'
      } else {
        mensajeError = `Error inesperado: ${err.message}`
      }

      error(mensajeError, 'Error al Procesar Archivo', 6000)
      console.error('Error de importación:', err)
    }

    // Limpiar el input para poder importar el mismo archivo de nuevo
    evento.target.value = ''
  }

  // Leer el archivo como ArrayBuffer
  lector.readAsArrayBuffer(archivo)
}

// Función para abrir el selector de archivos
function abrirSelectorArchivo() {
  // .click() simula un click en el input oculto
  inputArchivo.value.click()
}

// Función para descargar una plantilla de Excel vacía
async function descargarPlantilla() {
  // Usar helper que genera la plantilla (lazy-load de ExcelJS dentro)
  try {
    const { createTemplateBuffer } = await import('@/utils/excelImporter.js')
    const buffer = await createTemplateBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Plantilla_Invitados.xlsx'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    alert('Plantilla descargada. Editala y luego importa el archivo.')
  } catch (err) {
    console.error('Error al generar plantilla Excel:', err)
    alert('Error generando la plantilla. Intenta nuevamente.')
  }
}

// ========== PROPIEDADES COMPUTADAS ==========

// Invitados filtrados con búsqueda mejorada
const invitadosFiltrados = computed(() => {
  // En modo backend, los filtros y orden ya vienen aplicados por API
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

// ========== FUNCIONES DE HISTORIAL Y FILTROS ==========

// Watch para agregar búsquedas al historial
watch(textoBusqueda, (newValue, oldValue) => {
  // Solo agregar si tiene al menos 3 caracteres y el usuario dejó de escribir
  if (newValue && newValue.length >= 3 && newValue !== oldValue) {
    // Usar debounce para no agregar cada tecla
    setTimeout(() => {
      if (textoBusqueda.value === newValue) {
        addSearch(newValue)
      }
    }, 1000)
  }
})

let recargaBackendTimer = null

function programarRecargaBackend(resetPage = true) {
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
  }, 250)
}

watch([filtroCategoria, filtroEstado, ordenAscendente, pageSize, eventoIdActual], () => {
  programarRecargaBackend(true)
})

watch(textoBusqueda, () => {
  programarRecargaBackend(true)
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

// Aplicar una búsqueda del historial
function aplicarBusquedaHistorial(searchText) {
  textoBusqueda.value = searchText
  mostrarHistorial.value = false
  addSearch(searchText) // Actualizar como búsqueda reciente
}

// Guardar filtro actual
function guardarFiltroActual() {
  if (!nombreFiltroNuevo.value || nombreFiltroNuevo.value.trim() === '') {
    warning('Por favor ingresa un nombre para el filtro', 'Nombre Requerido')
    return
  }

  try {
    const filterData = {
      name: nombreFiltroNuevo.value.trim(),
      description: `Búsqueda: "${textoBusqueda.value || 'Todos'}", Categoría: ${filtroCategoria.value || 'Todas'}, Estado: ${filtroEstado.value || 'Todos'}`,
      searchText: textoBusqueda.value,
      category: filtroCategoria.value,
      status: filtroEstado.value
    }

    saveFilter(filterData)
    success(`Filtro "${filterData.name}" guardado correctamente`, 'Filtro Guardado')
    nombreFiltroNuevo.value = ''
  } catch (err) {
    error(err.message, 'Error al Guardar Filtro')
  }
}

// Aplicar un filtro guardado
function aplicarFiltroGuardado(filterId) {
  const filters = applyFilter(filterId)
  if (filters) {
    textoBusqueda.value = filters.searchText || ''
    filtroCategoria.value = filters.category || ''
    filtroEstado.value = filters.status || ''
    mostrarFiltrosGuardados.value = false
    success('Filtro aplicado correctamente', 'Filtro Aplicado')
  }
}

// Eliminar un filtro guardado
function eliminarFiltroGuardado(filterId) {
  const confirmar = confirm('¿Estás seguro de eliminar este filtro guardado?')
  if (confirmar) {
    deleteFilter(filterId)
    success('Filtro eliminado correctamente', 'Filtro Eliminado')
  }
}

// Limpiar todos los filtros actuales
function limpiarFiltros() {
  textoBusqueda.value = ''
  filtroCategoria.value = ''
  filtroEstado.value = ''
}

// ========== FUNCIONES PRINCIPALES ==========

async function agregarInvitado() {
  // Verificar permiso
  if (!permisos.value.agregarInvitados) {
    error('No tienes permiso para agregar invitados', 'Acceso Denegado')
    return
  }

  const nombre = nuevoNombre.value.trim()
  const apellido = nuevoApellido.value.trim()

  // Validar que tenga al menos nombre
  if (nombre === '') {
    warning('Por favor escribe al menos el nombre', 'Nombre Requerido')
    return
  }

  // Validar duplicados
  const existe = invitados.value.some(inv =>
    inv.nombre.toLowerCase() === nombre.toLowerCase() &&
    inv.apellido.toLowerCase() === apellido.toLowerCase()
  )

  if (existe) {
    warning('Este invitado ya está en la lista', 'Duplicado')
    return
  }

  // Advertir si no hay sillas
  if (sillasRestantes.value === 0) {
    warning('No hay sillas disponibles', 'Sillas Agotadas')
  }

  try {
    if (modoBackend.value) {
      // Guardar en backend
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
      // Guardar en localStorage
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

    // Limpiar formulario
    nuevoNombre.value = ''
    nuevoApellido.value = ''
    nuevaCategoria.value = 'General'
  } catch (err) {
    hideLoading()
    console.error('Error al agregar invitado:', err)
    error(err.message || 'No se pudo agregar el invitado', 'Error')
  }
}

async function toggleConfirmacion(id) {
  // Verificar permiso
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
        // Actualizar en backend
        const response = await invitadosAPI.update(id, {
          confirmado: nuevoEstado
        })

        if (response.success) {
          invitado.confirmado = nuevoEstado
          const mensaje = nuevoEstado ? 'confirmado' : 'marcado como pendiente'
          success(`Invitado ${mensaje}`, 'Estado Actualizado')
        }
      } else {
        // Actualizar en localStorage
        invitado.confirmado = nuevoEstado
      }

      const estado = nuevoEstado ? 'confirmó' : 'marcó como pendiente'
      registrarActividad(`${estado} a: ${invitado.nombre} ${invitado.apellido}`)
    } catch (err) {
      console.error('Error al actualizar confirmación:', err)
      error(err.message || 'No se pudo actualizar el estado', 'Error')
    }
  }
}

async function eliminarInvitado(id) {
  // Verificar permiso
  if (!permisos.value.eliminarInvitados) {
    error('No tienes permiso para eliminar invitados', 'Acceso Denegado')
    return
  }

  const invitado = invitados.value.find(inv => inv.id === id)

  if (confirm(`¿Estás seguro de eliminar a "${invitado.nombre} ${invitado.apellido}"?`)) {
    try {
      if (modoBackend.value) {
        // Eliminar del backend
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
        // Eliminar de localStorage
        const index = invitados.value.findIndex(inv => inv.id === id)
        invitados.value.splice(index, 1)
        success(`Invitado ${invitado.nombre} ${invitado.apellido} eliminado`, 'Invitado Eliminado')
      }

      registrarActividad(`Eliminó invitado: ${invitado.nombre} ${invitado.apellido}`)
    } catch (err) {
      hideLoading()
      console.error('Error al eliminar invitado:', err)
      error(err.message || 'No se pudo eliminar el invitado', 'Error')
    }
  }
}

// ========== FUNCIONES DE EDICIÓN ==========

function iniciarEdicion(invitado) {
  // Verificar permiso
  if (!permisos.value.editarInvitados) {
    alert('No tienes permiso para editar invitados')
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
        // Actualizar en backend
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
        // Actualizar en localStorage
        invitado.nombre = nombre
        invitado.apellido = apellido
        success('Invitado actualizado correctamente', 'Guardado')
      }

      registrarActividad(`Editó invitado: ${nombre} ${apellido}`)
      cancelarEdicion()
    } catch (err) {
      hideLoading()
      console.error('Error al guardar edición:', err)
      error(err.message || 'No se pudo guardar los cambios', 'Error')
    }
  }
}

function cancelarEdicion() {
  editandoId.value = null
  nombreEditando.value = ''
  apellidoEditando.value = ''
}

// ========== FUNCIÓN DE ORDENAMIENTO ==========

function ordenarInvitados() {
  // Cambiar el orden
  ordenAscendente.value = !ordenAscendente.value
}
</script>

<style scoped>
/* SECCIÓN 3: ESTILOS MEJORADOS */

.lista-invitados {
  width: 100%;
  padding: 0;
  background: transparent;
}

h2 {
  color: #fff;
  text-align: center;
  margin: 0 0 20px 0;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* ========== PANEL DE SILLAS ========== */
.panel-sillas {
  background: #141414;
  color: #FFD700;
  padding: 14px 18px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid rgba(255,215,0,0.15);
}

.silla-config {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.silla-config label {
  font-weight: bold;
  font-size: 16px;
}

.input-sillas {
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid rgba(255, 215, 0, 0.4);
  border-radius: 6px;
  width: 80px;
  font-weight: 600;
  background: #2a2a2a;
  color: #FFD700;
  transition: all 0.2s;
}

.input-sillas:focus {
  outline: none;
  background: #5a5a5a;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.silla-info {
  display: flex;
  justify-content: space-around;
  gap: 15px;
}

.silla-stat {
  text-align: center;
  flex: 1;
}

.silla-stat .label {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 5px;
}

.silla-stat .valor {
  display: block;
  font-size: 20px;
  font-weight: 700;
}

.valor.disponible {
  color: #FFD700;
}

.valor.ocupada {
  color: #FFD700;
}

/* ========== BOTONES DE EXCEL ========== */
.acciones-excel {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-exportar {
  padding: 9px 18px;
  background: #FFD700;
  color: #111;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.15s;
}

.btn-exportar:hover {
  background: #f0c800;
  transform: translateY(-1px);
}

.btn-importar {
  padding: 9px 18px;
  background: transparent;
  color: #FFD700;
  border: 1px solid rgba(255, 215, 0, 0.4);
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.15s;
}

.btn-importar:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: #FFD700;
}

.btn-plantilla {
  padding: 9px 18px;
  background: transparent;
  color: rgba(255,255,255,0.45);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
}

.btn-plantilla:hover {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.75);
}

/* ========== FORMULARIO ========== */
.formulario {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  background: #141414;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.07);
}

.input-nombre {
  flex: 1;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  transition: border-color 0.15s;
  background: #0f0f0f;
  color: #fff;
  font-family: inherit;
}

.input-nombre::placeholder { color: rgba(255,255,255,0.3); }

.input-nombre:focus {
  outline: none;
  border-color: rgba(255,215,0,0.5);
}

.select-categoria {
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  cursor: pointer;
  background: #0f0f0f;
  color: #fff;
  font-family: inherit;
  transition: border-color 0.15s;
}

.select-categoria:focus {
  outline: none;
  border-color: rgba(255,215,0,0.5);
}

.btn-agregar {
  padding: 9px 18px;
  background: #FFD700;
  color: #111;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-agregar:hover {
  background: #f0c800;
  transform: translateY(-1px);
}

/* ========== BÚSQUEDA Y FILTROS ========== */
.barra-busqueda {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  background: #141414;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.07);
}

.input-busqueda {
  flex: 2;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  background: #0f0f0f;
  color: #fff;
  font-family: inherit;
  transition: border-color 0.15s;
}

.input-busqueda::placeholder { color: rgba(255,255,255,0.3); }

.input-busqueda:focus {
  outline: none;
  border-color: rgba(255,215,0,0.5);
}

.select-filtro {
  padding: 8px 10px;
  font-size: 13px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  cursor: pointer;
  background: #0f0f0f;
  color: #fff;
  font-family: inherit;
  transition: border-color 0.15s;
}

.select-filtro:focus {
  outline: none;
  border-color: rgba(255,215,0,0.5);
}

.btn-ordenar {
  padding: 8px 14px;
  background: #1e1e1e;
  color: #FFD700;
  border: 1px solid rgba(255,215,0,0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-ordenar:hover {
  background: rgba(255,215,0,0.1);
  border-color: #FFD700;
}

/* ========== ESTADÍSTICAS ========== */
.estadisticas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.stat-card {
  background: #1e1e1e;
  padding: 14px 16px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.07);
  transition: all 0.15s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255,215,0,0.3);
}

.stat-card.confirmado {
  background: #1e1e1e;
  border-color: rgba(255,215,0,0.25);
}

.stat-card.pendiente {
  background: #1e1e1e;
  border-color: rgba(255,255,255,0.07);
}

.stat-numero {
  font-size: 26px;
  font-weight: 700;
  color: #FFD700;
}

.stat-label {
  font-size: 14px;
  color: #FFD700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 5px;
}

/* ========== LISTA DE INVITADOS ========== */
.lista-wrapper {
  position: relative;
}

.lista-wrapper.lista-fetching .lista {
  opacity: 0.45;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.lista-loading-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 2px solid #FFD700;
  background: rgba(26, 26, 26, 0.9);
  color: #FFD700;
  font-size: 0.9em;
  font-weight: 600;
}

.loading-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #FFD700;
  box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.6);
  animation: pulse-dot 1.2s infinite;
}

@keyframes pulse-dot {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.6);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(255, 215, 0, 0);
  }
  100% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
  }
}

.lista {
  position: relative;
}

.invitado-item {
  background: #141414;
  border: 1px solid rgba(255,255,255,0.07);
  border-left: 3px solid transparent;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 5px;
  transition: border-color 0.15s;
}

.invitado-item:hover {
  border-color: rgba(255,255,255,0.12);
  border-left-color: #FFD700;
}

.invitado-item.confirmado {
  border-left-color: #FFD700;
}

.info-invitado {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nombre-categoria {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nombre {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.badge {
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.badge.vip {
  background: #FFD700;
  color: #111;
}

.badge.familia {
  background: #fef3c7;
  color: #92400e;
}

.badge.amigos {
  background: #ede9fe;
  color: #5b21b6;
}

.badge.trabajo {
  background: #dbeafe;
  color: #1e40af;
}

.badge.general {
  background: #f3f4f6;
  color: #4b5563;
}

/* ========== ACCIONES ========== */
.acciones {
  display: flex;
  gap: 8px;
}

.btn-editar {
  padding: 5px 11px;
  background: transparent;
  color: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s;
  font-family: inherit;
}

.btn-editar:hover {
  background: rgba(255,255,255,0.06);
  color: #fff;
}

.btn-confirmar {
  padding: 5px 11px;
  background: transparent;
  color: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s;
  font-family: inherit;
}

.btn-confirmar.activo {
  background: #FFD700;
  color: #111;
  border-color: #FFD700;
  font-weight: 600;
}

.btn-confirmar:hover {
  background: rgba(255,215,0,0.1);
  border-color: rgba(255,215,0,0.4);
  color: #FFD700;
}

.btn-eliminar {
  padding: 5px 11px;
  background: transparent;
  color: rgba(239,68,68,0.65);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s;
  font-family: inherit;
}

.btn-eliminar:hover {
  background: rgba(239,68,68,0.08);
  border-color: rgba(239,68,68,0.4);
  color: #f87171;
}

/* ========== MODO EDICIÓN ========== */
.modo-edicion {
  display: flex;
  gap: 8px;
  width: 100%;
}

.input-editar {
  flex: 1;
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  background: #0f0f0f;
  color: #fff;
  font-family: inherit;
  transition: border-color 0.15s;
}

.input-editar:focus {
  outline: none;
  border-color: rgba(255,215,0,0.5);
}

.btn-guardar {
  padding: 7px 16px;
  background: #FFD700;
  color: #111;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: background 0.15s;
}

.btn-guardar:hover {
  background: #f0c800;
}

.btn-cancelar {
  padding: 6px 12px;
  background: transparent;
  color: rgba(255,255,255,0.4);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s;
  font-family: inherit;
}

.btn-cancelar:hover {
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.75);
}

/* ========== MENSAJES VACÍOS ========== */
.vacio {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.vacio p {
  font-size: 20px;
  margin-bottom: 10px;
}

.subtexto {
  font-size: 14px;
  font-style: italic;
  color: #9ca3af;
}

/* ========== ANIMACIONES ========== */
.list-enter-active {
  transition: all 0.3s ease;
}

.list-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: 100%;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .estadisticas {
    grid-template-columns: 1fr;
  }

  .formulario {
    flex-direction: column;
  }

  .barra-busqueda {
    flex-direction: column;
  }

  .silla-info {
    flex-direction: column;
  }

  .info-invitado {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .acciones-excel {
    flex-direction: column;
  }
}

/* Estilos para historial de búsqueda y filtros guardados */
.search-container {
  position: relative;
  flex: 1;
}

.historial-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #1a1a1a;
  border: 1px solid rgba(255,215,0,0.25);
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.4);
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
}

.historial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-weight: 600;
  font-size: 0.8em;
  color: rgba(255,255,255,0.35);
}

.btn-limpiar-historial {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0 5px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-limpiar-historial:hover {
  opacity: 1;
}

.historial-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 12px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.historial-item:hover {
  background: rgba(255,255,255,0.04);
}

.historial-item:last-child {
  border-bottom: none;
}

.historial-text {
  flex: 1;
  color: rgba(255,255,255,0.7);
  font-size: 0.9em;
}

.btn-eliminar-historial {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5em;
  padding: 0 8px;
  color: #999;
  transition: color 0.2s;
}

.btn-eliminar-historial:hover {
  color: #f44336;
}

.btn-limpiar,
.btn-filtros-guardados {
  padding: 8px 14px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-limpiar:hover,
.btn-filtros-guardados:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.panel-filtros-guardados {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px 20px;
  margin: 12px 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.panel-header h3 {
  margin: 0;
  color: #111;
  font-size: 1rem;
  font-weight: 700;
}

.btn-cerrar-panel {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.15s;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cerrar-panel:hover {
  color: #ef4444;
}

.guardar-filtro-section {
  background: #f9fafb;
  border-radius: 6px;
  padding: 12px 14px;
  margin-bottom: 14px;
}

.guardar-filtro-section h4 {
  margin: 0 0 10px 0;
  color: #111;
  font-size: 0.9rem;
  font-weight: 600;
}

.filtro-actual-info {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 10px;
}

.filtro-actual-info p {
  margin: 4px 0;
  color: #6b7280;
  font-size: 0.85rem;
}

.filtro-actual-info strong {
  color: #111;
}

.guardar-filtro-form {
  display: flex;
  gap: 8px;
}

.input-nombre-filtro {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.15s;
}

.input-nombre-filtro:focus {
  outline: none;
  border-color: #FFD700;
}

.btn-guardar-filtro {
  padding: 8px 16px;
  background: #FFD700;
  color: #111;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.btn-guardar-filtro:hover {
  background: #f0c800;
}

.lista-filtros-guardados {
  margin-top: 20px;
}

.lista-filtros-guardados h4 {
  margin: 0 0 15px 0;
  color: #1a1a1a;
  font-size: 1.1em;
}

.filtros-vacio {
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
}

.filtro-guardado-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  transition: all 0.3s;
}

.filtro-guardado-item:hover {
  border-color: #FFD700;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.2);
}

.filtro-info {
  flex: 1;
}

.filtro-nombre {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 5px;
  font-size: 1.05em;
}

.filtro-descripcion {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.filtro-meta {
  color: #999;
  font-size: 0.85em;
}

.filtro-acciones {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-aplicar-filtro {
  padding: 8px 16px;
  background: #FFD700;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-aplicar-filtro:hover {
  background: #FFA500;
  transform: translateY(-2px);
}

.btn-eliminar-filtro {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.3em;
  padding: 5px 10px;
  color: #999;
  transition: color 0.2s;
}

.btn-eliminar-filtro:hover {
  color: #f44336;
}

.paginacion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding: 14px;
  border: 2px solid #FFD700;
  border-radius: 12px;
  background: #f8f8f8;
}

.paginacion-info {
  font-size: 0.95em;
  color: #1a1a1a;
  font-weight: 600;
}

.paginacion-controles {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-paginacion {
  padding: 8px 12px;
  border: 2px solid #FFD700;
  border-radius: 8px;
  background: #fff;
  color: #1a1a1a;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-paginacion:hover:not(:disabled) {
  background: #FFD700;
}

.btn-paginacion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagina-actual {
  font-size: 0.9em;
  color: #4a4a4a;
  font-weight: 600;
}

.paginacion-tamanio {
  display: flex;
  align-items: center;
  gap: 8px;
}

.paginacion-tamanio select {
  padding: 6px 10px;
  border: 2px solid #FFD700;
  border-radius: 8px;
  background: #fff;
}
</style>
