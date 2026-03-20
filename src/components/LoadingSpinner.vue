<template>
  <Transition name="fade">
    <div v-if="visible" class="loading-overlay" :class="{ 'overlay-transparent': !fullOverlay }">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-content">
          <div v-if="message" class="spinner-message">{{ message }}</div>
          <div v-if="progress !== null" class="spinner-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
            </div>
            <span class="progress-text">{{ Math.round(progress) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  message: {
    type: String,
    default: 'Cargando...'
  },
  progress: {
    type: Number,
    default: null
  },
  fullOverlay: {
    type: Boolean,
    default: true
  }
})

const visible = ref(false)

onMounted(() => {
  visible.value = true
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(14, 14, 14, 0.76);
  backdrop-filter: blur(0.25rem);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.overlay-transparent {
  background: rgba(14, 14, 14, 0.45);
}

.loading-spinner {
  position: relative;
  background: var(--bg-surface);
  border: 0.1875rem solid var(--accent);
  border-radius: var(--radius-xl);
  padding: 2.25rem 2.5rem;
  box-shadow: 0 0.75rem 2.5rem rgba(255, 215, 0, 0.24);
  min-width: 18rem;
  text-align: center;
}

.spinner-ring {
  width: 4.75rem;
  height: 4.75rem;
  margin: 0 auto 1.25rem;
  border: 0.375rem solid rgba(255, 215, 0, 0.2);
  border-top: 0.375rem solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.spinner-icon {
  font-size: 2.5em;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.spinner-message {
  color: var(--accent);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.02em;
}

.spinner-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: rgba(255, 215, 0, 0.2);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #ffad08);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.progress-text {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .loading-spinner {
    padding: 1.875rem 2rem;
    min-width: 15rem;
  }

  .spinner-ring {
    width: 3.75rem;
    height: 3.75rem;
  }

  .spinner-message {
    font-size: var(--font-size-base);
  }
}
</style>
