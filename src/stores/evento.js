import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'eventoIdActual'

// UUID v4 regex
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const normalizar = (value) => {
  const str = String(value ?? '').trim()
  if (!UUID_RE.test(str)) return null
  return str
}

export const useEventoStore = defineStore('evento', () => {
  const eventoId = ref(normalizar(localStorage.getItem(STORAGE_KEY)))

  function setEventoId(value) {
    const normalizado = normalizar(value)
    if (!normalizado) return
    eventoId.value = normalizado
    localStorage.setItem(STORAGE_KEY, normalizado)
  }

  return { eventoId, setEventoId }
})
