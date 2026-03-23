<template>
  <Transition name="toast-slide">
    <div v-if="visible" :class="['toast', type]" @click="cerrar">
      <div class="toast-icon">
        <!-- success -->
        <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <!-- error -->
        <svg v-else-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        <!-- warning -->
        <svg v-else-if="type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <!-- info -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  z-index: var(--z-toast);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.7);
}

/* Left accent border per type */
.toast.success { border-left: 3px solid #10b981; }
.toast.error   { border-left: 3px solid #ef4444; }
.toast.warning { border-left: 3px solid #f59e0b; }
.toast.info    { border-left: 3px solid #3b82f6; }

/* Icon circle */
.toast-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast.success .toast-icon { background: rgba(16,185,129,0.15); color: #10b981; }
.toast.error   .toast-icon { background: rgba(239,68,68,0.15);  color: #ef4444; }
.toast.warning .toast-icon { background: rgba(245,158,11,0.15); color: #f59e0b; }
.toast.info    .toast-icon { background: rgba(59,130,246,0.15); color: #3b82f6; }

/* Content */
.toast-content { flex: 1; min-width: 0; }

.toast-title {
  font-weight: 700;
  font-size: 0.875rem;
  color: #fff;
  margin-bottom: 2px;
}

.toast-message {
  font-size: 0.84rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.4;
}

/* Close button */
.toast-close {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  border: none;
  font-size: 18px;
  line-height: 1;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-close:hover {
  background: rgba(255,255,255,0.12);
  color: #fff;
}

/* Slide animation */
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
