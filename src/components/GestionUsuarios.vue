<template>
  <div class="gestion-usuarios">
    <div class="header-section">
      <h2>Gestión de Usuarios</h2>
      <p class="subtitle">Crea credenciales para asistentes y guardias del evento</p>
    </div>

    <UserForm
      :modo-edicion="modoEdicion"
      :usuario-editando="usuarioEditando"
      @save="guardarUsuario"
      @cancel="cancelarEdicion"
    />

    <UserTable
      :usuarios="usuarios"
      @edit="editarUsuario"
      @delete="eliminarUsuario"
      @generate-code="generarCodigo"
      @revoke-code="revocarCodigo"
      @copy-code="copiarCodigo"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UserForm from './UserForm.vue'
import UserTable from './UserTable.vue'
import { useToast } from '../composables/useToast'
import { useLoading } from '../composables/useLoading'
import { usuariosAPI } from '../services/api'

const emit = defineEmits(['registrar-actividad'])
const { success, error } = useToast()
const { show: showLoading, hide: hideLoading } = useLoading()

const usuarios = ref([])
const modoEdicion = ref(false)
const usuarioEditando = ref(null)
const modoBackend = ref(true)

onMounted(() => {
  cargarUsuarios()
})

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

async function cargarUsuarios() {
  try {
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
  if (!modoBackend.value) {
    try {
      localStorage.setItem('usuarios', JSON.stringify(usuarios.value))
    } catch {
      error('Error al guardar los usuarios', 'Error')
    }
  }
}

async function guardarUsuario(formData) {
  const emailExiste = usuarios.value.some(u =>
    u.email === formData.email && u.id !== usuarioEditando.value?.id
  )

  if (emailExiste) {
    error('Este correo electrónico ya está registrado. Por favor usa otro.', 'Email Duplicado')
    return
  }

  try {
    showLoading({ message: modoEdicion.value ? 'Actualizando usuario...' : 'Creando usuario...' })

    if (modoBackend.value) {
      if (modoEdicion.value) {
        const datosActualizar = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          permisos: formData.permisos
        }

        if (formData.password) {
          datosActualizar.password = formData.password
        }

        const response = await usuariosAPI.update(usuarioEditando.value.id, datosActualizar)

        if (response.success) {
          const index = usuarios.value.findIndex(u => u.id === usuarioEditando.value.id)
          if (index !== -1) {
            usuarios.value[index] = {
              ...usuarios.value[index],
              nombre: formData.nombre,
              email: formData.email,
              rol: formData.rol
            }
          }

          emit('registrar-actividad', `Actualizó usuario: ${formData.nombre}`)
          success(`Usuario "${formData.nombre}" actualizado correctamente`, 'Usuario Actualizado')
          cancelarEdicion()
        }
      } else {
        const response = await usuariosAPI.create({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          rol: formData.rol,
          permisos: formData.permisos
        })

        if (response.success && response.data) {
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
        }
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 500))

      if (modoEdicion.value) {
        const index = usuarios.value.findIndex(u => u.id === usuarioEditando.value.id)
        if (index !== -1) {
          usuarios.value[index] = {
            ...usuarios.value[index],
            nombre: formData.nombre,
            email: formData.email,
            rol: formData.rol,
            ...(formData.password ? { password: formData.password } : {})
          }

          guardarUsuarios()
          emit('registrar-actividad', `Actualizó usuario: ${formData.nombre}`)
          success(`Usuario "${formData.nombre}" actualizado correctamente`, 'Usuario Actualizado')
          cancelarEdicion()
        }
      } else {
        const nuevoUsuario = {
          id: Date.now(),
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          rol: formData.rol,
          fechaCreacion: new Date().toISOString(),
          creadoPor: 'admin@prueba'
        }

        usuarios.value.push(nuevoUsuario)
        guardarUsuarios()

        emit('registrar-actividad', `Creó nuevo usuario: ${nuevoUsuario.nombre} (${nuevoUsuario.rol})`)
        success(`Usuario "${nuevoUsuario.nombre}" creado correctamente`, 'Usuario Creado', 4000)
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
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicion() {
  modoEdicion.value = false
  usuarioEditando.value = null
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
        const response = await usuariosAPI.delete(usuario.id)

        if (response.success) {
          usuarios.value = usuarios.value.filter(u => u.id !== usuario.id)
          emit('registrar-actividad', `Eliminó usuario: ${usuario.nombre} (${usuario.email})`)
          success(`Usuario "${usuario.nombre}" eliminado correctamente`, 'Usuario Eliminado')
        }
      } else {
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

async function generarCodigo(usuarioId) {
  const usuario = usuarios.value.find(u => u.id === usuarioId)
  if (!usuario) return
  try {
    const res = await usuariosAPI.generarCodigo(usuario.id)
    usuario.access_code = res.data.access_code
    success(`Código generado: ${res.data.access_code}`, 'Listo')
  } catch (err) {
    error(err.message || 'Error al generar código', 'Error')
  }
}

async function revocarCodigo(usuarioId) {
  const usuario = usuarios.value.find(u => u.id === usuarioId)
  if (!usuario) return
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
</style>
