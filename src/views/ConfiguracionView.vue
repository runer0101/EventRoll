<script setup>
import { ref, computed, inject, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useEventoStore } from '../stores/evento'
import { RegistrarActividadKey } from '../composables/injection-keys'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const authStore = useAuthStore()
const eventoStore = useEventoStore()
const registrarActividad = inject(RegistrarActividadKey)

const eventoIdInput = ref(eventoStore.eventoId)
const eventoConfigError = ref('')
const eventoConfigSuccess = ref('')

const eventoIdActual = computed(() => eventoStore.eventoId)

const puedeEditarEvento = computed(() => {
  const rol = authStore.usuario?.rol
  return rol === 'admin' || rol === 'organizador'
})

watch(() => eventoStore.eventoId, (v) => { eventoIdInput.value = v })

function aplicarEventoActivo() {
  eventoConfigError.value = ''
  eventoConfigSuccess.value = ''

  if (!puedeEditarEvento.value) {
    eventoConfigError.value = 'No tienes permisos para cambiar el evento activo.'
    return
  }

  const str = String(eventoIdInput.value ?? '').trim()
  if (!UUID_RE.test(str)) {
    eventoConfigError.value = 'Ingresa un UUID de evento válido (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).'
    return
  }

  if (str === eventoStore.eventoId) {
    eventoConfigSuccess.value = 'Ese evento ya está activo.'
    return
  }

  eventoStore.setEventoId(str)
  registrarActividad?.(`Cambió el evento activo a ID ${str}`)
  eventoConfigSuccess.value = `Evento activo actualizado a ID ${str}.`
}
</script>

<template>
  <div class="vista-configuracion">
    <div class="section-header">
      <h2>Configuración</h2>
    </div>

    <div class="config-card">
      <h3>Evento Activo</h3>
      <p class="config-description">
        Este ID se usa para cargar, crear e importar invitados en el contexto actual.
      </p>

      <div class="evento-actual">
        <span class="evento-label">ID actual:</span>
        <span class="evento-badge">{{ eventoIdActual }}</span>
      </div>

      <form class="evento-form" @submit.prevent="aplicarEventoActivo">
        <label for="evento-id-input">Cambiar ID de evento</label>
        <div class="evento-form-row">
          <input
            id="evento-id-input"
            v-model="eventoIdInput"
            type="text"
            :disabled="!puedeEditarEvento"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            aria-label="UUID del evento activo"
          />
          <button type="submit" :disabled="!puedeEditarEvento" aria-label="Aplicar nuevo evento">
            Aplicar
          </button>
        </div>
      </form>

      <p v-if="eventoConfigError" class="config-msg error" role="alert">{{ eventoConfigError }}</p>
      <p v-if="eventoConfigSuccess" class="config-msg success" role="status">{{ eventoConfigSuccess }}</p>

      <p v-if="!puedeEditarEvento" class="config-help">
        Solo roles "admin" y "organizador" pueden cambiar el evento activo.
      </p>
    </div>
  </div>
</template>

<style scoped>
.vista-configuracion { margin-bottom: var(--spacing-lg); }

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.section-header h2 {
  margin: 0;
  font-family: 'Sora', var(--font-display);
  font-size: clamp(1.35rem, 3vw, 1.75rem);
  font-weight: 800;
  letter-spacing: -0.01em;
  background: var(--gradient-gold-text);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.config-card {
  max-width: 600px;
  padding: 1.75rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.config-card h3 {
  margin: 0 0 0.35rem;
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 700;
}

.config-description {
  margin: 0 0 1.25rem;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.6;
}

.evento-actual {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.15);
  border-radius: var(--radius-lg);
}

.evento-label { font-weight: 600; color: var(--color-text-secondary); font-size: 0.875rem; }

.evento-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.6rem;
  border-radius: var(--radius-full);
  background: #FFD700;
  color: #111;
  font-weight: 800;
  font-size: 0.95rem;
}

.evento-form label {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
}

.evento-form-row { display: flex; gap: 0.65rem; }

.evento-form-row input {
  flex: 1;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  font-size: 0.97rem;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.evento-form-row input:focus {
  outline: none;
  border-color: #FFD700;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
}

.evento-form-row input:disabled { opacity: 0.4; cursor: not-allowed; }

.evento-form-row button {
  border: 0;
  border-radius: var(--radius-md);
  padding: 0.7rem 1.25rem;
  background: var(--gradient-gold);
  color: #111;
  font-weight: 800;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.2);
}

.evento-form-row button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--glow-gold); }
.evento-form-row button:active:not(:disabled) { transform: scale(0.97) translateY(0); }
.evento-form-row button:disabled { opacity: 0.4; cursor: not-allowed; }

.config-msg {
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
}

.config-msg.error { background: rgba(239, 68, 68, 0.1); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.2); }
.config-msg.success { background: rgba(16, 185, 129, 0.1); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.2); }
.config-help { margin-top: 0.75rem; color: var(--color-text-muted); font-size: 0.82rem; }

@media (max-width: 480px) {
  .evento-form-row { flex-direction: column; }
}
</style>
