<template>
  <Teleport to="body">
    <TransitionGroup
      tag="div"
      class="toast-container"
      name="toast"
      aria-live="polite"
      aria-atomic="false"
    >
      <ToastNotification
        v-for="toast in toasts"
        :key="toast.id"
        v-bind="toast"
        :style="{ '--toast-index': toasts.indexOf(toast) }"
        @close="removeToast(toast.id)"
      />
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast'
import ToastNotification from './ToastNotification.vue'

const { toasts, removeToast } = useToast()
</script>

<style>
/* No scoped — Teleport mueve el contenido fuera del componente raíz */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
  width: min(22rem, calc(100vw - 2rem));
}

.toast-container > * {
  pointer-events: all;
}

/* TransitionGroup animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(110%);
}

.toast-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 640px) {
  .toast-container {
    top: auto;
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    width: auto;
  }
  .toast-enter-from,
  .toast-leave-to {
    transform: translateY(110%);
  }
}
</style>
