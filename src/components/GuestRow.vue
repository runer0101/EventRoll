<template>
  <div
    class="invitado-item"
    :class="{ confirmado: invitado.confirmado }"
  >
    <div v-if="editandoId === invitado.id" class="modo-edicion">
      <input
        :value="nombreEditando"
        type="text"
        placeholder="Nombre(s)"
        class="input-editar"
        @input="$emit('update:nombreEditando', $event.target.value)"
        @keyup.enter="$emit('save-edit')"
        @keyup.esc="$emit('cancel-edit')"
      />
      <input
        :value="apellidoEditando"
        type="text"
        placeholder="Apellido(s)"
        class="input-editar"
        @input="$emit('update:apellidoEditando', $event.target.value)"
        @keyup.enter="$emit('save-edit')"
        @keyup.esc="$emit('cancel-edit')"
      />
      <button class="btn-guardar" @click="$emit('save-edit')">Guardar</button>
      <button class="btn-cancelar" @click="$emit('cancel-edit')">Cancelar</button>
    </div>

    <div v-else class="info-invitado">
      <div class="nombre-categoria">
        <div class="invitado-avatar" :class="invitado.confirmado ? 'avatar--confirmed' : 'avatar--pending'">
          {{ (invitado.nombre || '?').charAt(0).toUpperCase() }}
        </div>
        <div class="invitado-name-wrap">
          <span class="nombre">{{ invitado.nombre }} {{ invitado.apellido }}</span>
          <span class="badge" :class="invitado.categoria.toLowerCase()">
            {{ invitado.categoria }}
          </span>
        </div>
      </div>

      <div class="acciones">
        <button
          v-if="permisos.editarInvitados"
          class="btn-editar"
          :title="`Editar: ${invitado.nombre} ${invitado.apellido || ''}`"
          :aria-label="`Editar invitado: ${invitado.nombre} ${invitado.apellido || ''}`"
          @click="$emit('start-edit', invitado)"
        >
          Editar
        </button>

        <button
          v-if="permisos.confirmarInvitados"
          class="btn-confirmar"
          :class="{ activo: invitado.confirmado }"
          :aria-label="`${invitado.confirmado ? 'Quitar confirmación' : 'Confirmar asistencia'} de ${invitado.nombre} ${invitado.apellido || ''}`"
          :aria-pressed="invitado.confirmado"
          @click="$emit('confirm', invitado.id)"
        >
          {{ invitado.confirmado ? 'Confirmado' : 'Pendiente' }}
        </button>

        <button
          v-if="permisos.eliminarInvitados"
          class="btn-eliminar"
          :aria-label="`Eliminar invitado: ${invitado.nombre} ${invitado.apellido || ''}`"
          @click="$emit('delete', invitado.id)"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  invitado: { type: Object, required: true },
  editandoId: { type: [Number, null], default: null },
  nombreEditando: { type: String, default: '' },
  apellidoEditando: { type: String, default: '' },
  permisos: { type: Object, required: true }
})

defineEmits(['update:nombreEditando', 'update:apellidoEditando', 'confirm', 'delete', 'start-edit', 'save-edit', 'cancel-edit'])
</script>

<style scoped>
.invitado-item {
  background: #141414;
  border: 1px solid rgba(255,255,255,0.07);
  border-left: 3px solid transparent;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 5px;
  transition: border-color 0.15s;
}

.invitado-item:hover {
  border-color: rgba(255,255,255,0.12);
  border-left-color: #FFD700;
}

.invitado-item.confirmado {
  border-left-color: #4ade80;
}

.invitado-item:not(.confirmado) {
  border-left-color: rgba(255,255,255,0.12);
}

.info-invitado {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nombre-categoria {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.nombre {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.badge {
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.badge.vip {
  background: #FFD700;
  color: #111;
}

.badge.familia {
  background: #fef3c7;
  color: #92400e;
}

.badge.amigos {
  background: #ede9fe;
  color: #5b21b6;
}

.badge.trabajo {
  background: #dbeafe;
  color: #1e40af;
}

.badge.general {
  background: #f3f4f6;
  color: #4b5563;
}

.invitado-avatar {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.avatar--confirmed {
  background: rgba(74,222,128,0.12);
  color: #4ade80;
  border: 1px solid rgba(74,222,128,0.25);
}

.avatar--pending {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.4);
  border: 1px solid rgba(255,255,255,0.08);
}

.invitado-name-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.acciones {
  display: flex;
  gap: 8px;
}

.btn-editar {
  padding: 5px 11px;
  background: transparent;
  color: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s;
  font-family: inherit;
}

.btn-editar:hover {
  background: rgba(255,255,255,0.06);
  color: #fff;
}

.btn-confirmar {
  padding: 5px 11px;
  background: transparent;
  color: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s;
  font-family: inherit;
}

.btn-confirmar.activo {
  background: #FFD700;
  color: #111;
  border-color: #FFD700;
  font-weight: 600;
}

.btn-confirmar:hover {
  background: rgba(255,215,0,0.1);
  border-color: rgba(255,215,0,0.4);
  color: #FFD700;
}

.btn-eliminar {
  padding: 5px 11px;
  background: transparent;
  color: rgba(239,68,68,0.65);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s;
  font-family: inherit;
}

.btn-eliminar:hover {
  background: rgba(239,68,68,0.08);
  border-color: rgba(239,68,68,0.4);
  color: #f87171;
}

.modo-edicion {
  display: flex;
  gap: 8px;
  width: 100%;
}

.input-editar {
  flex: 1;
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  background: #0f0f0f;
  color: #fff;
  font-family: inherit;
  transition: border-color 0.15s;
}

.input-editar:focus {
  outline: none;
  border-color: rgba(255,215,0,0.5);
}

.btn-guardar {
  padding: 7px 16px;
  background: #FFD700;
  color: #111;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: background 0.15s;
}

.btn-guardar:hover {
  background: #f0c800;
}

.btn-cancelar {
  padding: 6px 12px;
  background: transparent;
  color: rgba(255,255,255,0.4);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s;
  font-family: inherit;
}

.btn-cancelar:hover {
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.75);
}

@media (max-width: 480px) {
  .info-invitado {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .info-invitado {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>
