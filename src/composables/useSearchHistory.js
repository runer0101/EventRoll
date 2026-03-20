import { ref } from 'vue'

const STORAGE_KEY = 'eventroll_search_history'
const MAX_HISTORY_ITEMS = 10

// Estado global del historial de búsqueda
const searchHistory = ref([])

export function useSearchHistory() {
  // Cargar historial desde localStorage al inicializar
  function loadHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          searchHistory.value = parsed
        }
      }
    } catch (error) {
      console.error('Error al cargar historial de búsqueda:', error)
      searchHistory.value = []
    }
  }

  // Guardar historial en localStorage
  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory.value))
    } catch (error) {
      console.error('Error al guardar historial de búsqueda:', error)
    }
  }

  // Agregar una búsqueda al historial
  function addSearch(searchText) {
    if (!searchText || searchText.trim() === '') return

    const trimmedSearch = searchText.trim()

    // Remover duplicado si existe
    searchHistory.value = searchHistory.value.filter(
      item => item.text.toLowerCase() !== trimmedSearch.toLowerCase()
    )

    // Agregar al inicio del historial
    searchHistory.value.unshift({
      text: trimmedSearch,
      timestamp: Date.now(),
      date: new Date().toISOString()
    })

    // Limitar el tamaño del historial
    if (searchHistory.value.length > MAX_HISTORY_ITEMS) {
      searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY_ITEMS)
    }

    saveHistory()
  }

  // Eliminar una búsqueda específica del historial
  function removeSearch(searchText) {
    searchHistory.value = searchHistory.value.filter(
      item => item.text !== searchText
    )
    saveHistory()
  }

  // Limpiar todo el historial
  function clearHistory() {
    searchHistory.value = []
    saveHistory()
  }

  // Obtener las búsquedas más recientes
  function getRecentSearches(limit = 5) {
    return searchHistory.value.slice(0, limit)
  }

  // Verificar si una búsqueda está en el historial
  function hasSearch(searchText) {
    return searchHistory.value.some(
      item => item.text.toLowerCase() === searchText.toLowerCase()
    )
  }

  // Cargar historial al inicializar
  if (searchHistory.value.length === 0) {
    loadHistory()
  }

  return {
    searchHistory,
    addSearch,
    removeSearch,
    clearHistory,
    getRecentSearches,
    hasSearch,
    loadHistory
  }
}
