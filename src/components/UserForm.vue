<template>
  <div :class="['formulario-card', { 'formulario-card--editing': modoEdicion }]">
    <h3>{{ modoEdicion ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h3>
    <form class="form-usuario" @submit.prevent="onSubmit">
      <div class="form-row">
        <div class="form-group">
          <label for="nombre">Nombre Completo *</label>
          <input
            id="nombre"
            v-model="formulario.nombre"
            type="text"
            placeholder="Ej: Juan Pérez"
            required
            minlength="3"
            title="Ingresa el nombre completo del usuario (mínimo 3 caracteres)"
            :class="{ 'input-valido': formulario.nombre.length >= 3, 'input-invalido': formulario.nombre.length > 0 && formulario.nombre.length < 3 }"
          />
          <span v-if="formulario.nombre.length > 0 && formulario.nombre.length < 3" class="mensaje-error">
            Mínimo 3 caracteres
          </span>
        </div>

        <div class="form-group">
          <label for="email">Correo Electrónico *</label>
          <input
            id="email"
            v-model="formulario.email"
            type="email"
            placeholder="usuario@ejemplo.com"
            required
            title="Ingresa un correo válido para el login"
            :class="{ 'input-valido': esEmailValido, 'input-invalido': formulario.email.length > 0 && !esEmailValido }"
          />
          <span v-if="formulario.email.length > 0 && !esEmailValido" class="mensaje-error">
            Correo electrónico inválido
          </span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="password">Contraseña{{ !modoEdicion ? ' *' : '' }}</label>
          <input
            id="password"
            v-model="formulario.password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            :required="!modoEdicion"
            minlength="8"
            title="Contraseña segura (mínimo 8 caracteres)"
            :class="{ 'input-valido': formulario.password.length >= 8, 'input-invalido': formulario.password.length > 0 && formulario.password.length < 8 }"
          />
          <small v-if="modoEdicion" class="hint">Déjala vacía para mantener la actual</small>
          <span v-if="!modoEdicion && formulario.password.length > 0 && formulario.password.length < 8" class="mensaje-error">
            Mínimo 8 caracteres
          </span>
        </div>

        <div class="form-group">
          <label for="rol">Rol del Usuario</label>
          <select
            id="rol"
            v-model="formulario.rol"
            required
            title="Selecciona el nivel de acceso"
            @change="aplicarPermisosDefault"
          >
            <option value="visualizador">Visualizador - Solo lectura</option>
            <option value="guardia">Guardia - Solo ver lista y confirmar</option>
            <option value="asistente">Asistente - Ver y confirmar asistencias</option>
            <option value="organizador">Organizador - Control completo</option>
            <option value="admin">Administrador - Acceso total</option>
          </select>
        </div>
      </div>

      <div class="permisos-section">
        <h4>Permisos del Usuario</h4>
        <p class="permisos-hint">Personaliza exactamente qué puede hacer este usuario</p>

        <div class="permisos-grid">
          <div class="permiso-categoria">
            <h5>Gestion de Invitados</h5>
            <div class="permisos-list">
              <label class="permiso-item">
                <input
                  v-model="formulario.permisos.ver_invitados"
                  type="checkbox"
                />
                <span class="permiso-label">
                  <strong>Ver invitados</strong>
                  <small>Acceder a la lista de invitados</small>
                </span>
              </label>

              <label class="permiso-item">
                <input
                  v-model="formulario.permisos.crear_invitados"
                  type="checkbox"
                />
                <span class="permiso-label">
                  <strong>Crear invitados</strong>
                  <small>Agregar nuevos invitados</small>
                </span>
              </label>

              <label class="permiso-item">
                <input
                  v-model="formulario.permisos.editar_invitados"
                  type="checkbox"
                />
                <span class="permiso-label">
                  <strong>Editar invitados</strong>
                  <small>Modificar información de invitados</small>
                </span>
              </label>

              <label class="permiso-item">
                <input
                  v-model="formulario.permisos.eliminar_invitados"
                  type="checkbox"
                />
                <span class="permiso-label">
                  <strong>Eliminar invitados</strong>
                  <small>Borrar invitados permanentemente</small>
                </span>
              </label>
            </div>
          </div>

          <div class="permiso-categoria">
            <h5>Importar/Exportar</h5>
            <div class="permisos-list">
              <label class="permiso-item">
                <input
                  v-model="formulario.permisos.importar_excel"
                  type="checkbox"
                />
                <span class="permiso-label">
                  <strong>Importar Excel</strong>
                  <small>Cargar invitados desde archivo .xlsx</small>
                </span>
              </label>

              <label class="permiso-item">
                <input
                  v-model="formulario.permisos.exportar_excel"
                  type="checkbox"
                />
                <span class="permiso-label">
                  <strong>Exportar Excel</strong>
                  <small>Descargar lista en formato .xlsx</small>
                </span>
              </label>
            </div>
          </div>

          <div class="permiso-categoria">
            <h5>Control de Asistencias</h5>
            <div class="permisos-list">
              <label class="permiso-item">
                <input
                  v-model="formulario.permisos.confirmar_asistencia"
                  type="checkbox"
                />
                <span class="permiso-label">
                  <strong>Confirmar asistencia</strong>
                  <small>Marcar invitados como confirmados</small>
                </span>
              </label>

              <label class="permiso-item">
                <input
                  v-model="formulario.permisos.marcar_asistencia"
                  type="checkbox"
                />
                <span class="permiso-label">
                  <strong>Marcar asistencia</strong>
                  <small>Registrar llegada al evento</small>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button v-if="modoEdicion" type="button" class="btn-cancelar" @click="onCancel">
          Cancelar
        </button>
        <button type="submit" class="btn-guardar">
          {{ modoEdicion ? 'Actualizar Usuario' : 'Crear Usuario' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modoEdicion: { type: Boolean, default: false },
  usuarioEditando: { type: Object, default: null }
})

const emit = defineEmits(['save', 'cancel'])

function getDefaultFormulario() {
  return {
    nombre: '',
    email: '',
    password: '',
    rol: 'guardia',
    permisos: {
      ver_invitados: true,
      crear_invitados: false,
      editar_invitados: false,
      eliminar_invitados: false,
      importar_excel: false,
      exportar_excel: false,
      confirmar_asistencia: true,
      marcar_asistencia: true
    }
  }
}

const formulario = ref(getDefaultFormulario())

const esEmailValido = computed(() => {
  if (formulario.value.email.length === 0) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(formulario.value.email)
})

function aplicarPermisosDefault() {
  const rol = formulario.value.rol

  switch (rol) {
    case 'admin':
      formulario.value.permisos = {
        ver_invitados: true,
        crear_invitados: true,
        editar_invitados: true,
        eliminar_invitados: true,
        importar_excel: true,
        exportar_excel: true,
        confirmar_asistencia: true,
        marcar_asistencia: true
      }
      break
    case 'organizador':
      formulario.value.permisos = {
        ver_invitados: true,
        crear_invitados: true,
        editar_invitados: true,
        eliminar_invitados: false,
        importar_excel: true,
        exportar_excel: true,
        confirmar_asistencia: true,
        marcar_asistencia: true
      }
      break
    case 'asistente':
      formulario.value.permisos = {
        ver_invitados: true,
        crear_invitados: false,
        editar_invitados: true,
        eliminar_invitados: false,
        importar_excel: false,
        exportar_excel: true,
        confirmar_asistencia: true,
        marcar_asistencia: true
      }
      break
    case 'guardia':
      formulario.value.permisos = {
        ver_invitados: true,
        crear_invitados: false,
        editar_invitados: false,
        eliminar_invitados: false,
        importar_excel: false,
        exportar_excel: false,
        confirmar_asistencia: true,
        marcar_asistencia: true
      }
      break
    case 'visualizador':
      formulario.value.permisos = {
        ver_invitados: true,
        crear_invitados: false,
        editar_invitados: false,
        eliminar_invitados: false,
        importar_excel: false,
        exportar_excel: false,
        confirmar_asistencia: false,
        marcar_asistencia: false
      }
      break
  }
}

watch(() => props.usuarioEditando, (usuario) => {
  if (usuario) {
    formulario.value = {
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      permisos: usuario.permisos || {
        ver_invitados: true,
        crear_invitados: usuario.rol !== 'guardia',
        editar_invitados: usuario.rol !== 'guardia',
        eliminar_invitados: usuario.rol === 'admin',
        importar_excel: usuario.rol === 'admin' || usuario.rol === 'organizador',
        exportar_excel: true,
        confirmar_asistencia: true,
        marcar_asistencia: true
      }
    }
  }
})

watch(() => props.modoEdicion, (editing) => {
  if (!editing) {
    formulario.value = getDefaultFormulario()
  }
})

function onSubmit() {
  emit('save', { ...formulario.value })
}

function onCancel() {
  emit('cancel')
}
</script>

<style scoped>
.formulario-card {
  background: #141414;
  border-radius: 10px;
  padding: 22px 24px;
  margin-bottom: 20px;
  border: 1px solid rgba(255,215,0,0.15);
}

.formulario-card h3 {
  color: #fff;
  margin: 0 0 18px 0;
  font-size: 1rem;
  font-weight: 700;
}

.form-usuario {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: rgba(255,255,255,0.55);
  font-weight: 600;
  font-size: 0.82rem;
}

.form-group input,
.form-group select {
  padding: 9px 12px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 7px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.15s;
  background: #0f0f0f;
  color: #fff;
}

.form-group input::placeholder { color: rgba(255,255,255,0.25); }

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: rgba(255,215,0,0.5);
}

.form-group input.input-valido {
  border-color: rgba(52,211,153,0.5);
}

.form-group input.input-invalido {
  border-color: rgba(239,68,68,0.5);
}

.mensaje-error {
  color: #f87171;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 2px;
  display: block;
  animation: shake 0.3s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.hint {
  color: rgba(255,255,255,0.3);
  font-size: 0.8rem;
  font-style: italic;
}

.permisos-section {
  margin-top: 18px;
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  border: 1px dashed rgba(255,255,255,0.1);
}

.permisos-section h4 {
  margin: 0 0 6px 0;
  color: rgba(255,255,255,0.75);
  font-size: 0.9rem;
  font-weight: 700;
}

.permisos-hint {
  color: rgba(255,255,255,0.35);
  font-size: 0.82rem;
  margin: 0 0 16px 0;
}

.permisos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}

.permiso-categoria {
  background: #0f0f0f;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.07);
}

.permiso-categoria h5 {
  margin: 0 0 10px 0;
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  font-weight: 700;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255,215,0,0.25);
}

.permisos-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.permiso-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  padding: 7px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}

.permiso-item:hover {
  background: rgba(255,255,255,0.04);
}

.permiso-item input[type="checkbox"] {
  margin-top: 2px;
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #FFD700;
  flex-shrink: 0;
}

.permiso-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.permiso-label strong {
  color: rgba(255,255,255,0.8);
  font-size: 0.875rem;
}

.permiso-label small {
  color: rgba(255,255,255,0.35);
  font-size: 0.78rem;
  line-height: 1.3;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-guardar {
  padding: 10px 22px;
  background: #FFD700;
  color: #111;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-guardar:hover { background: #f0c800; }

.btn-cancelar {
  padding: 10px 22px;
  background: transparent;
  color: rgba(255,255,255,0.45);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancelar:hover {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.8);
}

.formulario-card--editing {
  border-color: rgba(99,179,237,0.35);
  box-shadow: 0 0 0 1px rgba(99,179,237,0.15);
}

@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column; }
  .btn-guardar, .btn-cancelar { width: 100%; }
}
</style>
