<template>
  <div class="gestion-usuarios">
    <div class="header-section">
      <h2>Gestión de Usuarios</h2>
      <p class="subtitle">Crea credenciales para asistentes y guardias del evento</p>
    </div>

    <!-- Formulario para agregar usuario -->
    <div :class="['formulario-card', { 'formulario-card--editing': modoEdicion }]">
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
      <div class="lista-header">
        <h3>Usuarios Registrados <span class="count-badge">{{ usuarios.length }}</span></h3>
        <div v-if="usuarios.length > 0" class="role-pills">
          <span v-if="contarRol('organizador')" class="role-pill organizador">{{ contarRol('organizador') }} Org.</span>
          <span v-if="contarRol('asistente')" class="role-pill asistente">{{ contarRol('asistente') }} Asist.</span>
          <span v-if="contarRol('guardia')" class="role-pill guardia">{{ contarRol('guardia') }} Guard.</span>
        </div>
      </div>

      <div v-if="usuarios.length === 0" class="empty-state">
        <div class="vacio-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>
        <p class="vacio-title">Sin usuarios creados</p>
        <p class="vacio-hint">Usa el formulario de arriba para crear el primer usuario.</p>
      </div>

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
                  <button class="btn-copiar" title="Copiar código" @click="copiarCodigo(usuario.access_code)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                  <button class="btn-revocar" title="Revocar código" @click="revocarCodigo(usuario)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <button v-else class="btn-generar-codigo" @click="generarCodigo(usuario)">
                  + Generar ID
                </button>
              </td>
              <td class="acciones-cell">
                <button class="btn-editar" title="Editar usuario" @click="editarUsuario(usuario)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar
                </button>
                <button class="btn-eliminar" title="Eliminar usuario" @click="eliminarUsuario(usuario)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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

// Contador por rol
function contarRol(rol) {
  return usuarios.value.filter(u => u.rol === rol).length
}

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
    }
  } catch {
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
  } catch {
    error('Error al cargar la lista de usuarios', 'Error')
  }
}

function guardarUsuarios() {
  // Solo guardar en localStorage si estamos en modo localStorage
  if (!modoBackend.value) {
    try {
      localStorage.setItem('usuarios', JSON.stringify(usuarios.value))
    } catch {
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

async function generarCodigo(usuario) {
  try {
    const res = await usuariosAPI.generarCodigo(usuario.id)
    usuario.access_code = res.data.access_code
    success(`Código generado: ${res.data.access_code}`, 'Listo')
  } catch (err) {
    error(err.message || 'Error al generar código', 'Error')
  }
}

async function revocarCodigo(usuario) {
  try {
    await usuariosAPI.revocarCodigo(usuario.id)
    usuario.access_code = null
    success('Código revocado', 'Listo')
  } catch (err) {
    error(err.message || 'Error al revocar código', 'Error')
  }
}

function copiarCodigo(codigo) {
  navigator.clipboard.writeText(codigo)
    .then(() => success(`Código ${codigo} copiado`, 'Copiado'))
    .catch(() => error('No se pudo copiar', 'Error'))
}
</script>

<style scoped>
.gestion-usuarios {
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 24px;
}

.header-section h2 {
  color: #fff;
  font-size: 1.6rem;
  margin: 0 0 6px 0;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.subtitle {
  color: rgba(255,255,255,0.4);
  font-size: 0.9rem;
  margin: 0;
}

/* Formulario */
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

/* Validación visual */
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

/* Sección de Permisos */
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

/* Lista de usuarios */
.usuarios-lista {
  background: #141414;
  border-radius: 10px;
  padding: 20px 24px;
  border: 1px solid rgba(255,255,255,0.07);
}

/* .usuarios-lista h3 moved to .lista-header h3 */

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255,255,255,0.3);
}

.empty-state p {
  margin: 8px 0;
  font-size: 0.95rem;
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

.fecha-cell {
  color: rgba(255,255,255,0.35);
  font-size: 0.82rem;
}

.acciones-cell {
  display: flex;
  gap: 8px;
}

/* Columna código de acceso */
.codigo-cell { min-width: 160px; }

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
}

.btn-editar:hover { background: rgba(59,130,246,0.22); }

.btn-eliminar {
  background: rgba(239,68,68,0.1);
}

.btn-eliminar:hover { background: rgba(239,68,68,0.2); }

/* Responsive */
@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column; }
  .btn-guardar, .btn-cancelar { width: 100%; }
  .tabla-usuarios { font-size: 0.85rem; }
  .tabla-usuarios th, .tabla-usuarios td { padding: 9px 8px; }
}

/* Edit mode form highlight */
.formulario-card--editing {
  border-color: rgba(99,179,237,0.35);
  box-shadow: 0 0 0 1px rgba(99,179,237,0.15);
}

/* Lista header */
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

/* Empty state */
.vacio-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.2);
}

.vacio-title {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255,255,255,0.55);
  margin: 0 0 6px 0;
}

.vacio-hint {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.28);
  margin: 0;
}

/* Action button improvements */
.btn-editar {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #60a5fa;
  font-weight: 600;
  font-family: inherit;
}

.btn-eliminar {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #f87171;
  font-weight: 600;
  font-family: inherit;
}
</style>
