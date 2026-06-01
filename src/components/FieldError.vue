<script setup>
import { useId } from 'vue'
import { AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  mensaje: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
})

const autoId = useId()
const resolvedId = props.id || autoId

defineExpose({ id: resolvedId })
</script>

<template>
  <p
    v-if="mensaje"
    :id="resolvedId"
    class="field-error"
    role="alert"
    aria-live="polite"
  >
    <AlertCircle :size="14" aria-hidden="true" />
    {{ mensaje }}
  </p>
</template>

<style scoped>
.field-error {
  margin: 0.3rem 0 0;
  font-size: 0.8rem;
  color: #fca5a5;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
</style>
