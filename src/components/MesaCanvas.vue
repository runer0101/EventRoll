<script setup>
import { ref, watch, onMounted } from 'vue'
import { useEventoStore } from '../stores/evento'
import { usePlanoStore } from '../stores/plano'
import MesaRedonda from './MesaRedonda.vue'

const eventoStore = useEventoStore()
const planoStore = usePlanoStore()

const svgEl = ref(null)
const viewBox = ref({ x: 0, y: 0, w: 1200, h: 800 })
const zoom = ref(1)

onMounted(() => {
  if (eventoStore.eventoId) {
    planoStore.cargarMesas(eventoStore.eventoId)
    planoStore.cargarInvitadosSinMesa(eventoStore.eventoId)
  }
})

watch(() => eventoStore.eventoId, (id) => {
  if (id) {
    planoStore.cargarMesas(id)
    planoStore.cargarInvitadosSinMesa(id)
  }
})

function onWheel(e) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  zoom.value = Math.max(0.3, Math.min(2, zoom.value + delta))
}

function onDragOverCanvas(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

function onDropCanvas(e) {
  e.preventDefault()
  const raw = e.dataTransfer.getData('text/plain')
  if (!raw) return
  try {
    const data = JSON.parse(raw)
    if (data.type === 'desasignar') {
      planoStore.desasignarInvitado(data.invitadoId)
    }
  } catch { /* ignorar */ }
}

async function onMover({ id, pos_x, pos_y }) {
  await planoStore.actualizarPosicion(id, pos_x, pos_y)
}

async function onAsignar({ mesaId, invitadoId, posicion }) {
  await planoStore.asignarInvitado(mesaId, invitadoId, posicion)
  if (eventoStore.eventoId) {
    planoStore.cargarInvitadosSinMesa(eventoStore.eventoId)
  }
}

async function crearMesa() {
  if (!eventoStore.eventoId) return
  const count = planoStore.mesas.length + 1
  await planoStore.crearMesa({
    evento_id: eventoStore.eventoId,
    nombre: `Mesa ${count}`,
    sillas: 8,
    pos_x: 100 + ((count - 1) % 5) * 200,
    pos_y: 100 + Math.floor((count - 1) / 5) * 250
  })
}

const miniDragState = ref(null)

function startPan(e) {
  if (e.target !== svgEl.value || e.button !== 0) return
  miniDragState.value = { x: e.clientX, y: e.clientY, vb: { ...viewBox.value } }
  document.addEventListener('mousemove', onPan)
  document.addEventListener('mouseup', stopPan)
}

function onPan(e) {
  if (!miniDragState.value) return
  const dx = (e.clientX - miniDragState.value.x) / zoom.value
  const dy = (e.clientY - miniDragState.value.y) / zoom.value
  viewBox.value.x = miniDragState.value.vb.x - dx
  viewBox.value.y = miniDragState.value.vb.y - dy
}

function stopPan() {
  miniDragState.value = null
  document.removeEventListener('mousemove', onPan)
  document.removeEventListener('mouseup', stopPan)
}
</script>

<template>
  <div class="canvas-wrapper" @wheel="onWheel">
    <div class="canvas-toolbar">
      <button class="btn-canvas" @click="crearMesa">+ Mesa</button>
      <span class="zoom-label">{{ Math.round(zoom * 100) }}%</span>
    </div>
    <svg
      ref="svgEl"
      :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w / zoom} ${viewBox.h / zoom}`"
      class="mesa-canvas"
      @dragover="onDragOverCanvas"
      @drop="onDropCanvas"
      @mousedown="startPan"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
        </pattern>
      </defs>
      <rect width="3000" height="3000" fill="url(#grid)" />
      <MesaRedonda
        v-for="mesa in planoStore.mesas"
        :key="mesa.id"
        :mesa="mesa"
        @asignar="onAsignar"
        @mover="onMover"
      />
    </svg>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  flex: 1;
  background: #0d0d0d;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.07);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.canvas-toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(10,10,10,0.8);
  backdrop-filter: blur(8px);
  z-index: 2;
}

.btn-canvas {
  padding: 0.45rem 1rem;
  background: rgba(255,215,0,0.1);
  border: 1px solid rgba(255,215,0,0.3);
  border-radius: 7px;
  color: #FFD700;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-canvas:hover {
  background: rgba(255,215,0,0.18);
}

.zoom-label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.3);
  margin-left: auto;
}

.mesa-canvas {
  flex: 1;
  width: 100%;
  height: 100%;
  cursor: grab;
}
.mesa-canvas:active {
  cursor: grabbing;
}
</style>
