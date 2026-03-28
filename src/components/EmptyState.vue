<script setup>
defineProps({
  icon: {
    type: String,
    default: '📭',
  },
  titulo: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    default: '',
  },
  accionLabel: {
    type: String,
    default: '',
  },
})

defineEmits(['accion'])
</script>

<template>
  <div class="empty-state" role="status" aria-live="polite">
    <div class="empty-icon" aria-hidden="true">{{ icon }}</div>
    <h3 class="empty-title">{{ titulo }}</h3>
    <p v-if="descripcion" class="empty-desc">{{ descripcion }}</p>
    <button
      v-if="accionLabel"
      class="empty-action"
      type="button"
      @click="$emit('accion')"
    >
      {{ accionLabel }}
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(2rem, 5vw, 4rem) 1.5rem;
  text-align: center;
  gap: 0.75rem;
}

.empty-icon {
  font-size: clamp(2.5rem, 6vw, 3.5rem);
  line-height: 1;
  margin-bottom: 0.25rem;
  filter: grayscale(0.3);
}

.empty-title {
  margin: 0;
  font-family: 'Sora', var(--font-display);
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  font-weight: 700;
  color: var(--color-text-secondary);
}

.empty-desc {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  max-width: 360px;
  line-height: 1.6;
}

.empty-action {
  margin-top: 0.5rem;
  padding: 0.6rem 1.25rem;
  border: 1.5px solid rgba(255, 215, 0, 0.4);
  border-radius: var(--radius-md);
  background: rgba(255, 215, 0, 0.08);
  color: var(--color-primary);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.empty-action:hover {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.6);
  transform: translateY(-1px);
}

.empty-action:active {
  transform: scale(0.98) translateY(0);
}
</style>
