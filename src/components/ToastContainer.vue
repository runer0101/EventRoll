<template>
  <div class="toast-container">
    <ToastNotification
      v-for="toast in toasts"
      :key="toast.id"
      :message="toast.message"
      :title="toast.title"
      :type="toast.type"
      :duration="0"
      :style="{ top: `${20 + toasts.indexOf(toast) * 100}px` }"
      @close="removeToast(toast.id)"
    />
  </div>
</template>

<script setup>
import ToastNotification from './ToastNotification.vue'
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
  pointer-events: none;
}

.toast-container > * {
  pointer-events: all;
}
</style>
