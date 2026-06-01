<template>
  <div class="barra-busqueda">
    <div class="search-container">
      <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input
        ref="searchInput"
        :value="textoBusqueda"
        type="text"
        placeholder="Buscar por nombre o apellido..."
        class="input-busqueda"
        @input="$emit('update:textoBusqueda', $event.target.value)"
        @focus="onSearchFocus"
        @blur="onSearchBlur"
      />

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

    <select :value="filtroCategoria" class="select-filtro" @change="$emit('update:filtroCategoria', $event.target.value)">
      <option value="">Todas las categorías</option>
      <option value="General">General</option>
      <option value="VIP">VIP</option>
      <option value="Familia">Familia</option>
      <option value="Amigos">Amigos</option>
      <option value="Trabajo">Trabajo</option>
    </select>

    <select :value="filtroEstado" class="select-filtro" @change="$emit('update:filtroEstado', $event.target.value)">
      <option value="">Todos los estados</option>
      <option value="confirmado">Confirmados</option>
      <option value="pendiente">Pendientes</option>
    </select>

    <button class="btn-ordenar" title="Ordenar alfabéticamente" @click="$emit('update:ordenAscendente', !ordenAscendente)">
      {{ ordenAscendente ? 'A-Z ↑' : 'Z-A ↓' }}
    </button>

    <button class="btn-limpiar" title="Limpiar todos los filtros" @click="limpiarFiltros">
      Limpiar
    </button>

    <button class="btn-filtros-guardados" title="Gestionar filtros guardados" @click="$emit('update:mostrarFiltrosGuardados', !mostrarFiltrosGuardados)">
      Filtros {{ savedFiltersCount > 0 ? `(${savedFiltersCount})` : '' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSearchHistory } from '../composables/useSearchHistory'

defineProps({
  textoBusqueda: { type: String, default: '' },
  filtroCategoria: { type: String, default: '' },
  filtroEstado: { type: String, default: '' },
  ordenAscendente: { type: Boolean, default: true },
  mostrarFiltrosGuardados: { type: Boolean, default: false },
  savedFiltersCount: { type: Number, default: 0 }
})

const emit = defineEmits([
  'update:textoBusqueda',
  'update:filtroCategoria',
  'update:filtroEstado',
  'update:ordenAscendente',
  'update:mostrarFiltrosGuardados'
])

const { addSearch, removeSearch, clearHistory, getRecentSearches } = useSearchHistory()

const searchInput = ref(null)
const mostrarHistorial = ref(false)

function onSearchFocus() {
  mostrarHistorial.value = getRecentSearches().length > 0
}

function onSearchBlur() {
  setTimeout(() => mostrarHistorial.value = false, 200)
}

function aplicarBusquedaHistorial(searchText) {
  emit('update:textoBusqueda', searchText)
  mostrarHistorial.value = false
  addSearch(searchText)
}

function limpiarFiltros() {
  emit('update:textoBusqueda', '')
  emit('update:filtroCategoria', '')
  emit('update:filtroEstado', '')
}

defineExpose({ searchInput })
</script>

<style scoped>
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

.search-container {
  position: relative;
  flex: 1;
  min-width: 180px;
}

.search-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.3);
  pointer-events: none;
  z-index: 1;
}

.input-busqueda {
  padding-left: 34px;
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
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: rgba(255,255,255,0.55);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  font-family: inherit;
}

.btn-limpiar:hover,
.btn-filtros-guardados:hover {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.9);
  border-color: rgba(255,255,255,0.2);
}

@media (max-width: 480px) {
  .barra-busqueda { flex-direction: column; }
  .barra-busqueda select { width: 100%; }
  .search-container { min-width: 0; }
}

@media (min-width: 481px) and (max-width: 768px) {
  .barra-busqueda {
    flex-wrap: wrap;
    gap: 8px;
  }
  .barra-busqueda select { flex: 1 1 140px; }
  .search-container { flex: 1 1 100%; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .barra-busqueda { flex-wrap: wrap; gap: 8px; }
  .barra-busqueda select { flex: 1 1 160px; }
}
</style>
