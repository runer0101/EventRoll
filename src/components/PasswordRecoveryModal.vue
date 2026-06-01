<template>
  <div v-if="modelValue" class="modal-overlay" @click="cerrarRecuperacion">
    <div class="modal-box" @click.stop>
      <button class="modal-close" @click="cerrarRecuperacion"><X :size="20" /></button>
      <h2>Recuperar contraseña</h2>

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

      <div v-if="paso === 2" class="modal-step">
        <p>Ingresa el código de 8 dígitos que enviamos a tu correo.</p>
        <form @submit.prevent="verificarCodigo">
          <div class="field">
            <label>Código de verificación</label>
            <input v-model="codigoRec" type="text" placeholder="12345678" maxlength="8" required :disabled="cargandoRec" class="input-code" />
            <p v-if="intentosVerificacion > 0" class="intentos-hint">
              Intento {{ intentosVerificacion }} de {{ MAX_INTENTOS }}
            </p>
          </div>
          <button type="submit" class="btn-submit" :disabled="cargandoRec">
            {{ cargandoRec ? 'Verificando...' : 'Verificar código' }}
          </button>
          <button type="button" class="btn-back" @click="paso = 1"><ArrowLeft :size="14" /> Volver</button>
        </form>
      </div>

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
</template>

<script setup>
import { ref } from 'vue'
import { X, ArrowLeft } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'
import { resolveApiBaseUrl } from '../utils/apiUrl'

const { modelValue } = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const { success } = useToast()

const BACKEND_URL = resolveApiBaseUrl(import.meta.env.VITE_API_URL)

const paso = ref(1)
const emailRec = ref('')
const codigoRec = ref('')
const newPass = ref('')
const confirmPass = ref('')
const cargandoRec = ref(false)
const msgRec = ref('')
const tipoMsg = ref('success')
const intentosVerificacion = ref(0)
const MAX_INTENTOS = 5

function cerrarRecuperacion() {
  emit('update:modelValue', false)
  paso.value = 1
  emailRec.value = ''
  codigoRec.value = ''
  newPass.value = ''
  confirmPass.value = ''
  msgRec.value = ''
  intentosVerificacion.value = 0
}

async function solicitarCodigo() {
  msgRec.value = ''
  cargandoRec.value = true
  try {
    const res = await fetch(`${BACKEND_URL}/v1/password-recovery/solicitar-codigo`, {
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
    const res = await fetch(`${BACKEND_URL}/v1/password-recovery/verificar-codigo`, {
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
      intentosVerificacion.value++
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
    const res = await fetch(`${BACKEND_URL}/v1/password-recovery/restablecer-password`, {
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

.intentos-hint {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 0.25rem;
  text-align: right;
}
</style>
