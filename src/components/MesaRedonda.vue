<script setup>
import { computed } from 'vue'
import { usePlanoStore } from '../stores/plano'

const props = defineProps({
  mesa: { type: Object, required: true }
})

const emit = defineEmits(['asignar', 'desasignar', 'mover'])

const planoStore = usePlanoStore()
const RADIO = 55
const RADIO_SILLA = 12

const sillas = computed(() => {
  const arr = []
  for (let i = 1; i <= props.mesa.sillas; i++) {
    const asig = props.mesa.asignaciones?.find(a => a.posicion === i) || null
    arr.push({ posicion: i, asignacion: asig })
  }
  return arr
})

function posicionSilla(index, total) {
  const angulo = (index / total) * Math.PI * 2 - Math.PI / 2
  const distancia = RADIO + 18
  return {
    x: Math.cos(angulo) * distancia,
    y: Math.sin(angulo) * distancia
  }
}

function colorSilla(asignacion) {
  if (!asignacion) return '#2a2a2a'
  return asignacion.invitado_confirmado ? '#22c55e' : '#6b7280'
}

function colorBordeSilla(asignacion) {
  if (!asignacion) return '#444'
  return asignacion.invitado_confirmado ? '#16a34a' : '#4b5563'
}

function iniciales(asignacion) {
  if (!asignacion) return ''
  const n = asignacion.invitado_nombre?.charAt(0) || ''
  const a = asignacion.invitado_apellido?.charAt(0) || ''
  return (n + a).toUpperCase() || '?'
}

function ocupadas() {
  return props.mesa.asignaciones?.length || 0
}

function onDragStartSilla(e, asignacion) {
  if (!asignacion) return
  e.dataTransfer.setData('text/plain', JSON.stringify({
    type: 'desasignar',
    invitadoId: asignacion.invitado_id,
    mesaId: props.mesa.id
  }))
  e.dataTransfer.effectAllowed = 'move'
}

function onDropSilla(e, posicion) {
  e.preventDefault()
  const raw = e.dataTransfer.getData('text/plain')
  if (!raw) return
  try {
    const data = JSON.parse(raw)
    if (data.type === 'asignar') {
      emit('asignar', { mesaId: props.mesa.id, invitadoId: data.invitadoId, posicion })
    }
  } catch { /* ignorar */ }
}

function onDragOver(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

let dragging = false
let startX = 0
let startY = 0
let origX = 0
let origY = 0

function onMouseDown(e) {
  if (e.target.tagName === 'circle' && e.target.dataset.silla) return
  dragging = true
  startX = e.clientX
  startY = e.clientY
  origX = props.mesa.pos_x
  origY = props.mesa.pos_y
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e) {
  if (!dragging) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  emit('mover', { id: props.mesa.id, pos_x: origX + dx, pos_y: origY + dy })
}

function onMouseUp() {
  dragging = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

function eliminarMesa() {
  if (confirm(`¿Eliminar ${props.mesa.nombre}?`)) {
    planoStore.eliminarMesa(props.mesa.id)
  }
}
</script>

<template>
  <g
    class="mesa-group"
    :transform="`translate(${mesa.pos_x}, ${mesa.pos_y})`"
    style="cursor: grab"
    @mousedown="onMouseDown"
  >
    <circle
      v-for="silla in sillas"
      :key="silla.posicion"
      :cx="posicionSilla(silla.posicion - 1, mesa.sillas).x"
      :cy="posicionSilla(silla.posicion - 1, mesa.sillas).y"
      :r="RADIO_SILLA"
      :fill="colorSilla(silla.asignacion)"
      :stroke="colorBordeSilla(silla.asignacion)"
      stroke-width="2"
      :data-silla="silla.posicion"
      :class="{ 'silla-ocupada': silla.asignacion, 'silla-vacia': !silla.asignacion }"
      :draggable="!!silla.asignacion"
      :title="silla.asignacion ? `${silla.asignacion.invitado_nombre} ${silla.asignacion.invitado_apellido || ''}` : `Silla ${silla.posicion} — vacía`"
      @dragover="onDragOver"
      @drop="onDropSilla($event, silla.posicion)"
      @dragstart="onDragStartSilla($event, silla.asignacion)"
    />
    <text
      v-for="silla in sillas"
      v-show="silla.asignacion"
      :key="'t' + silla.posicion"
      :x="posicionSilla(silla.posicion - 1, mesa.sillas).x"
      :y="posicionSilla(silla.posicion - 1, mesa.sillas).y + 1"
      text-anchor="middle"
      dominant-baseline="central"
      :fill="silla.asignacion?.invitado_confirmado ? '#fff' : '#ccc'"
      font-size="8"
      font-weight="700"
      style="pointer-events: none"
    >{{ iniciales(silla.asignacion) }}</text>

    <circle
      :r="RADIO"
      fill="#1a1a1a"
      stroke="#333"
      stroke-width="2"
    />
    <text
      text-anchor="middle"
      dominant-baseline="central"
      fill="rgba(255,215,0,0.8)"
      font-size="13"
      font-weight="700"
      style="pointer-events: none"
    >{{ mesa.nombre }}</text>
    <text
      y="16"
      text-anchor="middle"
      dominant-baseline="central"
      fill="rgba(255,255,255,0.35)"
      font-size="10"
      style="pointer-events: none"
    >{{ ocupadas() }}/{{ mesa.sillas }}</text>

    <circle
      v-if="ocupadas() > 0"
      :r="RADIO"
      fill="none"
      :stroke="ocupadas() === mesa.sillas ? '#22c55e' : '#eab308'"
      stroke-width="3"
      stroke-dasharray="6 4"
      opacity="0.4"
      style="pointer-events: none"
    />

    <foreignObject
      x="-12" :y="RADIO" width="24" height="24"
      style="cursor: pointer; overflow: visible"
    >
      <button
        class="btn-eliminar-mesa"
        title="Eliminar mesa"
        xmlns="http://www.w3.org/1999/xhtml"
        @click.stop="eliminarMesa"
      >×</button>
    </foreignObject>
  </g>
</template>

<style scoped>
.silla-vacia {
  cursor: pointer;
  transition: fill 0.15s;
}
.silla-vacia:hover {
  fill: #444;
}
.silla-ocupada {
  cursor: grab;
}
.btn-eliminar-mesa {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.3);
  color: #f87171;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}
.mesa-group:hover .btn-eliminar-mesa {
  opacity: 1;
}
</style>
