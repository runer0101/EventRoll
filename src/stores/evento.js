import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'eventoIdActual'

const normalizar = (value) => {
  const str = String(value ?? '').trim()
  if (!/^\d+$/.test(str) || Number(str) < 1) return null
  return str
}

export const useEventoStore = defineStore('evento', () => {
  const eventoId = ref(normalizar(localStorage.getItem(STORAGE_KEY)) ?? '1')

  function setEventoId(value) {
    const normalizado = normalizar(value)
    if (!normalizado) return
    eventoId.value = normalizado
    localStorage.setItem(STORAGE_KEY, normalizado)
  }

  return { eventoId, setEventoId }
})
