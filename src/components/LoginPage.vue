<template>
  <div class="login-page">

    <!-- ══════════════ LEFT PANEL: Branding ══════════════ -->
    <div class="login-left">
      <!-- Decorative orbs -->
      <div class="left-orb left-orb-1"></div>
      <div class="left-orb left-orb-2"></div>

      <!-- Gold top border line -->
      <div class="left-top-line"></div>

      <div class="left-content">

        <!-- Back link -->
        <a class="back-link" href="#" @click.prevent="$emit('go-home')">
          ← Volver al inicio
        </a>

        <!-- Logo -->
        <div class="left-brand">
          <span class="brand-icon">E</span>
          <span class="brand-name">EventRoll</span>
        </div>

        <!-- Tagline -->
        <h2 class="left-tagline">
          La plataforma que pone<br>
          <span class="left-accent">cada invitado en su lugar</span>
        </h2>

        <!-- Feature list -->
        <ul class="left-features">
          <li class="left-feature-item">
            <span class="feat-check">✓</span>
            <span>Gestión completa de listas de invitados</span>
          </li>
          <li class="left-feature-item">
            <span class="feat-check">✓</span>
            <span>Confirmación de asistencia en tiempo real</span>
          </li>
          <li class="left-feature-item">
            <span class="feat-check">✓</span>
            <span>Importación masiva desde Excel</span>
          </li>
          <li class="left-feature-item">
            <span class="feat-check">✓</span>
            <span>5 roles de acceso para tu equipo</span>
          </li>
        </ul>

        <!-- Bottom quote -->
        <p class="left-quote">
          "Organiza eventos con la precisión que merecen."
        </p>

      </div>
    </div>

    <!-- ══════════════ RIGHT PANEL: Form ══════════════ -->
    <div class="login-right">
      <div class="login-right-inner">

        <!-- Card principal -->
        <div class="login-card">
          <div class="card-head">
            <h1>Bienvenido de vuelta</h1>
            <p>Ingresa tus credenciales para acceder al panel</p>
          </div>

          <!-- ── FORM: email + contraseña ── -->
          <form v-if="!modoId" class="login-form" @submit.prevent="iniciarSesion">
            <div class="field">
              <label for="email">Correo electrónico</label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="tu_correo@gmail.com"
                required
                autocomplete="email"
                :disabled="cargando"
              />
            </div>

            <div class="field">
              <label for="password">
                Contraseña
                <a href="#" class="label-link" @click.prevent="mostrarRecuperacion = true">
                  ¿Olvidaste tu contraseña?
                </a>
              </label>
              <div class="input-wrapper">
                <input
                  id="password"
                  v-model="password"
                  :type="verPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  autocomplete="current-password"
                  :disabled="cargando"
                />
                <button type="button" class="toggle-pass" :title="verPassword ? 'Ocultar' : 'Mostrar'" @click="verPassword = !verPassword">
                  <svg v-if="!verPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>

            <div v-if="error" class="error-msg">
              <span>⚠</span> {{ error }}
            </div>

            <button type="submit" class="btn-submit" :disabled="cargando">
              <span v-if="!cargando">Iniciar sesión</span>
              <span v-else class="loading-text">
                <span class="spinner"></span> Verificando...
              </span>
            </button>
          </form>

          <!-- ── FORM: código de acceso ── -->
          <form v-else class="login-form" @submit.prevent="iniciarSesionConCodigo">
            <div class="field">
              <label for="codigo">Código de acceso</label>
              <input
                id="codigo"
                v-model="codigo"
                type="text"
                placeholder="Ej: AB3X9K2M"
                required
                autocomplete="off"
                maxlength="12"
                class="input-code-login"
                :disabled="cargando"
                @input="codigo = codigo.toUpperCase()"
              />
              <span class="field-hint">El administrador te proporcionó este código</span>
            </div>

            <div v-if="error" class="error-msg">
              <span>⚠</span> {{ error }}
            </div>

            <button type="submit" class="btn-submit" :disabled="cargando">
              <span v-if="!cargando">Entrar con código</span>
              <span v-else class="loading-text">
                <span class="spinner"></span> Verificando...
              </span>
            </button>
          </form>

          <!-- ── divisor + toggle modo ── -->
          <div class="modo-divisor">
            <span></span><em>o</em><span></span>
          </div>

          <button class="btn-modo-toggle" type="button" @click="toggleModo">
            <span v-if="!modoId">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Entrar con ID
            </span>
            <span v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Usar correo y contraseña
            </span>
          </button>

          <p class="card-footer">
            Sistema de gestión de eventos &nbsp;·&nbsp; v1.3.0
          </p>
        </div>

      </div>
    </div>

    <!-- ═══════ MODAL RECUPERACIÓN ═══════ -->
    <div v-if="mostrarRecuperacion" class="modal-overlay" @click="cerrarRecuperacion">
      <div class="modal-box" @click.stop>
        <button class="modal-close" @click="cerrarRecuperacion">✕</button>
        <h2>Recuperar contraseña</h2>

        <!-- Paso 1 -->
        <div v-if="paso === 1" class="modal-step">
          <p>Ingresa tu correo y te enviaremos un código de verificación.</p>
          <form @submit.prevent="solicitarCodigo">
            <div class="field">
              <label>Correo electrónico</label>
              <input v-model="emailRec" type="email" placeholder="tu@email.com" required :disabled="cargandoRec" />
            </div>
            <button type="submit" class="btn-submit" :disabled="cargandoRec">
              {{ cargandoRec ? 'Enviando...' : 'Enviar código' }}
            </button>
          </form>
        </div>

        <!-- Paso 2 -->
        <div v-if="paso === 2" class="modal-step">
          <p>Ingresa el código de 6 dígitos que enviamos a tu correo.</p>
          <form @submit.prevent="verificarCodigo">
            <div class="field">
              <label>Código de verificación</label>
              <input v-model="codigoRec" type="text" placeholder="123456" maxlength="6" required :disabled="cargandoRec" class="input-code" />
            </div>
            <button type="submit" class="btn-submit" :disabled="cargandoRec">
              {{ cargandoRec ? 'Verificando...' : 'Verificar código' }}
            </button>
            <button type="button" class="btn-back" @click="paso = 1">← Volver</button>
          </form>
        </div>

        <!-- Paso 3 -->
        <div v-if="paso === 3" class="modal-step">
          <p>Crea una nueva contraseña segura (mínimo 8 caracteres).</p>
          <form @submit.prevent="restablecerPassword">
            <div class="field">
              <label>Nueva contraseña</label>
              <input v-model="newPass" type="password" placeholder="Mínimo 8 caracteres" minlength="8" required :disabled="cargandoRec" />
            </div>
            <div class="field">
              <label>Confirmar contraseña</label>
              <input v-model="confirmPass" type="password" placeholder="Repite la contraseña" minlength="8" required :disabled="cargandoRec" />
            </div>
            <button type="submit" class="btn-submit" :disabled="cargandoRec">
              {{ cargandoRec ? 'Cambiando...' : 'Cambiar contraseña' }}
            </button>
          </form>
        </div>

        <div v-if="msgRec" :class="['modal-msg', tipoMsg]">{{ msgRec }}</div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'

const emit = defineEmits(['login', 'go-home'])
const { success, error: showError } = useToast()
const authStore = useAuthStore()

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// ─── Login ────────────────────────────────
const email       = ref('')
const password    = ref('')
const codigo      = ref('')
const modoId      = ref(false)
const error       = ref('')
const cargando    = ref(false)
const verPassword = ref(false)

function toggleModo() {
  modoId.value = !modoId.value
  error.value = ''
  codigo.value = ''
}

async function iniciarSesion() {
  error.value = ''
  cargando.value = true
  try {
    await authStore.login(email.value.trim(), password.value)
    success(`Bienvenido, ${authStore.usuario.nombre}!`, 'Sesión iniciada')
    emit('login', authStore.usuario)
  } catch (err) {
    if (err.data?.errors?.length) {
      error.value = err.data.errors[0].message
    } else {
      error.value = err.message || 'Credenciales inválidas'
    }
    showError(error.value, 'Error de autenticación')
  } finally {
    cargando.value = false
  }
}

async function iniciarSesionConCodigo() {
  error.value = ''
  cargando.value = true
  try {
    await authStore.loginConCodigo(codigo.value.trim())
    success(`Bienvenido, ${authStore.usuario.nombre}!`, 'Acceso concedido')
    emit('login', authStore.usuario)
  } catch (err) {
    error.value = err.message || 'Código de acceso incorrecto'
    showError(error.value, 'Error de autenticación')
  } finally {
    cargando.value = false
  }
}

// ─── Recuperación ─────────────────────────
const mostrarRecuperacion = ref(false)
const paso        = ref(1)
const emailRec    = ref('')
const codigoRec   = ref('')
const newPass     = ref('')
const confirmPass = ref('')
const cargandoRec = ref(false)
const msgRec      = ref('')
const tipoMsg     = ref('success')

function cerrarRecuperacion() {
  mostrarRecuperacion.value = false
  paso.value = 1
  emailRec.value = ''
  codigoRec.value = ''
  newPass.value = ''
  confirmPass.value = ''
  msgRec.value = ''
}

async function solicitarCodigo() {
  msgRec.value = ''
  cargandoRec.value = true
  try {
    const res = await fetch(`${BACKEND_URL}/password-recovery/solicitar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailRec.value })
    })
    const data = await res.json()
    if (data.success) {
      paso.value = 2
      tipoMsg.value = 'success'
      msgRec.value = data.message
    } else {
      tipoMsg.value = 'error'
      msgRec.value = data.message || 'Error al enviar código'
    }
  } catch {
    tipoMsg.value = 'error'
    msgRec.value = 'Error de conexión con el servidor'
  } finally {
    cargandoRec.value = false
  }
}

async function verificarCodigo() {
  msgRec.value = ''
  cargandoRec.value = true
  try {
    const res = await fetch(`${BACKEND_URL}/password-recovery/verificar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailRec.value, codigo: codigoRec.value })
    })
    const data = await res.json()
    if (data.success) {
      paso.value = 3
      tipoMsg.value = 'success'
      msgRec.value = 'Código verificado correctamente'
    } else {
      tipoMsg.value = 'error'
      msgRec.value = data.message || 'Código inválido o expirado'
    }
  } catch {
    tipoMsg.value = 'error'
    msgRec.value = 'Error de conexión con el servidor'
  } finally {
    cargandoRec.value = false
  }
}

async function restablecerPassword() {
  if (newPass.value !== confirmPass.value) {
    tipoMsg.value = 'error'
    msgRec.value = 'Las contraseñas no coinciden'
    return
  }
  msgRec.value = ''
  cargandoRec.value = true
  try {
    const res = await fetch(`${BACKEND_URL}/password-recovery/restablecer-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailRec.value, codigo: codigoRec.value, nuevaPassword: newPass.value })
    })
    const data = await res.json()
    if (data.success) {
      tipoMsg.value = 'success'
      msgRec.value = 'Contraseña restablecida exitosamente'
      success('Contraseña cambiada exitosamente', 'Éxito')
      setTimeout(cerrarRecuperacion, 2000)
    } else {
      tipoMsg.value = 'error'
      msgRec.value = data.message || 'Error al restablecer contraseña'
    }
  } catch {
    tipoMsg.value = 'error'
    msgRec.value = 'Error de conexión con el servidor'
  } finally {
    cargandoRec.value = false
  }
}
</script>

<style scoped>
/* ════════════════════════════════════════════
   PAGE — SPLIT SCREEN GRID
════════════════════════════════════════════ */
.login-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  min-height: 100dvh;
  font-family: 'Manrope', 'Segoe UI', sans-serif;
  position: relative;
}

/* ════════════════════════════════════════════
   LEFT PANEL — BRANDING
════════════════════════════════════════════ */
.login-left {
  position: relative;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 3rem 3rem 3rem;
  overflow: hidden;
}

/* Gold gradient top border on left panel */
.left-top-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #FFD700, transparent);
  z-index: 2;
}

/* Decorative orbs */
.left-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
}

.left-orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  top: -150px;
  left: -150px;
}

.left-orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%);
  bottom: -100px;
  right: -80px;
}

/* Left panel content */
.left-content {
  position: relative;
  z-index: 1;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Back link */
.back-link {
  color: rgba(255, 255, 255, 0.35);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: color 0.2s;
  margin-bottom: 2.5rem;
  width: fit-content;
}

.back-link:hover {
  color: rgba(255, 255, 255, 0.7);
}

/* Logo / brand */
.left-brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 2rem;
}

.brand-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: #FFD700;
  color: #0a0a0a;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Sora', sans-serif;
  font-weight: 800;
  font-size: 1.15rem;
  box-shadow: 0 0 24px rgba(255, 215, 0, 0.35);
  flex-shrink: 0;
}

.brand-name {
  font-family: 'Sora', sans-serif;
  font-weight: 800;
  font-size: 1.4rem;
  color: #ffffff;
  letter-spacing: 0.03em;
}

/* Tagline heading */
.left-tagline {
  font-family: 'Sora', sans-serif;
  font-size: clamp(1.4rem, 2.5vw, 2rem);
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.025em;
  line-height: 1.2;
  margin: 0 0 2rem;
}

.left-accent {
  background: linear-gradient(135deg, #FFD700 0%, #F59E0B 60%, #FFD700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Feature list */
.left-features {
  list-style: none;
  margin: 0 0 2.5rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.left-feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 500;
  line-height: 1.4;
}

.feat-check {
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 50%;
  background: rgba(255, 215, 0, 0.12);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: #FFD700;
  font-size: 0.65rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Bottom quote */
.left-quote {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.25);
  font-style: italic;
  font-weight: 500;
  margin: 0;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  line-height: 1.6;
}

/* ════════════════════════════════════════════
   RIGHT PANEL — FORM
════════════════════════════════════════════ */
.login-right {
  background: #0d0d0d;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 3rem;
  position: relative;
}

.login-right-inner {
  width: 100%;
  max-width: 420px;
}

/* ════════════════════════════════════════════
   CARD
════════════════════════════════════════════ */
.login-card {
  width: 100%;
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2.25rem;
  box-shadow:
    0 0 0 1px rgba(255, 215, 0, 0.06),
    0 24px 60px rgba(0, 0, 0, 0.6);
}

.card-head {
  text-align: center;
  margin-bottom: 1.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.card-head h1 {
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin: 0 0 0.4rem;
}

.card-head p {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.875rem;
  margin: 0;
}

/* ════════════════════════════════════════════
   FORM
════════════════════════════════════════════ */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 0.01em;
}

.label-link {
  color: rgba(255, 215, 0, 0.7);
  text-decoration: none;
  font-size: 0.78rem;
  font-weight: 600;
  transition: color 0.2s;
}

.label-link:hover {
  color: #FFD700;
}

.field input {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-family: inherit;
  color: #ffffff;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.field input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.field input:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.5);
  background: rgba(255, 215, 0, 0.03);
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.08);
}

.field input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  padding-right: 2.75rem;
}

.toggle-pass {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.2s;
}

.toggle-pass:hover {
  color: rgba(255, 215, 0, 0.8);
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
  animation: shake 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

.btn-submit {
  width: 100%;
  padding: 0.85rem;
  background: linear-gradient(135deg, #FFD700 0%, #F59E0B 100%);
  border: none;
  border-radius: 8px;
  color: #0a0a0a;
  font-size: 0.97rem;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.25);
  margin-top: 0.25rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.4);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.loading-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-top-color: #0a0a0a;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.card-footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.75rem;
  margin: 1.25rem 0 0;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* ── código de acceso ── */
.input-code-login {
  text-align: center;
  letter-spacing: 0.25rem;
  font-size: 1.1rem !important;
  font-weight: 700 !important;
  text-transform: uppercase;
}

.field-hint {
  font-size: 0.76rem;
  color: rgba(255,255,255,0.3);
  margin-top: 2px;
}

/* ── divisor o ── */
.modo-divisor {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 1.1rem 0 0.75rem;
}

.modo-divisor span {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.07);
}

.modo-divisor em {
  font-style: normal;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.25);
  font-weight: 600;
}

/* ── botón toggle modo ── */
.btn-modo-toggle {
  width: 100%;
  padding: 0.7rem;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: rgba(255,255,255,0.45);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.btn-modo-toggle span {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-modo-toggle:hover {
  border-color: rgba(255,215,0,0.3);
  color: rgba(255,215,0,0.8);
  background: rgba(255,215,0,0.03);
}

/* ════════════════════════════════════════════
   MODAL
════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(6px);
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

.modal-box {
  background: #141414;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  max-height: 90dvh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  padding: 2rem;
}

@keyframes slideUp {
  from { transform: translateY(24px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-box h2 {
  font-family: 'Sora', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  padding-right: 2rem;
}

.modal-close {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  color: rgba(255, 255, 255, 0.5);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  transform: rotate(90deg);
}

.modal-step p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  line-height: 1.65;
  margin: 0 0 1.25rem;
}

.modal-step form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-code {
  text-align: center;
  font-size: 1.75rem !important;
  letter-spacing: 0.5rem !important;
  font-weight: 800 !important;
}

.btn-back {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  padding: 0.65rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.8);
}

.modal-msg {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-msg.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #6ee7b7;
}

.modal-msg.error {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

/* ════════════════════════════════════════════
   RESPONSIVE
════════════════════════════════════════════ */

/* Tablet: reduce left panel padding, smaller text */
@media (max-width: 1024px) {
  .login-left {
    padding: 2.5rem 2rem;
  }

  .login-right {
    padding: 2.5rem 2rem;
  }

  .left-tagline {
    font-size: 1.5rem;
  }
}

/* Mobile: stack vertically, collapse left to just logo + back link */
@media (max-width: 768px) {
  .login-page {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .login-left {
    padding: 1.5rem 1.5rem;
    align-items: flex-start;
    min-height: unset;
  }

  .left-content {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    max-width: 100%;
  }

  .left-tagline {
    display: none;
  }

  .left-features {
    display: none;
  }

  .left-quote {
    display: none;
  }

  .back-link {
    margin-bottom: 0;
    order: -1;
  }

  .left-brand {
    margin-bottom: 0;
  }

  .login-right {
    padding: 2rem 1.25rem;
  }

  .login-right-inner {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.75rem 1.25rem;
  }

  .left-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .back-link {
    order: 0;
  }
}
</style>
