<template>
  <div class="lista-invitados">

    <h2>Gestión de Invitados</h2>

    <GuestStats
      v-model:sillas-disponibles="sillasDisponibles"
      :sillas-restantes="sillasRestantes"
      :invitados-confirmados="invitadosConfirmados"
      :porcentaje-ocupacion="porcentajeOcupacion"
      :permisos="permisos"
    />

    <div class="acciones-excel">
      <div v-if="permisos.exportarExcel || permisos.importarExcel" class="acciones-group">
        <button
          v-if="permisos.importarExcel"
          class="btn-importar"
          title="Importar invitados desde archivo Excel"
          @click="abrirSelectorArchivo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Importar Excel
        </button>
        <button
          v-if="permisos.exportarExcel"
          class="btn-exportar"
          title="Exportar lista a formato Excel (.xlsx)"
          @click="exportarExcel"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Excel
        </button>
        <button
          v-if="permisos.exportarExcel"
          class="btn-exportar"
          title="Exportar lista a formato CSV"
          @click="exportarCSV"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSV
        </button>
      </div>

      <input
        ref="inputArchivo"
        type="file"
        accept=".xlsx, .xls"
        style="display: none"
        @change="importarExcel"
      />

      <button class="btn-plantilla" title="Descargar plantilla de ejemplo" @click="descargarPlantilla">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
        Plantilla
      </button>
    </div>

    <SearchBar
      ref="searchBarRef"
      v-model:texto-busqueda="textoBusqueda"
      v-model:filtro-categoria="filtroCategoria"
      v-model:filtro-estado="filtroEstado"
      v-model:orden-ascendente="ordenAscendente"
      v-model:mostrar-filtros-guardados="mostrarFiltrosGuardados"
      :saved-filters-count="savedFilters.length"
    />

    <div v-if="permisos.agregarInvitados" class="seccion-agregar">
      <div class="seccion-agregar__header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Agregar invitado
      </div>
      <div class="formulario">
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
    </div>

    <div v-if="mostrarFiltrosGuardados" class="panel-filtros-guardados">
      <div class="panel-header">
        <h3>Filtros Guardados</h3>
        <button class="btn-cerrar-panel" @click="mostrarFiltrosGuardados = false">×</button>
      </div>

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

    <div class="estadisticas">
      <div class="estadisticas-card">
        <div class="stat-numero">{{ totalFiltrados }}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="estadisticas-card confirmado">
        <div class="stat-numero">{{ invitadosConfirmados }}</div>
        <div class="stat-label">Confirmados</div>
      </div>
      <div class="estadisticas-card pendiente">
        <div class="stat-numero">{{ invitadosPendientes }}</div>
        <div class="stat-label">Pendientes</div>
      </div>
    </div>

    <div class="lista-wrapper" :class="{ 'lista-fetching': isFetching }">
      <div v-if="isFetching" class="lista-loading-indicator" aria-live="polite">
        <span class="loading-dot"></span>
        <span>Cargando invitados...</span>
      </div>

      <TransitionGroup name="list" tag="div" class="lista">
        <GuestRow
          v-for="invitado in invitadosMostrados"
          :key="invitado.id"
          v-model:nombre-editando="nombreEditando"
          v-model:apellido-editando="apellidoEditando"
          :invitado="invitado"
          :editando-id="editandoId"
          :permisos="permisos"
          @confirm="toggleConfirmacion"
          @delete="eliminarInvitado"
          @start-edit="iniciarEdicion"
          @save-edit="guardarEdicion"
          @cancel-edit="cancelarEdicion"
        />
      </TransitionGroup>
    </div>

    <PaginationBar
      v-if="modoBackend && backendPagination.totalPages > 1"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-pages="backendPagination.totalPages"
      :total="invitadosMostrados.length"
      :total-items="backendPagination.total"
      :disabled="isFetching"
      @go-to-page="irAPagina"
    />

    <EmptyState
      v-if="totalFiltrados === 0 && !hayFiltrosActivos"
      icon="Users"
      titulo="Sin invitados aún"
      descripcion="Agrega el primero con el formulario de arriba o importa un archivo Excel."
    />

    <EmptyState
      v-else-if="totalFiltrados === 0 && hayFiltrosActivos"
      icon="Search"
      titulo="Sin resultados"
      descripcion="No se encontraron invitados con esos criterios. Intenta cambiar los filtros de búsqueda."
    />

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'

import EmptyState from './EmptyState.vue'
import GuestStats from './GuestStats.vue'
import SearchBar from './SearchBar.vue'
import PaginationBar from './PaginationBar.vue'
import GuestRow from './GuestRow.vue'

import { useToast } from '../composables/useToast'
import { useLoading } from '../composables/useLoading'
import { useSearchHistory } from '../composables/useSearchHistory'
import { useSavedFilters } from '../composables/useSavedFilters'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'
import { PermisosKey, RegistrarActividadKey, EventoIdActualKey } from '../composables/injection-keys'

import { invitadosAPI } from '../services/api'

const { success, error, warning } = useToast()
const { show: showLoading, hide: hideLoading, updateProgress } = useLoading()
const { addSearch } = useSearchHistory()
const { savedFilters, saveFilter, deleteFilter, applyFilter } = useSavedFilters()
const shortcuts = useKeyboardShortcuts()

const obtenerPermisos = inject(PermisosKey, () => ({}))
const registrarActividad = inject(RegistrarActividadKey, () => {})
const obtenerEventoIdActual = inject(EventoIdActualKey, () => null)

const permisos = computed(() => obtenerPermisos())
const eventoIdActual = computed(() => {
  const value = obtenerEventoIdActual()
  const id = String(value ?? '').trim()
  return id ? id : null
})

const nuevoNombre = ref('')
const nuevoApellido = ref('')
const nuevaCategoria = ref('General')
const invitados = ref([])
const textoBusqueda = ref('')
const filtroCategoria = ref('')
const filtroEstado = ref('')
const sillasDisponibles = ref(100)
const editandoId = ref(null)
const nombreEditando = ref('')
const apellidoEditando = ref('')
const inputArchivo = ref(null)
const ordenAscendente = ref(true)
const mostrarFiltrosGuardados = ref(false)
const nombreFiltroNuevo = ref('')
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

const searchBarRef = ref(null)
const nombreInput = ref(null)

const modoBackend = ref(true)

onMounted(() => {
  cargarDatos()
  configurarAtajosTeclado()
})

function configurarAtajosTeclado() {
  shortcuts.init()

  shortcuts.register('ctrl+f', (e) => {
    e.preventDefault()
    searchBarRef.value?.searchInput?.focus()
  }, 'Enfocar búsqueda')

  shortcuts.register('ctrl+k', () => {
    mostrarFiltrosGuardados.value = !mostrarFiltrosGuardados.value
  }, 'Alternar filtros guardados')

  shortcuts.register('escape', () => {
    if (mostrarFiltrosGuardados.value) {
      mostrarFiltrosGuardados.value = false
    } else if (textoBusqueda.value) {
      textoBusqueda.value = ''
    }
  }, 'Limpiar búsqueda/cerrar panel')

  shortcuts.register('ctrl+e', () => {
    if (permisos.value.exportarExcel) {
      exportarExcel()
    }
  }, 'Exportar a Excel')

  shortcuts.register('ctrl+shift+e', () => {
    if (permisos.value.exportarExcel) {
      exportarCSV()
    }
  }, 'Exportar a CSV')

  shortcuts.register('ctrl+i', () => {
    if (permisos.value.importarExcel) {
      abrirSelectorArchivo()
    }
  }, 'Importar desde Excel')

  shortcuts.register('ctrl+n', () => {
    if (permisos.value.agregarInvitados) {
      nombreInput.value?.focus()
    }
  }, 'Nuevo invitado')
}

let _fetchSeq = 0

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

async function exportarCSV() {
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

    const headers = ['Nombre', 'Apellido', 'Categoría', 'Estado']

    updateProgress(30, 'Procesando datos...')

    const rows = invitados.value.map(inv => [
      inv.nombre,
      inv.apellido,
      inv.categoria,
      inv.confirmado ? 'Confirmado' : 'Pendiente'
    ])

    updateProgress(60, 'Generando archivo...')
    await new Promise(resolve => setTimeout(resolve, 300))

    const csvEscape = (val) => {
      const str = val == null ? '' : String(val)
      return /[,"\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
    }

    const csvContent = [
      headers.map(csvEscape).join(','),
      ...rows.map(row => row.map(csvEscape).join(','))
    ].join('\n')

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
  } catch {
    error('Ocurrió un error al exportar el archivo CSV', 'Error de Exportación')
  } finally {
    hideLoading()
  }
}

async function exportarExcel() {
  if (!permisos.value.exportarExcel) {
    error('No tienes permiso para exportar a Excel', 'Acceso Denegado')
    return
  }

  if (invitados.value.length === 0) {
    warning('No hay invitados para exportar', 'Lista Vacía')
    return
  }

  try {
    showLoading({ message: 'Exportando a Excel...', progress: 0 })

    const datosExcel = invitados.value.map(inv => ({
      'Nombre': inv.nombre,
      'Apellido': inv.apellido,
      'Categoría': inv.categoria,
      'Estado': inv.confirmado ? 'Confirmado' : 'Pendiente'
    }))

    updateProgress(30, 'Procesando datos...')
    await new Promise(resolve => setTimeout(resolve, 300))

    const mod = await import('exceljs')
    const ExcelJS = mod.default || mod
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Invitados')

    const headers = ['Nombre', 'Apellido', 'Categoría', 'Estado']
    sheet.addRow(headers)

    for (const r of datosExcel) {
      sheet.addRow([r.Nombre, r.Apellido, r['Categoría'], r.Estado])
    }

    sheet.columns = [
      { width: 20 },
      { width: 20 },
      { width: 15 },
      { width: 15 }
    ]

    updateProgress(80, 'Creando archivo...')
    await new Promise(resolve => setTimeout(resolve, 400))

    const fecha = new Date().toISOString().split('T')[0]
    const nombreArchivo = `Invitados_${fecha}.xlsx`

    updateProgress(95, 'Descargando...')

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
  } catch {
    error('Ocurrió un error al exportar el archivo Excel', 'Error de Exportación')
  } finally {
    hideLoading()
  }
}

async function importarExcel(evento) {
  if (!permisos.value.importarExcel) {
    error('No tienes permiso para importar desde Excel', 'Acceso Denegado')
    evento.target.value = ''
    return
  }

  const archivo = evento.target.files[0]

  if (!archivo) return

  const MAX_FILE_SIZE = 5 * 1024 * 1024
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

  const lector = new FileReader()

  lector.onload = async (e) => {
    try {
      updateProgress(20, 'Leyendo archivo Excel...')

      const { parseExcelBuffer } = await import('@/utils/excelImporter.js')
      let parsed
      try {
        parsed = await parseExcelBuffer(e.target.result, { maxRows: MAX_ROWS, maxFieldLength: 1000 })
      } catch (parseErr) {
        hideLoading()

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

      let datosJson = parsed.rows

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

      datosJson = datosJson.slice(0, MAX_ROWS).map(row => {
        const cleaned = {}
        for (const [k, v] of Object.entries(row)) {
          const val = typeof v === 'string' ? v.trim() : String(v)
          cleaned[k] = val.length > 1000 ? val.slice(0, 1000) : val
        }
        return cleaned
      })

      updateProgress(60, `Importando ${datosJson.length} filas...`)

      if (modoBackend.value) {
        try {
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

            const categoriasValidas = ['General', 'VIP', 'Familia', 'Amigos', 'Trabajo']
            const categoriaFinal = categoriasValidas.includes(categoria) ? categoria : 'General'

            return {
              nombre: nombre.trim(),
              apellido: apellido.trim(),
              categoria: categoriaFinal,
              confirmado: estado.toLowerCase().includes('confirmado')
            }
          }).filter(inv => inv.nombre !== '')

          updateProgress(75, `Enviando ${invitadosParaImportar.length} invitados al servidor...`)

          const response = await invitadosAPI.import(invitadosParaImportar, eventoIdActual.value)

          if (response.success && response.data) {
            const { importados, duplicados, errores } = response.data

            updateProgress(90, 'Recargando lista...')
            await cargarDatos()

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
        } catch {
          warning('Error al importar con backend, usando modo local', 'Modo Local', 4000)
          modoBackend.value = false
        }
      }

      let importados = 0
      let duplicados = 0
      let filasInvalidas = 0
      const erroresPorFila = []

      datosJson.forEach((fila, index) => {
        const buscarColumna = (variaciones) => {
          for (let variacion of variaciones) {
            if (fila[variacion] !== undefined && fila[variacion] !== null && fila[variacion] !== '') {
              return String(fila[variacion]).trim()
            }
          }
          return ''
        }

        const nombre = buscarColumna([
          'Nombre', 'nombre', 'NOMBRE',
          'Nombres', 'nombres', 'NOMBRES',
          'Name', 'name', 'NAME',
          'First Name', 'first name', 'FIRST NAME',
          'FirstName', 'firstname', 'FIRSTNAME'
        ])

        const apellido = buscarColumna([
          'Apellido', 'apellido', 'APELLIDO',
          'Apellidos', 'apellidos', 'APELLIDOS',
          'Last Name', 'last name', 'LAST NAME',
          'LastName', 'lastname', 'LASTNAME',
          'Surname', 'surname', 'SURNAME'
        ])

        const categoria = buscarColumna([
          'Categoría', 'categoria', 'CATEGORIA',
          'Categoria', 'CATEGORÍA',
          'Category', 'category', 'CATEGORY',
          'Tipo', 'tipo', 'TIPO',
          'Type', 'type', 'TYPE'
        ]) || 'General'

        const estado = buscarColumna([
          'Estado', 'estado', 'ESTADO',
          'Status', 'status', 'STATUS',
          'Confirmación', 'confirmacion', 'CONFIRMACION',
          'Confirmado', 'confirmado', 'CONFIRMADO',
          'Confirmed', 'confirmed', 'CONFIRMED'
        ]) || 'Pendiente'

        if (!nombre.trim()) {
          filasInvalidas++
          erroresPorFila.push(`Fila ${index + 2}: Falta el nombre`)
          return
        }

        const existe = invitados.value.some(inv =>
          inv.nombre.toLowerCase() === nombre.toLowerCase() &&
          inv.apellido.toLowerCase() === apellido.toLowerCase()
        )

        if (existe) {
          duplicados++
          erroresPorFila.push(`Fila ${index + 2}: "${nombre} ${apellido}" ya existe`)
          return
        }

        const categoriasValidas = ['General', 'VIP', 'Familia', 'Amigos', 'Trabajo']
        const categoriaFinal = categoriasValidas.includes(categoria) ? categoria : 'General'

        invitados.value.push({
          id: Date.now() + importados,
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

    }

    evento.target.value = ''
  }

  lector.readAsArrayBuffer(archivo)
}

function abrirSelectorArchivo() {
  inputArchivo.value.click()
}

async function descargarPlantilla() {
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
    success('Plantilla descargada. Editala y luego importa el archivo.', 'Plantilla lista')
  } catch {
    error('Error generando la plantilla. Intenta nuevamente.', 'Error')
  }
}

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

let recargaBackendTimer = null

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

function eliminarFiltroGuardado(filterId) {
  const confirmar = confirm('¿Estás seguro de eliminar este filtro guardado?')
  if (confirmar) {
    deleteFilter(filterId)
    success('Filtro eliminado correctamente', 'Filtro Eliminado')
  }
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
</script>

<style scoped>
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

.acciones-excel {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.acciones-group {
  display: flex;
  gap: 6px;
  padding: 4px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 9px;
}

.btn-importar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #FFD700;
  color: #111;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.15s;
}

.btn-importar:hover {
  background: #ffe033;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255,215,0,0.25);
}

.btn-exportar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  color: rgba(255,255,255,0.75);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
}

.btn-exportar:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.25);
  color: #fff;
}

.btn-plantilla {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  color: rgba(255,255,255,0.35);
  border: 1px dashed rgba(255,255,255,0.1);
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
  margin-left: auto;
}

.btn-plantilla:hover {
  color: rgba(255,255,255,0.65);
  border-color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.04);
}

.seccion-agregar {
  margin-bottom: 12px;
  background: #141414;
  border: 1px solid rgba(255,215,0,0.15);
  border-radius: 8px;
  overflow: hidden;
}

.seccion-agregar__header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255,215,0,0.6);
  background: rgba(255,215,0,0.04);
  border-bottom: 1px solid rgba(255,215,0,0.1);
}

.formulario {
  display: flex;
  gap: 8px;
  padding: 10px;
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

.estadisticas {
  display: flex;
  gap: 0;
  margin-bottom: 12px;
  background: #141414;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  overflow: hidden;
}

.estadisticas-card {
  flex: 1;
  padding: 12px 16px;
  text-align: center;
  border-right: 1px solid rgba(255,255,255,0.06);
  transition: background 0.15s;
}

.estadisticas-card:last-child { border-right: none; }
.estadisticas-card:hover { background: rgba(255,255,255,0.02); }

.estadisticas-card.confirmado .stat-numero { color: #4ade80; }
.estadisticas-card.confirmado .stat-label  { color: rgba(74,222,128,0.5); }

.estadisticas-card.pendiente .stat-numero { color: rgba(255,255,255,0.5); }
.estadisticas-card.pendiente .stat-label  { color: rgba(255,255,255,0.25); }

.stat-numero {
  font-size: 22px;
  font-weight: 700;
  color: #FFD700;
  line-height: 1;
}

.stat-label {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255,215,0,0.5);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 4px;
}

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

.vacio {
  text-align: center;
  padding: 56px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.vacio-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.2);
  margin-bottom: 4px;
}

.vacio-icon--search {
  color: rgba(255,215,0,0.3);
  background: rgba(255,215,0,0.04);
  border-color: rgba(255,215,0,0.1);
}

.vacio-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  margin: 0;
}

.subtexto {
  font-size: 13px;
  color: rgba(255,255,255,0.3);
  line-height: 1.6;
  margin: 0;
}

.panel-filtros-guardados {
  background: #141414;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px;
  padding: 14px 18px;
  margin: 10px 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.panel-header h3 {
  margin: 0;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
}

.btn-cerrar-panel {
  background: rgba(255,255,255,0.05);
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: rgba(255,255,255,0.4);
  transition: color 0.15s;
  padding: 0;
  width: 26px;
  height: 26px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cerrar-panel:hover {
  color: #f87171;
  background: rgba(239,68,68,0.08);
}

.guardar-filtro-section {
  background: rgba(255,255,255,0.04);
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 12px;
}

.guardar-filtro-section h4 {
  margin: 0 0 8px 0;
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  font-weight: 600;
}

.filtro-actual-info {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  padding: 8px 10px;
  margin-bottom: 8px;
}

.filtro-actual-info p {
  margin: 3px 0;
  color: rgba(255,255,255,0.4);
  font-size: 0.82rem;
}

.filtro-actual-info strong {
  color: rgba(255,255,255,0.8);
}

.guardar-filtro-form {
  display: flex;
  gap: 8px;
}

.input-nombre-filtro {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  font-size: 0.9rem;
  background: #0f0f0f;
  color: #fff;
  font-family: inherit;
  transition: border-color 0.15s;
}

.input-nombre-filtro::placeholder { color: rgba(255,255,255,0.3); }

.input-nombre-filtro:focus {
  outline: none;
  border-color: rgba(255,215,0,0.5);
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
  margin: 0 0 10px 0;
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  font-weight: 600;
}

.filtros-vacio {
  text-align: center;
  padding: 30px;
  color: rgba(255,255,255,0.3);
  font-style: italic;
  font-size: 0.875rem;
}

.filtro-guardado-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 7px;
  padding: 10px 12px;
  margin-bottom: 6px;
  transition: border-color 0.15s;
}

.filtro-guardado-item:hover {
  border-color: rgba(255,215,0,0.3);
}

.filtro-info {
  flex: 1;
}

.filtro-nombre {
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  margin-bottom: 3px;
  font-size: 0.875rem;
}

.filtro-descripcion {
  color: rgba(255,255,255,0.4);
  font-size: 0.8rem;
  margin-bottom: 3px;
}

.filtro-meta {
  color: rgba(255,255,255,0.25);
  font-size: 0.75rem;
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

@media (max-width: 480px) {
  .acciones-excel {
    flex-direction: column;
    align-items: stretch;
  }
  .acciones-excel button { width: 100%; justify-content: center; }

  .formulario { flex-direction: column; }

  .estadisticas { flex-direction: column; gap: 0; }
  .estadisticas-card { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .estadisticas-card:last-child { border-bottom: none; }

  .panel-filtros-guardados { padding: 10px; }
}

@media (min-width: 481px) and (max-width: 768px) {
  .formulario { flex-direction: column; }

  .acciones-excel { flex-wrap: wrap; gap: 8px; }
  .btn-plantilla { margin-left: 0; }

  .estadisticas { flex-wrap: wrap; }
  .estadisticas-card { flex: 1 1 45%; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .btn-plantilla { margin-left: 0; }
}
</style>
