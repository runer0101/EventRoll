/* eslint-disable vue/one-component-per-file */
import { ref } from 'vue'
import { createApp } from 'vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

// Estado global de loading
const isLoading = ref(false)
const loadingMessage = ref('Cargando...')
const loadingProgress = ref(null)
let loadingInstance = null
let mountedContainer = null

export function useLoading() {
  // Función para mostrar loading
  function show(options = {}) {
    const message = options.message || 'Cargando...'
    const progress = options.progress !== undefined ? options.progress : null
    const fullOverlay = options.fullOverlay !== undefined ? options.fullOverlay : true

    isLoading.value = true
    loadingMessage.value = message
    loadingProgress.value = progress

    // Crear contenedor si no existe
    if (!mountedContainer) {
      mountedContainer = document.createElement('div')
      mountedContainer.id = 'loading-container'
      document.body.appendChild(mountedContainer)
    }

    // Crear instancia de Vue con el componente
    if (!loadingInstance) {
      loadingInstance = createApp(LoadingSpinner, {
        message: message,
        progress: progress,
        fullOverlay: fullOverlay
      })
      loadingInstance.mount(mountedContainer)
    }
  }

  // Función para actualizar el progreso
  function updateProgress(progress, message) {
    loadingProgress.value = progress
    if (message) {
      loadingMessage.value = message
    }

    // Actualizar props del componente si existe
    if (loadingInstance && mountedContainer) {
      // Desmontar y volver a montar con nuevos props
      loadingInstance.unmount()
      loadingInstance = createApp(LoadingSpinner, {
        message: loadingMessage.value,
        progress: loadingProgress.value,
        fullOverlay: true
      })
      loadingInstance.mount(mountedContainer)
    }
  }

  // Función para ocultar loading
  function hide() {
    isLoading.value = false
    loadingMessage.value = 'Cargando...'
    loadingProgress.value = null

    // Desmontar y limpiar
    if (loadingInstance && mountedContainer) {
      setTimeout(() => {
        loadingInstance.unmount()
        loadingInstance = null
        if (mountedContainer && mountedContainer.parentNode) {
          mountedContainer.parentNode.removeChild(mountedContainer)
          mountedContainer = null
        }
      }, 300) // Tiempo para la animación de salida
    }
  }

  // Función wrapper para ejecutar operación con loading
  async function withLoading(asyncFn, options = {}) {
    try {
      show(options)
      const result = await asyncFn()
      return result
    } finally {
      hide()
    }
  }

  return {
    isLoading,
    loadingMessage,
    loadingProgress,
    show,
    hide,
    updateProgress,
    withLoading
  }
}
