<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Atajos de Teclado</h2>
          <button class="btn-close" @click="close">×</button>
        </div>

        <div class="modal-body">
          <div class="shortcuts-section">
            <h3>Búsqueda y Navegación</h3>
            <div class="shortcut-item">
              <kbd>Ctrl + F</kbd>
              <span>Enfocar búsqueda</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl + K</kbd>
              <span>Alternar vista de filtros guardados</span>
            </div>
            <div class="shortcut-item">
              <kbd>Esc</kbd>
              <span>Cerrar paneles/limpiar búsqueda</span>
            </div>
          </div>

          <div class="shortcuts-section">
            <h3>Exportación e Importación</h3>
            <div class="shortcut-item">
              <kbd>Ctrl + E</kbd>
              <span>Exportar a Excel</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl + Shift + E</kbd>
              <span>Exportar a CSV</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl + I</kbd>
              <span>Abrir importador de Excel</span>
            </div>
          </div>

          <div class="shortcuts-section">
            <h3>Gestión de Invitados</h3>
            <div class="shortcut-item">
              <kbd>Ctrl + N</kbd>
              <span>Nuevo invitado (enfocar nombre)</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl + S</kbd>
              <span>Guardar cambios</span>
            </div>
          </div>

          <div class="shortcuts-section">
            <h3>General</h3>
            <div class="shortcut-item">
              <kbd>Ctrl + /</kbd>
              <span>Mostrar esta ayuda</span>
            </div>
            <div class="shortcut-item">
              <kbd>Alt + 1-5</kbd>
              <span>Navegar entre vistas del sidebar</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-primary" @click="close">Entendido</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)

function show() {
  visible.value = true
}

function close() {
  visible.value = false
}

defineExpose({
  show,
  close
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: #141414;
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 14px;
  max-width: 680px;
  width: 100%;
  max-height: 88vh;
  max-height: 88dvh;
  overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.04);
}

/* Scrollbar for dark modal */
.modal-content::-webkit-scrollbar { width: 6px; }
.modal-content::-webkit-scrollbar-track { background: transparent; }
.modal-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 28px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.15);
}

.modal-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.btn-close {
  background: rgba(255,255,255,0.06);
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: rgba(255,255,255,0.4);
  transition: all 0.15s;
  padding: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-close:hover {
  background: rgba(239,68,68,0.15);
  color: #f87171;
}

.modal-body {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.shortcuts-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shortcuts-section h3 {
  color: rgba(255,255,255,0.4);
  margin: 0 0 10px 0;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  transition: all 0.15s;
  gap: 16px;
}

.shortcut-item:hover {
  background: rgba(255,215,0,0.05);
  border-color: rgba(255,215,0,0.15);
  transform: translateX(3px);
}

.shortcut-item kbd {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.12);
  border-bottom: 2px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 5px 10px;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 0.78rem;
  color: #FFD700;
  min-width: 130px;
  text-align: center;
  flex-shrink: 0;
  letter-spacing: 0.03em;
}

.shortcut-item span {
  flex: 1;
  color: rgba(255,255,255,0.65);
  font-size: 0.875rem;
  line-height: 1.4;
}

.modal-footer {
  padding: 18px 28px;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: #FFD700;
  border: none;
  padding: 10px 28px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  color: #111;
}

.btn-primary:hover {
  background: #f0c800;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(255, 215, 0, 0.3);
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content {
  transform: scale(0.95) translateY(-12px);
  opacity: 0;
}

.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-content { max-width: 100%; }

  .modal-header,
  .modal-body,
  .modal-footer { padding-left: 18px; padding-right: 18px; }

  .modal-header h2 { font-size: 1.1rem; }

  .shortcut-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .shortcut-item kbd { min-width: auto; }
  .shortcut-item span { margin-left: 0; }
}
</style>
