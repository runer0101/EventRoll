<template>
  <div class="gestion-usuarios">
    <div class="header-section">
      <h2>Gestión de Usuarios</h2>
      <p class="subtitle">Crea credenciales para asistentes y guardias del evento</p>
    </div>

    <!-- Formulario para agregar usuario -->
    <div class="formulario-card">
      <h3>{{ modoEdicion ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h3>
      <form class="form-usuario" @submit.prevent="guardarUsuario">
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
              <option value="guardia">Guardia - Solo ver lista de invitados</option>
              <option value="asistente">Asistente - Ver y confirmar asistencias</option>
              <option value="organizador">Organizador - Control completo</option>
            </select>
          </div>
        </div>

        <!-- Permisos Granulares -->
        <div class="permisos-section">
          <h4>Permisos del Usuario</h4>
          <p class="permisos-hint">Personaliza exactamente qué puede hacer este usuario</p>

          <div class="permisos-grid">
            <!-- Gestión de Invitados -->
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

            <!-- Importar/Exportar -->
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

            <!-- Asistencias -->
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
          <button v-if="modoEdicion" type="button" class="btn-cancelar" @click="cancelarEdicion">
            Cancelar
          </button>
          <button type="submit" class="btn-guardar">
            {{ modoEdicion ? 'Actualizar Usuario' : 'Crear Usuario' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Lista de usuarios -->
    <div class="usuarios-lista">
      <h3>Usuarios Registrados ({{ usuarios.length }})</h3>

      <div v-if="usuarios.length === 0" class="empty-state">
        <p>No hay usuarios creados todavía.</p>
        <p>Usa el formulario de arriba para crear el primer usuario.</p>
      </div>

      <div v-else class="tabla-container">
        <table class="tabla-usuarios">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha Creación</th>
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
              <td class="fecha-cell">{{ formatearFecha(usuario.fechaCreacion) }}</td>
              <td class="acciones-cell">
                <button class="btn-editar" title="Editar usuario" @click="editarUsuario(usuario)">
                  Editar
                </button>
                <button class="btn-eliminar" title="Eliminar usuario" @click="eliminarUsuario(usuario)">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from '../composables/useToast'
import { useLoading } from '../composables/useLoading'
import { usuariosAPI } from '../services/api'

const emit = defineEmits(['registrar-actividad'])
const { success, error } = useToast()
const { show: showLoading, hide: hideLoading } = useLoading()

const usuarios = ref([])
const modoEdicion = ref(false)
const usuarioEditando = ref(null)
const modoBackend = ref(true) // true = backend, false = localStorage

const formulario = ref({
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
})

// Validación de email
const esEmailValido = computed(() => {
  if (formulario.value.email.length === 0) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(formulario.value.email)
})

onMounted(() => {
  cargarUsuarios()
})

// Aplica permisos por defecto según el rol seleccionado
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
  }
}

async function cargarUsuarios() {
  try {
    // Intentar cargar desde backend
    const response = await usuariosAPI.getAll()

    if (response.success && response.data) {
      usuarios.value = response.data.map(u => ({
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        rol: u.rol,
        fechaCreacion: u.created_at || new Date().toISOString(),
        creadoPor: 'admin'
      }))
      modoBackend.value = true
      console.warn('Usuarios cargados desde backend:', usuarios.value.length)
    }
  } catch (err) {
    console.error('Error al cargar desde backend, usando localStorage:', err)
    modoBackend.value = false
    cargarUsuariosLocalStorage()
  }
}

function cargarUsuariosLocalStorage() {
  try {
    const usuariosGuardados = localStorage.getItem('usuarios')
    if (usuariosGuardados) {
      usuarios.value = JSON.parse(usuariosGuardados)
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    error('Error al cargar la lista de usuarios', 'Error')
  }
}

function guardarUsuarios() {
  // Solo guardar en localStorage si estamos en modo localStorage
  if (!modoBackend.value) {
    try {
      localStorage.setItem('usuarios', JSON.stringify(usuarios.value))
    } catch (error) {
      console.error('Error al guardar usuarios:', error)
      error('Error al guardar los usuarios', 'Error')
    }
  }
}

async function guardarUsuario() {
  // Validar que el email no esté duplicado
  const emailExiste = usuarios.value.some(u =>
    u.email === formulario.value.email && u.id !== usuarioEditando.value?.id
  )

  if (emailExiste) {
    error('Este correo electrónico ya está registrado. Por favor usa otro.', 'Email Duplicado')
    return
  }

  try {
    showLoading({ message: modoEdicion.value ? 'Actualizando usuario...' : 'Creando usuario...' })

    if (modoBackend.value) {
      // Usar backend API
      if (modoEdicion.value) {
        // Actualizar usuario existente
        const datosActualizar = {
          nombre: formulario.value.nombre,
          email: formulario.value.email,
          rol: formulario.value.rol,
          permisos: formulario.value.permisos
        }

        // Solo incluir password si se ingresó una nueva
        if (formulario.value.password) {
          datosActualizar.password = formulario.value.password
        }

        const response = await usuariosAPI.update(usuarioEditando.value.id, datosActualizar)

        if (response.success) {
          // Actualizar en la lista local
          const index = usuarios.value.findIndex(u => u.id === usuarioEditando.value.id)
          if (index !== -1) {
            usuarios.value[index] = {
              ...usuarios.value[index],
              nombre: formulario.value.nombre,
              email: formulario.value.email,
              rol: formulario.value.rol
            }
          }

          emit('registrar-actividad', `Actualizó usuario: ${formulario.value.nombre}`)
          success(`Usuario "${formulario.value.nombre}" actualizado correctamente`, 'Usuario Actualizado')
          cancelarEdicion()
        }
      } else {
        // Crear nuevo usuario
        const response = await usuariosAPI.create({
          nombre: formulario.value.nombre,
          email: formulario.value.email,
          password: formulario.value.password,
          rol: formulario.value.rol,
          permisos: formulario.value.permisos
        })

        if (response.success && response.data) {
          // Agregar a la lista local
          usuarios.value.push({
            id: response.data.id,
            nombre: response.data.nombre,
            email: response.data.email,
            rol: response.data.rol,
            fechaCreacion: response.data.created_at || new Date().toISOString(),
            creadoPor: 'admin@prueba'
          })

          emit('registrar-actividad', `Creó nuevo usuario: ${response.data.nombre} (${response.data.rol})`)
          success(`Usuario "${response.data.nombre}" creado correctamente`, 'Usuario Creado', 4000)

          // Limpiar formulario
          formulario.value = {
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
      }
    } else {
      // Modo localStorage
      await new Promise(resolve => setTimeout(resolve, 500))

      if (modoEdicion.value) {
        // Actualizar usuario existente
        const index = usuarios.value.findIndex(u => u.id === usuarioEditando.value.id)
        if (index !== -1) {
          usuarios.value[index] = {
            ...usuarios.value[index],
            nombre: formulario.value.nombre,
            email: formulario.value.email,
            rol: formulario.value.rol,
            ...(formulario.value.password ? { password: formulario.value.password } : {})
          }

          guardarUsuarios()
          emit('registrar-actividad', `Actualizó usuario: ${formulario.value.nombre}`)
          success(`Usuario "${formulario.value.nombre}" actualizado correctamente`, 'Usuario Actualizado')
          cancelarEdicion()
        }
      } else {
        // Crear nuevo usuario
        const nuevoUsuario = {
          id: Date.now(),
          nombre: formulario.value.nombre,
          email: formulario.value.email,
          password: formulario.value.password,
          rol: formulario.value.rol,
          fechaCreacion: new Date().toISOString(),
          creadoPor: 'admin@prueba'
        }

        usuarios.value.push(nuevoUsuario)
        guardarUsuarios()

        emit('registrar-actividad', `Creó nuevo usuario: ${nuevoUsuario.nombre} (${nuevoUsuario.rol})`)
        success(`Usuario "${nuevoUsuario.nombre}" creado correctamente`, 'Usuario Creado', 4000)

        // Limpiar formulario
        formulario.value = {
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
    }
  } catch (err) {
    console.error('Error al guardar usuario:', err)
    error(err.message || 'Ocurrió un error al guardar el usuario', 'Error')
  } finally {
    hideLoading()
  }
}

function editarUsuario(usuario) {
  modoEdicion.value = true
  usuarioEditando.value = usuario
  formulario.value = {
    nombre: usuario.nombre,
    email: usuario.email,
    password: '', // No mostrar password actual
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

  // Scroll hacia arriba al formulario
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicion() {
  modoEdicion.value = false
  usuarioEditando.value = null
  formulario.value = {
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

async function eliminarUsuario(usuario) {
  const confirmar = confirm(
    `CONFIRMAR ELIMINACION\n\n` +
    `¿Estás seguro de eliminar este usuario?\n\n` +
    `Nombre: ${usuario.nombre}\n` +
    `Email: ${usuario.email}\n` +
    `Rol: ${nombreRol(usuario.rol)}\n\n` +
    `Esta accion NO se puede deshacer.\n` +
    `El usuario perderá acceso inmediatamente.`
  )

  if (confirmar) {
    try {
      showLoading({ message: 'Eliminando usuario...' })

      if (modoBackend.value) {
        // Eliminar desde backend
        const response = await usuariosAPI.delete(usuario.id)

        if (response.success) {
          usuarios.value = usuarios.value.filter(u => u.id !== usuario.id)
          emit('registrar-actividad', `Eliminó usuario: ${usuario.nombre} (${usuario.email})`)
          success(`Usuario "${usuario.nombre}" eliminado correctamente`, 'Usuario Eliminado')
        }
      } else {
        // Modo localStorage
        await new Promise(resolve => setTimeout(resolve, 500))
        usuarios.value = usuarios.value.filter(u => u.id !== usuario.id)
        guardarUsuarios()
        emit('registrar-actividad', `Eliminó usuario: ${usuario.nombre} (${usuario.email})`)
        success(`Usuario "${usuario.nombre}" eliminado correctamente`, 'Usuario Eliminado')
      }
    } catch (err) {
      console.error('Error al eliminar usuario:', err)
      error(err.message || 'Ocurrió un error al eliminar el usuario', 'Error')
    } finally {
      hideLoading()
    }
  }
}

function nombreRol(rol) {
  const roles = {
    guardia: 'Guardia',
    asistente: 'Asistente',
    organizador: 'Organizador',
    admin: 'Administrador'
  }
  return roles[rol] || rol
}

function formatearFecha(fecha) {
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.gestion-usuarios {
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 30px;
}

.header-section h2 {
  color: #1a1a1a;
  font-size: 2em;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.subtitle {
  color: #666;
  font-size: 1.1em;
  margin: 0;
}

/* Formulario */
.formulario-card {
  background: #ffffff;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 2px solid #FFD700;
}

.formulario-card h3 {
  color: #1a1a1a;
  margin: 0 0 25px 0;
  font-size: 1.4em;
}

.form-usuario {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #333;
  font-weight: 600;
  font-size: 0.95em;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
  background: #f9f9f9;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #FFD700;
  background: #ffffff;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

/* Validación visual */
.form-group input.input-valido {
  border-color: #4caf50;
  background: #f1f8f4;
}

.form-group input.input-invalido {
  border-color: #f44336;
  background: #fef5f5;
}

.mensaje-error {
  color: #f44336;
  font-size: 0.85em;
  font-weight: 600;
  margin-top: 4px;
  display: block;
  animation: shake 0.3s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.hint {
  color: #888;
  font-size: 0.85em;
  font-style: italic;
}

/* Sección de Permisos */
.permisos-section {
  margin-top: 25px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
  border: 2px dashed #ddd;
}

.permisos-section h4 {
  margin: 0 0 8px 0;
  color: #1a1a1a;
  font-size: 1.2em;
}

.permisos-hint {
  color: #666;
  font-size: 0.9em;
  margin: 0 0 20px 0;
}

.permisos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.permiso-categoria {
  background: #ffffff;
  padding: 18px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}

.permiso-categoria h5 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1em;
  padding-bottom: 10px;
  border-bottom: 2px solid #FFD700;
}

.permisos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.permiso-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  padding: 10px;
  border-radius: 6px;
  transition: background 0.2s;
}

.permiso-item:hover {
  background: #f5f5f5;
}

.permiso-item input[type="checkbox"] {
  margin-top: 3px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #FFD700;
}

.permiso-label {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.permiso-label strong {
  color: #333;
  font-size: 0.95em;
}

.permiso-label small {
  color: #888;
  font-size: 0.85em;
  line-height: 1.3;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-guardar {
  padding: 14px 28px;
  background: #FFD700;
  color: #1a1a1a;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.btn-guardar:hover {
  background: #FFA500;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.4);
}

.btn-cancelar {
  padding: 14px 28px;
  background: #6a6a6a;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancelar:hover {
  background: #8a8a8a;
  transform: translateY(-2px);
}

/* Lista de usuarios */
.usuarios-lista {
  background: #ffffff;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.usuarios-lista h3 {
  color: #1a1a1a;
  margin: 0 0 20px 0;
  font-size: 1.4em;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state p {
  margin: 10px 0;
  font-size: 1.1em;
}

.tabla-container {
  overflow-x: auto;
}

.tabla-usuarios {
  width: 100%;
  border-collapse: collapse;
}

.tabla-usuarios thead {
  background: #f5f5f5;
}

.tabla-usuarios th {
  padding: 15px;
  text-align: left;
  font-weight: 700;
  color: #333;
  border-bottom: 2px solid #FFD700;
}

.tabla-usuarios td {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.tabla-usuarios tbody tr:hover {
  background: #f9f9f9;
}

.nombre-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #333;
}

.avatar-small {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #FFD700;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.badge-rol {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.85em;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-rol.guardia {
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #1976d2;
}

.badge-rol.asistente {
  background: #f3e5f5;
  color: #7b1fa2;
  border: 1px solid #7b1fa2;
}

.badge-rol.organizador {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #e65100;
}

.fecha-cell {
  color: #666;
  font-size: 0.9em;
}

.acciones-cell {
  display: flex;
  gap: 10px;
}

.btn-editar,
.btn-eliminar {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-editar {
  background: #e3f2fd;
}

.btn-editar:hover {
  background: #bbdefb;
  transform: translateY(-2px);
}

.btn-eliminar {
  background: #ffebee;
}

.btn-eliminar:hover {
  background: #ffcdd2;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-guardar,
  .btn-cancelar {
    width: 100%;
  }

  .tabla-usuarios {
    font-size: 0.9em;
  }

  .tabla-usuarios th,
  .tabla-usuarios td {
    padding: 10px 8px;
  }
}
</style>
