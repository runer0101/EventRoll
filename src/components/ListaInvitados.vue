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
import { ref, computed, onMounted, inject } from 'vue'

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
import { useInvitados } from '../composables/useInvitados'
import { useExcelOperations } from '../composables/useExcelOperations'
import { PermisosKey, RegistrarActividadKey, EventoIdActualKey } from '../composables/injection-keys'

const toast = useToast()
const loading = useLoading()
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
const textoBusqueda = ref('')
const filtroCategoria = ref('')
const filtroEstado = ref('')
const ordenAscendente = ref(true)
const mostrarFiltrosGuardados = ref(false)
const nombreFiltroNuevo = ref('')

const searchBarRef = ref(null)
const nombreInput = ref(null)

const invitadosCtx = useInvitados({
  permisos,
  eventoIdActual,
  registrarActividad,
  toast: { success: toast.success, error: toast.error, warning: toast.warning },
  loading: { show: loading.show, hide: loading.hide, updateProgress: loading.updateProgress },
  addSearch,
  filtroCategoria,
  filtroEstado,
  ordenAscendente,
  textoBusqueda,
  nuevoNombre,
  nuevoApellido,
  nuevaCategoria,
})

const {
  invitados,
  modoBackend,
  sillasDisponibles,
  currentPage,
  pageSize,
  editandoId,
  nombreEditando,
  apellidoEditando,
  cargarDatos,
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
  invitadosMostrados,
  isFetching,
  backendPagination,
} = invitadosCtx

const excelCtx = useExcelOperations({
  permisos,
  invitados,
  modoBackend,
  eventoIdActual,
  registrarActividad,
  toast: { success: toast.success, error: toast.error, warning: toast.warning },
  loading: { show: loading.show, hide: loading.hide, updateProgress: loading.updateProgress },
  cargarDatos,
})

const {
  inputArchivo,
  exportarCSV,
  exportarExcel,
  importarExcel,
  abrirSelectorArchivo,
  descargarPlantilla,
} = excelCtx

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

function guardarFiltroActual() {
  const { success, error, warning } = toast
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
  const { success } = toast
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
  const { success } = toast
  const confirmar = confirm('¿Estás seguro de eliminar este filtro guardado?')
  if (confirmar) {
    deleteFilter(filterId)
    success('Filtro eliminado correctamente', 'Filtro Eliminado')
  }
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
