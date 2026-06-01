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
          <ArrowLeft :size="14" /> Volver al inicio
        </a>

        <!-- Logo -->
        <div class="left-brand">
          <span class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor"/>
              <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
              <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
              <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor"/>
            </svg>
          </span>
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
            <span class="feat-check"><Check :size="12" stroke-width="3" /></span>
            <span>Gestión completa de listas de invitados</span>
          </li>
          <li class="left-feature-item">
            <span class="feat-check"><Check :size="12" stroke-width="3" /></span>
            <span>Confirmación de asistencia en tiempo real</span>
          </li>
          <li class="left-feature-item">
            <span class="feat-check"><Check :size="12" stroke-width="3" /></span>
            <span>Importación masiva desde Excel</span>
          </li>
          <li class="left-feature-item">
            <span class="feat-check"><Check :size="12" stroke-width="3" /></span>
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
            <h1>{{ modoRegistro ? 'Crear cuenta' : modoId ? 'Acceso por ID' : 'Bienvenido de vuelta' }}</h1>
            <p>{{ modoRegistro ? 'Registrate para acceder al panel' : modoId ? 'Ingresa el código de acceso' : 'Ingresa tus credenciales para acceder al panel' }}</p>
          </div>

          <!-- ── FORM: email + contraseña ── -->
          <form v-if="!modoId && !modoRegistro" class="login-form" novalidate @submit.prevent="iniciarSesion">
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
                :aria-invalid="!!emailError"
                aria-describedby="email-error"
              />
              <FieldError id="email-error" :mensaje="emailError" />
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
                  :aria-invalid="!!passwordError"
                  aria-describedby="password-error"
                />
                <button type="button" class="toggle-pass" :title="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="verPassword = !verPassword">
                  <svg v-if="!verPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
              <FieldError id="password-error" :mensaje="passwordError" />
            </div>

            <div v-if="error" class="error-msg" role="alert">
              <AlertTriangle :size="16" aria-hidden="true" /> {{ error }}
            </div>

            <button type="submit" class="btn-submit" :disabled="cargando">
              <span v-if="!cargando">Iniciar sesión</span>
              <span v-else class="loading-text">
                <span class="spinner"></span> Verificando...
              </span>
            </button>
          </form>

          <!-- ── FORM: código de acceso ── -->
          <form v-if="modoId" class="login-form" @submit.prevent="iniciarSesionConCodigo">
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
              <AlertTriangle :size="16" aria-hidden="true" /> {{ error }}
            </div>

            <button type="submit" class="btn-submit" :disabled="cargando">
              <span v-if="!cargando">Entrar con código</span>
              <span v-else class="loading-text">
                <span class="spinner"></span> Verificando...
              </span>
            </button>
          </form>

          <!-- ── FORM: registro ── -->
          <form v-if="modoRegistro" class="login-form" novalidate @submit.prevent="registrarCuenta">
            <div class="field">
              <label for="reg-nombre">Nombre completo</label>
              <input
                id="reg-nombre"
                v-model="regNombre"
                type="text"
                placeholder="Tu nombre"
                required
                minlength="3"
                :disabled="cargando"
              />
            </div>
            <div class="field">
              <label for="reg-email">Correo electrónico</label>
              <input
                id="reg-email"
                v-model="regEmail"
                type="email"
                placeholder="tu_correo@gmail.com"
                required
                autocomplete="email"
                :disabled="cargando"
              />
            </div>
            <div class="field">
              <label for="reg-password">Contraseña</label>
              <div class="input-wrapper">
                <input
                  id="reg-password"
                  v-model="regPassword"
                  :type="verPasswordReg ? 'text' : 'password'"
                  placeholder="Mínimo 8 caracteres"
                  required
                  minlength="8"
                  autocomplete="new-password"
                  :disabled="cargando"
                />
                <button type="button" class="toggle-pass" :title="verPasswordReg ? 'Ocultar' : 'Mostrar'" @click="verPasswordReg = !verPasswordReg">
                  <svg v-if="!verPasswordReg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>

            <div v-if="error" class="error-msg" role="alert">
              <AlertTriangle :size="16" aria-hidden="true" /> {{ error }}
            </div>

            <button type="submit" class="btn-submit" :disabled="cargando">
              <span v-if="!cargando">Crear cuenta</span>
              <span v-else class="loading-text">
                <span class="spinner"></span> Creando...
              </span>
            </button>
          </form>

          <!-- ── divisor + toggles ── -->
          <div class="modo-divisor">
            <span></span><em>o</em><span></span>
          </div>

          <div class="login-toggles">
            <button
              class="btn-modo-toggle"
              :class="{ 'btn-modo-toggle--active': !modoId && !modoRegistro }"
              type="button"
              @click="modoId = false; modoRegistro = false"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Iniciar sesión
            </button>
            <button
              class="btn-modo-toggle"
              :class="{ 'btn-modo-toggle--active': modoId }"
              type="button"
              @click="modoId = true; modoRegistro = false"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Entrar con ID
            </button>
            <button
              class="btn-modo-toggle"
              :class="{ 'btn-modo-toggle--active': modoRegistro }"
              type="button"
              @click="modoRegistro = true; modoId = false"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Crear cuenta
            </button>
          </div>

          <p class="card-footer">
            Sistema de gestión de eventos
          </p>
        </div>

      </div>
    </div>

    <PasswordRecoveryModal v-model="mostrarRecuperacion" />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowLeft, Check, AlertTriangle } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import { authAPI } from '../services/api'
import FieldError from './FieldError.vue'
import PasswordRecoveryModal from './PasswordRecoveryModal.vue'

const emit = defineEmits(['login', 'go-home'])
const props = defineProps({
  modoRegistro: { type: Boolean, default: false }
})
const { success, error: showError } = useToast()
const authStore = useAuthStore()

// ─── Login ────────────────────────────────
const email       = ref('')
const password    = ref('')
const codigo      = ref('')
const modoId      = ref(false)
const error       = ref('')
const emailError  = ref('')
const passwordError = ref('')
const cargando    = ref(false)
const verPassword = ref(false)

function mapearErroresCampos(errors) {
  errors.forEach(({ path, msg, message }) => {
    const texto = msg || message || ''
    if (path === 'email') emailError.value = texto
    else if (path === 'password') passwordError.value = texto
    else error.value = texto
  })
}

async function iniciarSesion() {
  error.value = ''
  emailError.value = ''
  passwordError.value = ''
  cargando.value = true
  try {
    await authStore.login(email.value.trim(), password.value)
    success(`Bienvenido, ${authStore.usuario.nombre}!`, 'Sesión iniciada')
    emit('login', authStore.usuario)
  } catch (err) {
    if (err.data?.errors?.length) {
      mapearErroresCampos(err.data.errors)
    } else {
      error.value = err.message || 'Credenciales inválidas'
    }
    showError(error.value || 'Error al iniciar sesión', 'Error de autenticación')
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

// ─── Registro ──────────────────────────────
const modoRegistro = ref(props.modoRegistro)
const regNombre   = ref('')
const regEmail    = ref('')
const regPassword = ref('')
const verPasswordReg = ref(false)

async function registrarCuenta() {
  error.value = ''
  cargando.value = true
  try {
    const response = await authAPI.register(regNombre.value.trim(), regEmail.value.trim(), regPassword.value)
    if (response.success && response.data) {
      authStore.usuario = response.data.usuario
      success(`Bienvenido, ${regNombre.value.trim()}!`, 'Cuenta creada')
      emit('login', response.data.usuario)
    }
  } catch (err) {
    error.value = err.data?.message || err.message || 'Error al crear la cuenta'
    showError(error.value, 'Error de registro')
  } finally {
    cargando.value = false
  }
}

// ─── Recuperación ─────────────────────────
const mostrarRecuperacion = ref(false)
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

/* ── toggles ── */
.login-toggles {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

.btn-modo-toggle--active {
  border-color: rgba(255,215,0,0.5) !important;
  color: #FFD700 !important;
  background: rgba(255,215,0,0.08) !important;
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
