<template>
  <Transition name="toast-slide">
    <div v-if="visible" :class="['toast', type]" @click="cerrar">
      <div class="toast-icon">
        <span v-if="type === 'success'">OK</span>
        <span v-else-if="type === 'error'">X</span>
        <span v-else-if="type === 'warning'">!</span>
        <span v-else>i</span>
      </div>
      <div class="toast-content">
        <div v-if="title" class="toast-title">{{ title }}</div>
        <div class="toast-message">{{ message }}</div>
      </div>
      <button class="toast-close" @click.stop="cerrar">×</button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info', // success, error, warning, info
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000 // 3 segundos por defecto
  }
})

const emit = defineEmits(['close'])

const visible = ref(false)
onMounted(() => {
  // Mostrar toast con pequeño delay para animación
  setTimeout(() => {
    visible.value = true
  }, 100)

  // Auto-cerrar después de la duración especificada
  if (props.duration > 0) {
    setTimeout(() => {
      cerrar()
    }, props.duration)
  }
})

function cerrar() {
  visible.value = false
  setTimeout(() => {
    emit('close')
  }, 300) // Esperar a que termine la animación
}
</script>

<style scoped>
.toast {
  position: fixed;
  top: var(--spacing-md);
  right: var(--spacing-md);
  min-width: 18rem;
  max-width: 32rem;
  background: var(--bg-card-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  z-index: var(--z-toast);
  cursor: pointer;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal), opacity var(--transition-normal);
}

.toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.2);
}

/* Tipos de toast */
.toast.success {
  border-left: 0.3125rem solid var(--color-success);
}

.toast.error {
  border-left: 0.3125rem solid var(--color-error);
}

.toast.warning {
  border-left: 0.3125rem solid var(--color-warning);
}

.toast.info {
  border-left: 0.3125rem solid var(--color-info);
}

/* Icono */
.toast-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.toast.success .toast-icon {
  background: color-mix(in srgb, var(--color-success) 18%, white);
  color: var(--color-success);
}

.toast.error .toast-icon {
  background: color-mix(in srgb, var(--color-error) 18%, white);
  color: var(--color-error);
}

.toast.warning .toast-icon {
  background: color-mix(in srgb, var(--color-warning) 18%, white);
  color: var(--color-warning);
}

.toast.info .toast-icon {
  background: color-mix(in srgb, var(--color-info) 18%, white);
  color: var(--color-info);
}

/* Contenido */
.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-dark);
  margin-bottom: 0.25rem;
}

.toast-message {
  font-size: var(--font-size-sm);
  color: #444;
  line-height: 1.4;
}

/* Botón cerrar */
.toast-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f2f2f2;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #6d6d6d;
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-close:hover {
  background: #e5e5e5;
  color: #222;
}

/* Animaciones */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 768px) {
  .toast {
    min-width: 0;
    max-width: calc(100vw - 2rem);
    right: 1rem;
    left: 1rem;
  }
}
</style>
