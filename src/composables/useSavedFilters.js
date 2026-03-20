import { ref } from 'vue'

const STORAGE_KEY = 'eventroll_saved_filters'
const MAX_SAVED_FILTERS = 10

// Estado global de filtros guardados
const savedFilters = ref([])

export function useSavedFilters() {
  // Cargar filtros desde localStorage
  function loadFilters() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          savedFilters.value = parsed
        }
      }
    } catch (error) {
      console.error('Error al cargar filtros guardados:', error)
      savedFilters.value = []
    }
  }

  // Guardar filtros en localStorage
  function saveFiltersToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFilters.value))
    } catch (error) {
      console.error('Error al guardar filtros:', error)
    }
  }

  // Guardar un nuevo filtro
  function saveFilter(filterData) {
    // Validar que el filtro tenga datos
    if (!filterData || !filterData.name) {
      throw new Error('El filtro debe tener un nombre')
    }

    // Verificar si ya existe un filtro con ese nombre
    const exists = savedFilters.value.some(
      f => f.name.toLowerCase() === filterData.name.toLowerCase()
    )

    if (exists) {
      throw new Error(`Ya existe un filtro llamado "${filterData.name}"`)
    }

    // Crear el filtro con metadatos
    const newFilter = {
      id: Date.now(),
      name: filterData.name,
      description: filterData.description || '',
      filters: {
        searchText: filterData.searchText || '',
        category: filterData.category || '',
        status: filterData.status || ''
      },
      createdAt: new Date().toISOString(),
      usageCount: 0,
      lastUsed: null
    }

    // Agregar al inicio de la lista
    savedFilters.value.unshift(newFilter)

    // Limitar el número de filtros guardados
    if (savedFilters.value.length > MAX_SAVED_FILTERS) {
      savedFilters.value = savedFilters.value.slice(0, MAX_SAVED_FILTERS)
    }

    saveFiltersToStorage()
    return newFilter
  }

  // Actualizar un filtro existente
  function updateFilter(filterId, filterData) {
    const index = savedFilters.value.findIndex(f => f.id === filterId)
    if (index !== -1) {
      savedFilters.value[index] = {
        ...savedFilters.value[index],
        ...filterData,
        id: filterId, // Preservar el ID original
        createdAt: savedFilters.value[index].createdAt // Preservar fecha de creación
      }
      saveFiltersToStorage()
      return savedFilters.value[index]
    }
    return null
  }

  // Eliminar un filtro
  function deleteFilter(filterId) {
    savedFilters.value = savedFilters.value.filter(f => f.id !== filterId)
    saveFiltersToStorage()
  }

  // Aplicar un filtro (incrementar contador de uso)
  function applyFilter(filterId) {
    const filter = savedFilters.value.find(f => f.id === filterId)
    if (filter) {
      filter.usageCount++
      filter.lastUsed = new Date().toISOString()
      saveFiltersToStorage()
      return filter.filters
    }
    return null
  }

  // Obtener filtros ordenados por más usados
  function getMostUsedFilters(limit = 5) {
    return [...savedFilters.value]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
  }

  // Obtener filtros ordenados por más recientes
  function getRecentFilters(limit = 5) {
    return [...savedFilters.value]
      .sort((a, b) => {
        const dateA = new Date(a.lastUsed || a.createdAt)
        const dateB = new Date(b.lastUsed || b.createdAt)
        return dateB - dateA
      })
      .slice(0, limit)
  }

  // Limpiar todos los filtros
  function clearAllFilters() {
    savedFilters.value = []
    saveFiltersToStorage()
  }

  // Buscar filtros por nombre
  function searchFilters(query) {
    if (!query || query.trim() === '') {
      return savedFilters.value
    }

    const lowerQuery = query.toLowerCase()
    return savedFilters.value.filter(
      f =>
        f.name.toLowerCase().includes(lowerQuery) ||
        (f.description && f.description.toLowerCase().includes(lowerQuery))
    )
  }

  // Verificar si existe un filtro con ese nombre
  function hasFilter(name) {
    return savedFilters.value.some(
      f => f.name.toLowerCase() === name.toLowerCase()
    )
  }

  // Cargar filtros al inicializar
  if (savedFilters.value.length === 0) {
    loadFilters()
  }

  return {
    savedFilters,
    saveFilter,
    updateFilter,
    deleteFilter,
    applyFilter,
    getMostUsedFilters,
    getRecentFilters,
    clearAllFilters,
    searchFilters,
    hasFilter,
    loadFilters
  }
}
