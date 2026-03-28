import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isLoading = ref(false)
  const activeModal = ref(null)
  const notifications = ref([])

  function setLoading(value) {
    isLoading.value = value
  }

  function openModal(name) {
    activeModal.value = name
  }

  function closeModal() {
    activeModal.value = null
  }

  function addNotification({ mensaje, tipo = 'info', duracion = 4000 }) {
    const id = Date.now()
    notifications.value.push({ id, mensaje, tipo })
    setTimeout(() => removeNotification(id), duracion)
    return id
  }

  function removeNotification(id) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  return {
    isLoading,
    activeModal,
    notifications,
    setLoading,
    openModal,
    closeModal,
    addNotification,
    removeNotification,
  }
})
