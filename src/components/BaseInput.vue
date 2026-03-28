<template>
  <div class="field-group">
    <label v-if="label" :for="inputId" class="field-label">{{ label }}</label>
    <div class="input-wrapper" :class="{ 'has-error': !!error }">
      <input
        :id="inputId"
        v-model="model"
        class="field-input"
        v-bind="$attrs"
        :aria-invalid="!!error"
        :aria-describedby="error ? errorId : undefined"
      />
    </div>
    <FieldError v-if="error" :id="errorId" :mensaje="error" />
  </div>
</template>

<script setup>
import { useId } from 'vue'
import FieldError from './FieldError.vue'

const model = defineModel({ type: String })

defineProps({
  label: { type: String, default: '' },
  error: { type: String, default: '' },
})

defineOptions({ inheritAttrs: false })

const inputId = useId()
const errorId = useId()
</script>

<style scoped>
.field-group { display: flex; flex-direction: column; gap: 0.35rem; }
.field-label { font-size: 0.875rem; font-weight: 600; color: rgba(255,255,255,0.7); }
.input-wrapper { position: relative; }
.field-input {
  width: 100%;
  padding: 0.6rem 0.875rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--radius-md, 8px);
  color: #fff;
  font-size: 0.9375rem;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
  box-sizing: border-box;
}
.field-input:focus {
  border-color: rgba(255,215,0,0.5);
  box-shadow: 0 0 0 3px rgba(255,215,0,0.1);
}
.input-wrapper.has-error .field-input {
  border-color: rgba(239,68,68,0.6);
}
.input-wrapper.has-error .field-input:focus {
  box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
}
</style>
