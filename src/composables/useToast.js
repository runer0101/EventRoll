import { ref, markRaw } from 'vue'

// Estado global de toasts
const toasts = ref([])
let idCounter = 0

export function useToast() {
  // Función para mostrar toast
  function show(options) {
    const id = idCounter++

    const toast = markRaw({
      id,
      message: options.message || '',
      title: options.title || '',
      type: options.type || 'info',
      duration: options.duration !== undefined ? options.duration : 3000
    })

    toasts.value.push(toast)

    // Auto-remover después de la duración + tiempo de animación
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration + 500)
    }

    return id
  }

  // Métodos de conveniencia
  function success(message, title = '', duration) {
    return show({ message, title, type: 'success', duration })
  }

  function error(message, title = '', duration) {
    return show({ message, title, type: 'error', duration })
  }

  function warning(message, title = '', duration) {
    return show({ message, title, type: 'warning', duration })
  }

  function info(message, title = '', duration) {
    return show({ message, title, type: 'info', duration })
  }

  // Remover toast específico
  function removeToast(id) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  // Limpiar todos los toasts
  function clearAll() {
    toasts.value = []
  }

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    removeToast,
    clearAll
  }
}
