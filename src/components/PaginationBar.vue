<template>
  <div class="paginacion">
    <div class="paginacion-info">
      Mostrando {{ total }} de {{ totalItems }} invitados
    </div>
    <div class="paginacion-controles">
      <button
        class="btn-paginacion"
        :disabled="currentPage === 1 || disabled"
        @click="goTo(1)"
      >
        Primera
      </button>
      <button
        class="btn-paginacion"
        :disabled="currentPage === 1 || disabled"
        @click="goTo(currentPage - 1)"
      >
        Anterior
      </button>
      <span class="pagina-actual">Página {{ currentPage }} de {{ totalPages }}</span>
      <button
        class="btn-paginacion"
        :disabled="currentPage >= totalPages || disabled"
        @click="goTo(currentPage + 1)"
      >
        Siguiente
      </button>
      <button
        class="btn-paginacion"
        :disabled="currentPage >= totalPages || disabled"
        @click="goTo(totalPages)"
      >
        Última
      </button>
    </div>
    <div class="paginacion-tamanio">
      <label for="page-size">Por página:</label>
      <select id="page-size" :value="pageSize" :disabled="disabled" @change="$emit('update:pageSize', Number($event.target.value))">
        <option :value="25">25</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  total: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:currentPage', 'update:pageSize', 'goToPage'])

function goTo(page) {
  const pageNum = Number(page)
  if (!Number.isInteger(pageNum)) return
  if (pageNum < 1 || pageNum > props.totalPages) return
  if (pageNum === props.currentPage) return
  emit('update:currentPage', pageNum)
  emit('goToPage', pageNum)
}
</script>

<style scoped>
.paginacion {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.paginacion-info {
  text-align: center;
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.02em;
}

.paginacion-controles {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-paginacion {
  padding: 7px 14px;
  background: #1a1a1a;
  color: rgba(255,255,255,0.65);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-paginacion:hover:not(:disabled) {
  background: rgba(255,215,0,0.08);
  border-color: rgba(255,215,0,0.3);
  color: #FFD700;
}

.btn-paginacion:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagina-actual {
  padding: 7px 16px;
  background: rgba(255,215,0,0.08);
  border: 1px solid rgba(255,215,0,0.2);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #FFD700;
  white-space: nowrap;
}

.paginacion-tamanio {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255,255,255,0.35);
}

.paginacion-tamanio select {
  background: #1a1a1a;
  color: rgba(255,255,255,0.6);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}

@media (max-width: 480px) {
  .paginacion-controles {
    flex-wrap: wrap;
    gap: 4px;
  }
  .btn-paginacion {
    padding: 6px 10px;
    font-size: 11px;
  }
  .pagina-actual {
    padding: 6px 10px;
    font-size: 11px;
  }
  .paginacion-tamanio {
    font-size: 11px;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .paginacion-controles {
    flex-wrap: wrap;
    gap: 5px;
  }
  .btn-paginacion {
    padding: 6px 12px;
    font-size: 12px;
  }
  .pagina-actual {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
