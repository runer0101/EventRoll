<template>
  <div class="panel-usuarios">
    <div class="usuario-info">
      <div class="avatar">
        {{ usuario.nombre.charAt(0).toUpperCase() }}
      </div>
      <div class="info-texto">
        <h3>{{ usuario.nombre }}</h3>
        <p class="email">{{ usuario.email }}</p>
        <span :class="['badge-rol', usuario.rol]">
          {{ nombreRol }}
        </span>
      </div>
      <button class="btn-logout" @click="cerrarSesion">
        Cerrar Sesión
      </button>
    </div>

    <div class="permisos-card">
      <h4>Tus Permisos</h4>
      <div class="permisos-lista">
        <div
          v-for="permiso in permisosUsuario"
          :key="permiso.nombre"
          :class="['permiso-item', { activo: permiso.permitido }]"
        >
          <span class="icono">{{ permiso.permitido ? '✓' : '✕' }}</span>
          <span class="texto">{{ permiso.nombre }}</span>
        </div>
      </div>
    </div>

    <!-- Panel de administración (solo para admin) -->
    <div v-if="usuario.rol === 'admin'" class="admin-panel">
      <h4>Panel de Administración</h4>
      <div class="actividad-reciente">
        <h5>Actividad Reciente</h5>
        <div
          v-for="(actividad, index) in actividadReciente"
          :key="index"
          class="actividad-item"
        >
          <span class="tiempo">{{ actividad.tiempo }}</span>
          <span class="accion">{{ actividad.accion }}</span>
          <span class="usuario-accion">{{ actividad.usuario }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  usuario: {
    type: Object,
    required: true
  },
  actividadReciente: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['logout'])

// Definir permisos por rol
const permisosPorRol = {
  admin: {
    verInvitados: true,
    agregarInvitados: true,
    editarInvitados: true,
    eliminarInvitados: true,
    confirmarInvitados: true,
    exportarExcel: true,
    importarExcel: true,
    configurarSillas: true,
    verEstadisticas: true,
    gestionarUsuarios: true
  },
  organizador: {
    verInvitados: true,
    agregarInvitados: true,
    editarInvitados: true,
    eliminarInvitados: true,
    confirmarInvitados: true,
    exportarExcel: true,
    importarExcel: true,
    configurarSillas: true,
    verEstadisticas: true,
    gestionarUsuarios: false
  },
  asistente: {
    verInvitados: true,
    agregarInvitados: true,
    editarInvitados: true,
    eliminarInvitados: false,
    confirmarInvitados: true,
    exportarExcel: true,
    importarExcel: false,
    configurarSillas: false,
    verEstadisticas: true,
    gestionarUsuarios: false
  },
  visualizador: {
    verInvitados: true,
    agregarInvitados: false,
    editarInvitados: false,
    eliminarInvitados: false,
    confirmarInvitados: false,
    exportarExcel: true,
    importarExcel: false,
    configurarSillas: false,
    verEstadisticas: true,
    gestionarUsuarios: false
  },
  guardia: {
    verInvitados: true,
    agregarInvitados: false,
    editarInvitados: false,
    eliminarInvitados: false,
    confirmarInvitados: true,
    exportarExcel: false,
    importarExcel: false,
    configurarSillas: false,
    verEstadisticas: false,
    gestionarUsuarios: false
  }
}

const nombreRol = computed(() => {
  const roles = {
    admin: 'Administrador',
    organizador: 'Organizador',
    asistente: 'Asistente',
    visualizador: 'Solo Lectura',
    guardia: 'Guardia'
  }
  return roles[props.usuario.rol] || props.usuario.rol
})

const permisosUsuario = computed(() => {
  const permisos = permisosPorRol[props.usuario.rol] || {}

  return [
    { nombre: 'Ver invitados', permitido: permisos.verInvitados },
    { nombre: 'Agregar invitados', permitido: permisos.agregarInvitados },
    { nombre: 'Editar invitados', permitido: permisos.editarInvitados },
    { nombre: 'Eliminar invitados', permitido: permisos.eliminarInvitados },
    { nombre: 'Confirmar asistencia', permitido: permisos.confirmarInvitados },
    { nombre: 'Exportar Excel', permitido: permisos.exportarExcel },
    { nombre: 'Importar Excel', permitido: permisos.importarExcel },
    { nombre: 'Configurar sillas', permitido: permisos.configurarSillas },
    { nombre: 'Ver estadísticas', permitido: permisos.verEstadisticas },
    { nombre: 'Gestionar usuarios', permitido: permisos.gestionarUsuarios }
  ]
})

function cerrarSesion() {
  emit('logout')
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   PANEL CONTAINER
═══════════════════════════════════════════════ */
.panel-usuarios {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ═══════════════════════════════════════════════
   PROFILE CARD
═══════════════════════════════════════════════ */
.usuario-info {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: var(--color-dark);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.avatar {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700 0%, #F59E0B 100%);
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 800;
  box-shadow: 0 0 0 4px rgba(255, 215, 0, 0.2), 0 6px 18px rgba(255, 215, 0, 0.3);
  flex-shrink: 0;
  transition: transform 0.25s;
}

.avatar:hover {
  transform: scale(1.06) rotate(4deg);
}

.info-texto {
  flex: 1;
  min-width: 0;
}

.info-texto h3 {
  margin: 0 0 0.2rem;
  color: var(--color-text);
  font-size: 1.35rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email {
  margin: 0 0 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.badge-rol {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.badge-rol.admin {
  background: #FFD700;
  color: #111;
}

.badge-rol.organizador {
  background: rgba(255, 215, 0, 0.12);
  color: #FFD700;
  border: 1.5px solid rgba(255, 215, 0, 0.4);
}

.badge-rol.asistente {
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
  border: 1.5px solid rgba(99, 102, 241, 0.3);
}

.badge-rol.visualizador {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
  border: 1.5px solid rgba(107, 114, 128, 0.3);
}

.badge-rol.guardia {
  background: rgba(14, 165, 233, 0.15);
  color: #7dd3fc;
  border: 1.5px solid rgba(14, 165, 233, 0.3);
}

.btn-logout {
  padding: 0.6rem 1.25rem;
  background: transparent;
  color: #FFD700;
  border: 1.5px solid rgba(255, 215, 0, 0.5);
  border-radius: 0.6rem;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.875rem;
  font-family: inherit;
  letter-spacing: 0.02em;
  transition: all 0.25s;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-logout:hover {
  background: #FFD700;
  color: #111;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(255, 215, 0, 0.35);
}

/* ═══════════════════════════════════════════════
   PERMISOS CARD
═══════════════════════════════════════════════ */
.permisos-card {
  padding: 1.5rem;
  background: var(--color-dark);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.permisos-card h4 {
  margin: 0 0 1rem;
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.permisos-card h4::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 1rem;
  background: #FFD700;
  border-radius: 2px;
}

.permisos-lista {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.5rem;
}

.permiso-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.85rem;
  border-radius: 0.5rem;
  transition: background 0.2s;
}

.permiso-item.activo {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.permiso-item:not(.activo) {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.12);
  opacity: 0.65;
}

.permiso-item .icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 900;
  flex-shrink: 0;
}

.permiso-item.activo .icono {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.permiso-item:not(.activo) .icono {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.permiso-item .texto {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.permiso-item.activo .texto {
  color: var(--color-text);
}

/* ═══════════════════════════════════════════════
   PANEL ACTIVIDAD
═══════════════════════════════════════════════ */
.admin-panel {
  padding: 1.5rem;
  background: var(--color-dark);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.admin-panel h4 {
  margin: 0 0 1rem;
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-panel h4::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 1rem;
  background: #FFD700;
  border-radius: 2px;
}

.actividad-reciente h5 {
  color: var(--color-text-muted);
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.actividad-item {
  display: grid;
  grid-template-columns: 52px 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.65rem 0.85rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
  margin-bottom: 0.4rem;
  border-left: 2px solid rgba(255, 215, 0, 0.4);
  transition: background 0.2s;
}

.actividad-item:hover {
  background: rgba(255, 215, 0, 0.04);
}

.actividad-item .tiempo {
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.actividad-item .accion {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actividad-item .usuario-accion {
  color: #FFD700;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}

/* ═══════════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════════ */
@media (max-width: 768px) {
  .usuario-info {
    flex-wrap: wrap;
  }

  .btn-logout {
    width: 100%;
  }

  .permisos-lista {
    grid-template-columns: 1fr 1fr;
  }

  .actividad-item {
    grid-template-columns: 44px 1fr;
  }

  .actividad-item .usuario-accion {
    display: none;
  }
}

@media (max-width: 480px) {
  .permisos-lista {
    grid-template-columns: 1fr;
  }
}
</style>
