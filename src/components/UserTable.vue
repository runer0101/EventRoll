<template>
  <div class="usuarios-lista">
    <div class="lista-header">
      <h3>Usuarios Registrados <span class="count-badge">{{ usuarios.length }}</span></h3>
      <div v-if="usuarios.length > 0" class="role-pills">
        <span v-if="contarRol('organizador')" class="role-pill organizador">{{ contarRol('organizador') }} Org.</span>
        <span v-if="contarRol('asistente')" class="role-pill asistente">{{ contarRol('asistente') }} Asist.</span>
        <span v-if="contarRol('guardia')" class="role-pill guardia">{{ contarRol('guardia') }} Guard.</span>
        <span v-if="contarRol('visualizador')" class="role-pill visualizador">{{ contarRol('visualizador') }} Vis.</span>
      </div>
    </div>

    <EmptyState
      v-if="usuarios.length === 0"
      icon="User"
      titulo="Sin usuarios creados"
      descripcion="Usa el formulario de arriba para crear el primer usuario."
    />

    <div v-else class="tabla-container">
      <table class="tabla-usuarios">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>ID de acceso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario.id">
            <td class="nombre-cell">
              <div class="avatar-small">{{ usuario.nombre.charAt(0).toUpperCase() }}</div>
              {{ usuario.nombre }}
            </td>
            <td>{{ usuario.email }}</td>
            <td>
              <span :class="['badge-rol', usuario.rol]">
                {{ nombreRol(usuario.rol) }}
              </span>
            </td>
            <td class="codigo-cell">
              <div v-if="usuario.access_code" class="codigo-badge">
                <span class="codigo-texto">{{ usuario.access_code }}</span>
                <button class="btn-copiar" title="Copiar código" @click="emit('copy-code', usuario.access_code)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
                <button class="btn-revocar" title="Revocar código" @click="emit('revoke-code', usuario.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <button v-else class="btn-generar-codigo" @click="emit('generate-code', usuario.id)">
                + Generar ID
              </button>
            </td>
            <td class="acciones-cell">
              <button class="btn-editar" title="Editar usuario" @click="emit('edit', usuario)">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar
              </button>
              <button class="btn-eliminar" title="Eliminar usuario" @click="emit('delete', usuario)">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import EmptyState from './EmptyState.vue'

const props = defineProps({
  usuarios: { type: Array, required: true }
})

const emit = defineEmits(['edit', 'delete', 'generate-code', 'revoke-code', 'copy-code'])

function contarRol(rol) {
  return props.usuarios.filter(u => u.rol === rol).length
}

function nombreRol(rol) {
  const roles = {
    visualizador: 'Visualizador',
    guardia: 'Guardia',
    asistente: 'Asistente',
    organizador: 'Organizador',
    admin: 'Administrador'
  }
  return roles[rol] || rol
}
</script>

<style scoped>
.usuarios-lista {
  background: #141414;
  border-radius: 10px;
  padding: 20px 24px;
  border: 1px solid rgba(255,255,255,0.07);
}

.tabla-container {
  overflow-x: auto;
}

.tabla-usuarios {
  width: 100%;
  border-collapse: collapse;
}

.tabla-usuarios thead {
  background: rgba(255,255,255,0.03);
}

.tabla-usuarios th {
  padding: 11px 14px;
  text-align: left;
  font-weight: 700;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.4);
  border-bottom: 1px solid rgba(255,215,0,0.2);
}

.tabla-usuarios td {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.75);
  font-size: 0.875rem;
}

.tabla-usuarios tbody tr:hover td {
  background: rgba(255,255,255,0.03);
}

.nombre-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
}

.avatar-small {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #FFD700;
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

.badge-rol {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge-rol.guardia {
  background: rgba(59,130,246,0.15);
  color: #60a5fa;
  border: 1px solid rgba(59,130,246,0.25);
}

.badge-rol.asistente {
  background: rgba(168,85,247,0.15);
  color: #c084fc;
  border: 1px solid rgba(168,85,247,0.25);
}

.badge-rol.organizador {
  background: rgba(249,115,22,0.15);
  color: #fb923c;
  border: 1px solid rgba(249,115,22,0.25);
}

.acciones-cell {
  display: flex;
  gap: 8px;
}

.codigo-cell { min-width: 120px; }

.codigo-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,215,0,0.07);
  border: 1px solid rgba(255,215,0,0.2);
  border-radius: 6px;
  padding: 4px 8px;
}

.codigo-texto {
  font-family: 'Courier New', monospace;
  font-size: 0.82rem;
  font-weight: 700;
  color: #FFD700;
  letter-spacing: 0.1em;
}

.btn-copiar, .btn-revocar {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.btn-copiar { color: rgba(255,255,255,0.35); }
.btn-copiar:hover { color: #FFD700; }

.btn-revocar { color: rgba(255,255,255,0.25); }
.btn-revocar:hover { color: #f87171; }

.btn-generar-codigo {
  background: transparent;
  border: 1px dashed rgba(255,255,255,0.15);
  border-radius: 6px;
  color: rgba(255,255,255,0.35);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-generar-codigo:hover {
  border-color: rgba(255,215,0,0.35);
  color: rgba(255,215,0,0.8);
  background: rgba(255,215,0,0.04);
}

.btn-editar,
.btn-eliminar {
  padding: 5px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s;
}

.btn-editar {
  background: rgba(59,130,246,0.12);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #60a5fa;
  font-weight: 600;
  font-family: inherit;
}

.btn-editar:hover { background: rgba(59,130,246,0.22); }

.btn-eliminar {
  background: rgba(239,68,68,0.1);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #f87171;
  font-weight: 600;
  font-family: inherit;
}

.btn-eliminar:hover { background: rgba(239,68,68,0.2); }

.lista-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.lista-header h3 {
  color: #fff;
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  background: rgba(255,215,0,0.12);
  border: 1px solid rgba(255,215,0,0.25);
  border-radius: 20px;
  color: #FFD700;
  font-size: 0.75rem;
  font-weight: 700;
}

.role-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.role-pill {
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.role-pill.organizador {
  background: rgba(249,115,22,0.12);
  color: #fb923c;
  border: 1px solid rgba(249,115,22,0.2);
}

.role-pill.asistente {
  background: rgba(168,85,247,0.12);
  color: #c084fc;
  border: 1px solid rgba(168,85,247,0.2);
}

.role-pill.guardia {
  background: rgba(59,130,246,0.12);
  color: #60a5fa;
  border: 1px solid rgba(59,130,246,0.2);
}

.role-pill.visualizador {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.45);
  border: 1px solid rgba(255,255,255,0.1);
}

@media (max-width: 768px) {
  .tabla-usuarios { font-size: 0.85rem; }
  .tabla-usuarios th, .tabla-usuarios td { padding: 9px 8px; }
}

@media (max-width: 480px) {
  .tabla-usuarios { font-size: 0.78rem; }
  .tabla-usuarios th, .tabla-usuarios td { padding: 7px 6px; }
  .acciones-cell { flex-direction: column; gap: 4px; }
  .btn-editar, .btn-eliminar { padding: 4px 8px; }
  .codigo-badge { flex-wrap: wrap; gap: 2px; }
  .nombre-cell { gap: 6px; }
  .avatar-small { width: 24px; height: 24px; font-size: 10px; }
  .badge-rol { font-size: 0.65rem; padding: 2px 6px; }
}
</style>
