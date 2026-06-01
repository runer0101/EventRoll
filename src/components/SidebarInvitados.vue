<script setup>
import { ArrowUpRight } from 'lucide-vue-next'
import { usePlanoStore } from '../stores/plano'

const planoStore = usePlanoStore()

function onDragStart(e, invitado) {
  e.dataTransfer.setData('text/plain', JSON.stringify({
    type: 'asignar',
    invitadoId: invitado.id
  }))
  e.dataTransfer.effectAllowed = 'move'
}

function badgeColor(categoria) {
  const map = {
    VIP: '#f59e0b',
    Familia: '#8b5cf6',
    Amigos: '#3b82f6',
    Trabajo: '#10b981',
    General: '#6b7280'
  }
  return map[categoria] || '#6b7280'
}
</script>

<template>
  <div class="sidebar-invitados">
    <div class="sidebar-header">
      <h3>Invitados sin mesa</h3>
      <span class="count-badge">{{ planoStore.invitadosSinMesa.length }}</span>
    </div>
    <div v-if="planoStore.invitadosSinMesa.length === 0" class="empty-hint">
      Todos los invitados están asignados
    </div>
    <div
      v-for="inv in planoStore.invitadosSinMesa"
      :key="inv.id"
      class="invitado-item"
      draggable="true"
      @dragstart="onDragStart($event, inv)"
    >
      <div class="inv-avatar" :style="{ background: inv.confirmado ? '#22c55e' : '#6b7280' }">
        {{ (inv.nombre?.charAt(0) || '?').toUpperCase() }}
      </div>
      <div class="inv-info">
        <span class="inv-nombre">{{ inv.nombre }} {{ inv.apellido || '' }}</span>
        <span class="inv-categoria" :style="{ color: badgeColor(inv.categoria) }">{{ inv.categoria }}</span>
      </div>
      <ArrowUpRight :size="14" class="drag-hint" />
    </div>
  </div>
</template>

<style scoped>
.sidebar-invitados {
  width: 260px;
  background: rgba(8,8,8,0.92);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.sidebar-header h3 {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255,255,255,0.7);
}
.count-badge {
  background: #FFD700;
  color: #111;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 10px;
}

.empty-hint {
  padding: 2rem 1rem;
  text-align: center;
  color: rgba(255,255,255,0.25);
  font-size: 0.8rem;
}

.invitado-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  cursor: grab;
  transition: background 0.15s;
}
.invitado-item:hover {
  background: rgba(255,255,255,0.04);
}
.invitado-item:active {
  cursor: grabbing;
}

.inv-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.3);
}

.inv-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.inv-nombre {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.inv-categoria {
  font-size: 0.7rem;
  font-weight: 600;
}

.drag-hint {
  color: rgba(255,255,255,0.2);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
}
.invitado-item:hover .drag-hint {
  opacity: 0.6;
}
</style>
