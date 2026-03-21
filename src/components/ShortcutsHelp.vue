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
            <h3>Busqueda y Navegacion</h3>
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
            <h3>Exportacion e Importacion</h3>
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
            <h3>Gestion de Invitados</h3>
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 3px solid #FFD700;
}

.modal-header h2 {
  margin: 0;
  color: #1a1a1a;
  font-size: 1.8em;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2.5em;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
  padding: 0;
  width: 40px;
  height: 40px;
  line-height: 1;
}

.btn-close:hover {
  color: #f44336;
}

.modal-body {
  padding: 30px;
}

.shortcuts-section {
  margin-bottom: 30px;
}

.shortcuts-section:last-child {
  margin-bottom: 0;
}

.shortcuts-section h3 {
  color: #1a1a1a;
  margin: 0 0 15px 0;
  font-size: 1.2em;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border-radius: 8px;
  transition: all 0.2s;
}

.shortcut-item:hover {
  background: #f0f0f0;
  transform: translateX(5px);
}

.shortcut-item kbd {
  background: linear-gradient(180deg, #fff, #f0f0f0);
  border: 2px solid #ddd;
  border-radius: 6px;
  padding: 6px 12px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 0.9em;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  text-align: center;
}

.shortcut-item span {
  flex: 1;
  margin-left: 20px;
  color: #666;
  font-size: 0.95em;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 2px solid #f0f0f0;
  display: flex;
  justify-content: center;
}

.btn-primary {
  background: #FFD700;
  border: none;
  padding: 12px 40px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.05em;
  cursor: pointer;
  transition: all 0.3s;
  color: #1a1a1a;
}

.btn-primary:hover {
  background: #FFA500;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

/* Animaciones del modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content {
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    max-width: 95%;
    margin: 10px;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-header h2 {
    font-size: 1.4em;
  }

  .modal-body {
    padding: 20px;
  }

  .shortcut-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .shortcut-item kbd {
    min-width: auto;
  }

  .shortcut-item span {
    margin-left: 0;
  }
}
</style>
