<template>
  <div class="public-page">
    <header class="public-header">
      <div class="brand">Organizacion de Eventos</div>
      <nav class="main-nav">
        <a href="#inicio">Inicio</a>
        <a href="#funciones">Funciones</a>
        <a href="#login-card">Acceso</a>
      </nav>
      <a class="btn-header" href="#login-card">Ingresar</a>
    </header>

    <main id="inicio" class="public-main">
      <section id="funciones" class="hero-panel">
        <p class="hero-kicker">Plataforma web para organizar invitados y asistencia</p>
        <h1>Planifica tus eventos desde un solo lugar</h1>
        <p class="hero-description">
          Administra invitados, usuarios y seguimiento de asistencia con una interfaz clara para equipos de organizacion.
        </p>

        <div class="hero-organizador">
          <h2>Eres organizador?</h2>
          <p>
            Inicia sesion en el panel para gestionar listas, importar archivos y coordinar la operacion del evento.
          </p>
        </div>

        <ul class="hero-list">
          <li>Control de invitados en tiempo real</li>
          <li>Panel de usuarios con roles</li>
          <li>Importacion y exportacion en Excel</li>
        </ul>

        <figure class="hero-media">
          <img
            src="https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Equipo organizando un evento"
            loading="lazy"
          />
          <figcaption>Imagen de referencia gratuita: Pexels</figcaption>
        </figure>
      </section>

      <section id="login-card" class="login-panel">
        <div class="login-card">
          <div class="login-header">
            <h2>Acceso al Panel</h2>
            <p>Organizacion de Eventos</p>
          </div>

          <form class="login-form" @submit.prevent="iniciarSesion">
            <div class="form-group">
              <label for="email">Correo Electronico</label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
                autocomplete="email"
                :disabled="cargando"
              />
            </div>

            <div class="form-group">
              <label for="password">Contrasena</label>
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                required
                autocomplete="current-password"
                :disabled="cargando"
              />
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <button type="submit" class="btn-login" :disabled="cargando">
              <span v-if="!cargando">Iniciar Sesion</span>
              <span v-else>Verificando...</span>
            </button>

            <div class="forgot-password">
              <a href="#" class="link-recuperar" @click.prevent="mostrarRecuperacion = true">
                Olvidaste tu contrasena?
              </a>
            </div>
          </form>

          <div class="login-footer">
            <p>Sistema de Organizacion de Eventos</p>
            <p>v1.3.0 - {{ anioActual }}</p>
          </div>
        </div>
      </section>
    </main>

    <!-- Modal de Recuperación de Contraseña -->
    <div v-if="mostrarRecuperacion" class="modal-overlay" @click="cerrarRecuperacion">
      <div class="modal-content" @click.stop>
        <button class="btn-cerrar" @click="cerrarRecuperacion">×</button>

        <h2>Recuperar Contraseña</h2>

        <!-- Paso 1: Solicitar código -->
        <div v-if="pasoRecuperacion === 1" class="paso-recuperacion">
          <p>Ingresa tu correo electrónico y te enviaremos un código de verificación.</p>

          <form @submit.prevent="solicitarCodigo">
            <div class="form-group">
              <label>Correo Electrónico</label>
              <input
                v-model="emailRecuperacion"
                type="email"
                placeholder="tu@email.com"
                required
                :disabled="cargandoRecuperacion"
              />
            </div>

            <button type="submit" class="btn-submit" :disabled="cargandoRecuperacion">
              {{ cargandoRecuperacion ? 'Enviando...' : 'Enviar Código' }}
            </button>
          </form>
        </div>

        <!-- Paso 2: Ingresar código -->
        <div v-if="pasoRecuperacion === 2" class="paso-recuperacion">
          <p>Ingresa el código de 6 dígitos que enviamos a tu correo.</p>

          <form @submit.prevent="verificarCodigo">
            <div class="form-group">
              <label>Código de Verificación</label>
              <input
                v-model="codigoRecuperacion"
                type="text"
                placeholder="123456"
                maxlength="6"
                required
                :disabled="cargandoRecuperacion"
                class="input-codigo"
              />
            </div>

            <button type="submit" class="btn-submit" :disabled="cargandoRecuperacion">
              {{ cargandoRecuperacion ? 'Verificando...' : 'Verificar Código' }}
            </button>

            <button type="button" class="btn-volver" @click="pasoRecuperacion = 1">
              Volver
            </button>
          </form>
        </div>

        <!-- Paso 3: Nueva contraseña -->
        <div v-if="pasoRecuperacion === 3" class="paso-recuperacion">
          <p>Crea una nueva contraseña segura (mínimo 8 caracteres).</p>

          <form @submit.prevent="restablecerPassword">
            <div class="form-group">
              <label>Nueva Contraseña</label>
              <input
                v-model="nuevaPassword"
                type="password"
                placeholder="Mínimo 8 caracteres"
                minlength="8"
                required
                :disabled="cargandoRecuperacion"
              />
            </div>

            <div class="form-group">
              <label>Confirmar Contraseña</label>
              <input
                v-model="confirmarPassword"
                type="password"
                placeholder="Repite la contraseña"
                minlength="8"
                required
                :disabled="cargandoRecuperacion"
              />
            </div>

            <button type="submit" class="btn-submit" :disabled="cargandoRecuperacion">
              {{ cargandoRecuperacion ? 'Cambiando...' : 'Cambiar Contraseña' }}
            </button>
          </form>
        </div>

        <div v-if="mensajeRecuperacion" :class="['mensaje-recuperacion', tipoMensaje]">
          {{ mensajeRecuperacion }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'

const emit = defineEmits(['login'])
const { success, error: showError } = useToast()

const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)
const anioActual = new Date().getFullYear()

// Recuperación de contraseña
const mostrarRecuperacion = ref(false)
const pasoRecuperacion = ref(1)
const emailRecuperacion = ref('')
const codigoRecuperacion = ref('')
const nuevaPassword = ref('')
const confirmarPassword = ref('')
const cargandoRecuperacion = ref(false)
const mensajeRecuperacion = ref('')
const tipoMensaje = ref('success')

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function iniciarSesion() {
  error.value = ''
  cargando.value = true

  try {
    await authStore.login(email.value, password.value)
    success(`Bienvenido, ${authStore.usuario.nombre}!`, 'Login Exitoso')
    emit('login', authStore.usuario)
  } catch (err) {
    error.value = err.message || 'Credenciales inválidas'
    showError(error.value, 'Error de Autenticación')
  } finally {
    cargando.value = false
  }
}

// ========== FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA ==========

function cerrarRecuperacion() {
  mostrarRecuperacion.value = false
  pasoRecuperacion.value = 1
  emailRecuperacion.value = ''
  codigoRecuperacion.value = ''
  nuevaPassword.value = ''
  confirmarPassword.value = ''
  mensajeRecuperacion.value = ''
}

async function solicitarCodigo() {
  mensajeRecuperacion.value = ''
  cargandoRecuperacion.value = true

  try {
    const response = await fetch(`${BACKEND_URL}/password-recovery/solicitar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailRecuperacion.value })
    })

    const data = await response.json()

    if (data.success) {
      pasoRecuperacion.value = 2
      tipoMensaje.value = 'success'
      mensajeRecuperacion.value = data.message
      success(data.message || 'Código de recuperación enviado. Revisa tu correo.', 'Éxito', 5000)
    } else {
      tipoMensaje.value = 'error'
      mensajeRecuperacion.value = data.message || 'Error al enviar código'
    }
  } catch (err) {
    console.error('Error al solicitar código:', err)
    tipoMensaje.value = 'error'
    mensajeRecuperacion.value = 'Error de conexión. Verifica que el backend esté corriendo.'
  } finally {
    cargandoRecuperacion.value = false
  }
}

async function verificarCodigo() {
  mensajeRecuperacion.value = ''
  cargandoRecuperacion.value = true

  try {
    const response = await fetch(`${BACKEND_URL}/password-recovery/verificar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailRecuperacion.value,
        codigo: codigoRecuperacion.value
      })
    })

    const data = await response.json()

    if (data.success) {
      pasoRecuperacion.value = 3
      tipoMensaje.value = 'success'
      mensajeRecuperacion.value = 'Código verificado correctamente'
    } else {
      tipoMensaje.value = 'error'
      mensajeRecuperacion.value = data.message || 'Código inválido o expirado'
    }
  } catch (err) {
    console.error('Error al verificar código:', err)
    tipoMensaje.value = 'error'
    mensajeRecuperacion.value = 'Error de conexión'
  } finally {
    cargandoRecuperacion.value = false
  }
}

async function restablecerPassword() {
  // Validar que las contraseñas coincidan
  if (nuevaPassword.value !== confirmarPassword.value) {
    tipoMensaje.value = 'error'
    mensajeRecuperacion.value = 'Las contraseñas no coinciden'
    return
  }

  mensajeRecuperacion.value = ''
  cargandoRecuperacion.value = true

  try {
    const response = await fetch(`${BACKEND_URL}/password-recovery/restablecer-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailRecuperacion.value,
        codigo: codigoRecuperacion.value,
        nuevaPassword: nuevaPassword.value
      })
    })

    const data = await response.json()

    if (data.success) {
      tipoMensaje.value = 'success'
      mensajeRecuperacion.value = 'Contrasena restablecida exitosamente'
      success('Contraseña cambiada exitosamente', 'Éxito')

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        cerrarRecuperacion()
      }, 2000)
    } else {
      tipoMensaje.value = 'error'
      mensajeRecuperacion.value = data.message || 'Error al restablecer contraseña'
    }
  } catch (err) {
    console.error('Error al restablecer contraseña:', err)
    tipoMensaje.value = 'error'
    mensajeRecuperacion.value = 'Error de conexión'
  } finally {
    cargandoRecuperacion.value = false
  }
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   PAGE SHELL
═══════════════════════════════════════════════ */
.public-page {
  min-height: 100vh;
  min-height: 100dvh;
  background:
    radial-gradient(ellipse at 10% 50%, rgba(255, 215, 0, 0.07) 0%, transparent 55%),
    radial-gradient(ellipse at 90% 10%, rgba(255, 215, 0, 0.04) 0%, transparent 50%),
    linear-gradient(160deg, #0a0a0a 0%, #141414 45%, #0d0d0d 100%);
  color: #f1f5f9;
  font-family: 'Manrope', 'Segoe UI', sans-serif;
}

/* ═══════════════════════════════════════════════
   TOP NAV
═══════════════════════════════════════════════ */
.public-header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 215, 0, 0.12);
}

.public-header > * {
  max-width: min(1200px, 92%);
  margin-inline: auto;
}

.public-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 clamp(1rem, 4vw, 2rem);
  height: 64px;
}

.brand {
  font-family: 'Sora', sans-serif;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #FFD700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
  text-transform: uppercase;
}

.main-nav {
  display: flex;
  gap: 0.25rem;
}

.main-nav a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.45rem 0.85rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.main-nav a:hover {
  color: #FFD700;
  background: rgba(255, 215, 0, 0.08);
}

.btn-header {
  text-decoration: none;
  background: #FFD700;
  color: #0a0a0a;
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.88rem;
  letter-spacing: 0.02em;
  transition: all 0.2s;
  box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4);
}

.btn-header:hover {
  background: #ffe033;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.35);
  transform: translateY(-1px);
}

/* ═══════════════════════════════════════════════
   MAIN LAYOUT
═══════════════════════════════════════════════ */
.public-main {
  width: min(1200px, 92%);
  margin: 0 auto;
  padding: 2.5rem 0 3rem;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 1.75rem;
  align-items: start;
}

/* ═══════════════════════════════════════════════
   HERO PANEL
═══════════════════════════════════════════════ */
.hero-panel {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 215, 0, 0.15);
  border-radius: 1.5rem;
  padding: clamp(1.75rem, 4vw, 2.5rem);
  box-shadow:
    0 0 0 1px rgba(255, 215, 0, 0.04),
    0 25px 50px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
}

.hero-kicker {
  display: inline-block;
  color: #FFD700;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 0 0 1rem;
  padding: 0.3rem 0.75rem;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 999px;
  border: 1px solid rgba(255, 215, 0, 0.25);
}

.hero-panel h1 {
  margin: 0 0 1rem;
  font-family: 'Sora', sans-serif;
  font-size: clamp(1.85rem, 4vw, 2.75rem);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.hero-description {
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.7;
  max-width: 52ch;
  font-size: 0.97rem;
}

.hero-organizador {
  margin-top: 1.5rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 215, 0, 0.05);
  border-left: 3px solid #FFD700;
  border-radius: 0 0.75rem 0.75rem 0;
}

.hero-organizador h2 {
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #FFD700;
}

.hero-organizador p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.92rem;
  line-height: 1.6;
}

.hero-list {
  margin: 1.4rem 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.hero-list li {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.93rem;
  font-weight: 500;
}

.hero-list li::before {
  content: '✓';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: rgba(255, 215, 0, 0.15);
  color: #FFD700;
  font-size: 0.75rem;
  font-weight: 800;
  flex-shrink: 0;
}

.hero-media {
  margin: 1.5rem 0 0;
}

.hero-media img {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 1rem;
  border: 1px solid rgba(255, 215, 0, 0.12);
  filter: brightness(0.85) saturate(0.9);
}

.hero-media figcaption {
  margin-top: 0.5rem;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.3);
}

/* ═══════════════════════════════════════════════
   LOGIN CARD
═══════════════════════════════════════════════ */
.login-panel {
  display: flex;
  position: sticky;
  top: calc(64px + 1.5rem);
}

.login-card {
  background: #ffffff;
  border-radius: 1.25rem;
  box-shadow:
    0 0 0 1px rgba(255, 215, 0, 0.15),
    0 20px 50px rgba(0, 0, 0, 0.5);
  width: 100%;
  overflow: hidden;
  color: #111827;
}

.login-header {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  padding: 2rem 1.75rem 1.75rem;
  text-align: center;
  border-bottom: 3px solid #FFD700;
  position: relative;
  overflow: hidden;
}

.login-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 120%, rgba(255, 215, 0, 0.12) 0%, transparent 65%);
  pointer-events: none;
}

.login-header h2 {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: 1.65rem;
  font-weight: 800;
  color: #FFD700;
  letter-spacing: -0.01em;
  position: relative;
}

.login-header p {
  margin: 0.5rem 0 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  position: relative;
}

.login-form {
  padding: 1.75rem 1.75rem 1.25rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.45rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.88rem;
  letter-spacing: 0.01em;
}

.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.6rem;
  font-size: 0.97rem;
  font-family: inherit;
  color: #111827;
  background: #fafafa;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #FFD700;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.14);
}

.form-group input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
  color: #9ca3af;
}

.error-message {
  background: #fff1f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.7rem 1rem;
  border-radius: 0.6rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  animation: shake 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}

.btn-login {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #FFD700 0%, #F59E0B 100%);
  border: none;
  border-radius: 0.6rem;
  color: #111827;
  font-size: 1rem;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 4px 14px rgba(255, 215, 0, 0.35);
  letter-spacing: 0.02em;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(255, 215, 0, 0.45);
  background: linear-gradient(135deg, #ffe033 0%, #FBBF24 100%);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.btn-login:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  background: #f9fafb;
  padding: 0.875rem 1.75rem;
  text-align: center;
  border-top: 1px solid #f3f4f6;
}

.login-footer p {
  margin: 3px 0;
  color: #9ca3af;
  font-size: 0.8rem;
}

/* Enlace de Recuperación */
.forgot-password {
  text-align: center;
  margin-top: 1.1rem;
}

.link-recuperar {
  color: #B45309;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: color 0.2s;
}

.link-recuperar:hover {
  color: #92400E;
  text-decoration: underline;
}

/* ═══════════════════════════════════════════════
   MODAL RECUPERACIÓN
═══════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.25rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: #ffffff;
  border-radius: 1.25rem;
  max-width: 460px;
  width: 100%;
  max-height: 90vh;
  max-height: 90dvh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-content h2 {
  margin: 0;
  padding: 1.75rem 1.75rem 1.25rem;
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
  border-bottom: 2px solid #FFD700;
}

.btn-cerrar {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #f3f4f6;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  line-height: 1;
}

.btn-cerrar:hover {
  background: #e5e7eb;
  color: #111827;
  transform: rotate(90deg);
}

.paso-recuperacion {
  padding: 1.5rem 1.75rem;
}

.paso-recuperacion p {
  color: #6b7280;
  margin-bottom: 1.25rem;
  line-height: 1.6;
  font-size: 0.92rem;
}

.paso-recuperacion form {
  margin-top: 0;
}

.input-codigo {
  text-align: center;
  font-size: 1.75rem;
  letter-spacing: 0.5rem;
  font-weight: 800;
  color: #111827;
}

.btn-submit {
  width: 100%;
  padding: 0.825rem;
  background: linear-gradient(135deg, #FFD700 0%, #F59E0B 100%);
  border: none;
  border-radius: 0.6rem;
  color: #111827;
  font-size: 0.97rem;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 4px 14px rgba(255, 215, 0, 0.3);
  margin-top: 0.75rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
}

.btn-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.btn-volver {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.6rem;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.btn-volver:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.mensaje-recuperacion {
  margin: 0 1.75rem 1.5rem;
  padding: 0.85rem 1rem;
  border-radius: 0.6rem;
  font-size: 0.875rem;
  font-weight: 500;
  animation: slideDown 0.25s ease;
}

@keyframes slideDown {
  from { transform: translateY(-8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.mensaje-recuperacion.success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.mensaje-recuperacion.error {
  background: #fff1f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

/* ═══════════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════════ */
@media (max-width: 980px) {
  .public-header {
    flex-wrap: wrap;
    height: auto;
    padding-block: 0.875rem;
  }

  .main-nav {
    order: 3;
    width: 100%;
    justify-content: center;
  }

  .public-main {
    grid-template-columns: 1fr;
    padding-top: 1.75rem;
  }

  .login-panel {
    position: static;
  }
}

@media (max-width: 480px) {
  .login-card {
    border-radius: 1rem;
  }

  .login-header {
    padding: 1.5rem 1.25rem;
  }

  .login-header h2 {
    font-size: 1.4rem;
  }

  .login-form {
    padding: 1.5rem 1.25rem 1rem;
  }

  .paso-recuperacion {
    padding: 1.25rem;
  }

  .modal-content h2 {
    font-size: 1.3rem;
    padding: 1.5rem 1.25rem 1rem;
  }

  .mensaje-recuperacion {
    margin-inline: 1.25rem;
  }
}
</style>
