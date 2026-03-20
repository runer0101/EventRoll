import { onMounted, onUnmounted } from 'vue'

// Mapa de atajos registrados
const shortcuts = new Map()

export function useKeyboardShortcuts() {
  // Registrar un atajo de teclado
  function register(keys, callback, description = '') {
    const shortcut = {
      keys: Array.isArray(keys) ? keys : [keys],
      callback,
      description
    }

    // Usar el primer conjunto de teclas como clave
    const key = Array.isArray(keys) ? keys[0] : keys
    shortcuts.set(key, shortcut)
  }

  // Desregistrar un atajo
  function unregister(keys) {
    const key = Array.isArray(keys) ? keys[0] : keys
    shortcuts.delete(key)
  }

  // Manejar evento de teclado
  function handleKeyDown(event) {
    // Construir la combinación de teclas presionadas
    const parts = []

    if (event.ctrlKey) parts.push('ctrl')
    if (event.altKey) parts.push('alt')
    if (event.shiftKey) parts.push('shift')
    if (event.metaKey) parts.push('meta')

    // Agregar la tecla principal (normalizada a minúsculas)
    const key = event.key.toLowerCase()
    if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
      parts.push(key)
    }

    const combination = parts.join('+')

    // Buscar si hay un atajo registrado para esta combinación
    for (const [, shortcut] of shortcuts) {
      for (const shortcutKey of shortcut.keys) {
        if (shortcutKey === combination) {
          // Prevenir el comportamiento por defecto
          event.preventDefault()
          event.stopPropagation()

          // Ejecutar el callback
          shortcut.callback(event)
          return
        }
      }
    }
  }

  // Obtener todos los atajos registrados
  function getAll() {
    const allShortcuts = []
    for (const [, shortcut] of shortcuts) {
      allShortcuts.push({
        keys: shortcut.keys,
        description: shortcut.description
      })
    }
    return allShortcuts
  }

  // Formatear teclas para mostrar
  function formatKeys(keys) {
    const keyArray = Array.isArray(keys) ? keys : [keys]
    return keyArray.map(key => {
      return key
        .split('+')
        .map(k => {
          // Capitalizar y formatear
          if (k === 'ctrl') return 'Ctrl'
          if (k === 'alt') return 'Alt'
          if (k === 'shift') return 'Shift'
          if (k === 'meta') return 'Cmd'
          return k.toUpperCase()
        })
        .join(' + ')
    }).join(' o ')
  }

  // Limpiar todos los atajos
  function clearAll() {
    shortcuts.clear()
  }

  // Inicializar el listener de eventos
  function init() {
    window.addEventListener('keydown', handleKeyDown)
  }

  // Limpiar el listener
  function destroy() {
    window.removeEventListener('keydown', handleKeyDown)
  }

  return {
    register,
    unregister,
    getAll,
    formatKeys,
    clearAll,
    init,
    destroy
  }
}

// Composable para usar en componentes con auto-cleanup
export function useComponentShortcuts() {
  const shortcuts = useKeyboardShortcuts()

  onMounted(() => {
    shortcuts.init()
  })

  onUnmounted(() => {
    shortcuts.destroy()
  })

  return shortcuts
}
