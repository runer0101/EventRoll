<template>
  <!-- Hamburger Menu Button (Mobile only) -->
  <button class="hamburger-btn" :class="{ active: isMobileOpen }" @click="toggleMobile">
    <span></span>
    <span></span>
    <span></span>
  </button>

  <!-- Overlay (Mobile only) -->
  <div class="sidebar-overlay" :class="{ active: isMobileOpen }" @click="closeMobile"></div>

  <!-- Sidebar -->
  <div class="sidebar" :class="{ collapsed: isCollapsed, 'mobile-open': isMobileOpen }">

    <!-- Header -->
    <div class="sidebar-header">
      <div v-if="!isCollapsed" class="logo">
        <div class="logo-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor"/>
            <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
            <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
            <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor"/>
          </svg>
        </div>
        <span class="logo-text">EventRoll</span>
      </div>
      <div v-else class="logo-mark logo-mark-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor"/>
          <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
          <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
          <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor"/>
        </svg>
      </div>
      <button class="toggle-btn" :title="isCollapsed ? 'Expandir' : 'Colapsar'" @click="toggleSidebar">
        <ChevronLeft v-if="!isCollapsed" :size="16" />
        <ChevronRight v-else :size="16" />
      </button>
    </div>

    <!-- Navegación -->
    <nav class="sidebar-nav">
      <button
        v-for="item in menuItems"
        :key="item.id"
        :class="['nav-item', { active: activeItem === item.id, disabled: !item.enabled }]"
        :disabled="!item.enabled"
        :title="isCollapsed ? item.label : ''"
        @click="selectMenuItem(item.id)"
      >
        <component :is="item.icon" class="nav-icon" :size="17" />
        <span v-if="!isCollapsed" class="nav-text">{{ item.label }}</span>
        <span v-if="item.badge && !isCollapsed" class="nav-badge">{{ item.badge }}</span>
      </button>
    </nav>

    <!-- Footer / Usuario -->
    <div class="sidebar-footer">
      <!-- Botón de perfil -->
      <button class="user-btn" :class="{ 'user-btn-collapsed': isCollapsed }" :title="isCollapsed ? usuario.nombre : 'Editar perfil'" @click="abrirPerfil">
        <div class="user-avatar-wrap">
          <img v-if="fotoUrl" :src="fotoUrl" class="user-photo" alt="foto" />
          <span v-else class="user-initial">{{ inicial }}</span>
          <span class="edit-hint">
            <Pencil :size="10" />
          </span>
        </div>
        <div v-if="!isCollapsed" class="user-details">
          <span class="user-name">{{ nombreMostrado }}</span>
          <span class="user-role">{{ nombreRol }}</span>
        </div>
      </button>

      <!-- Cerrar sesión -->
      <button class="btn-logout" :title="isCollapsed ? 'Cerrar sesión' : ''" @click="emit('logout')">
        <LogOut :size="15" />
        <span v-if="!isCollapsed">Cerrar sesión</span>
      </button>
    </div>
  </div>

  <!-- Modal de perfil -->
  <Teleport to="body">
    <div v-if="mostrarPerfil" class="modal-overlay" @click.self="cerrarPerfil">
      <div class="modal-perfil">
        <div class="modal-header">
          <h2>Mi perfil</h2>
          <button class="modal-close" @click="cerrarPerfil"><X :size="16" /></button>
        </div>

        <!-- Foto -->
        <div class="foto-section">
          <div class="foto-preview">
            <img v-if="fotoPreview" :src="fotoPreview" alt="preview" />
            <span v-else class="foto-inicial">{{ inicial }}</span>
          </div>
          <div class="foto-actions">
            <label class="btn-upload">
              <Camera :size="14" />
              {{ fotoPreview ? 'Cambiar foto' : 'Subir foto' }}
              <input type="file" accept="image/*" hidden @change="onFotoChange" />
            </label>
            <button v-if="fotoPreview" class="btn-remove-foto" @click="quitarFoto">
              <Trash2 :size="14" /> Quitar
            </button>
          </div>
          <p class="foto-hint">JPG, PNG o WebP · máx. 2 MB</p>
        </div>

        <!-- Nombre -->
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="nombreEdit" type="text" placeholder="Tu nombre" maxlength="60" />
        </div>

        <div v-if="errorPerfil" class="perfil-error">{{ errorPerfil }}</div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="cerrarPerfil">Cancelar</button>
          <button class="btn-save" :disabled="guardando" @click="guardarPerfil">
            <span v-if="guardando">Guardando...</span>
            <span v-else>Guardar cambios</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Users, BarChart2, Settings, ShieldCheck, ClipboardList,
         ChevronLeft, ChevronRight, LogOut, Pencil, Camera, Trash2, X } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  usuario: { type: Object, required: true },
  activeItem: { type: String, default: 'invitados' },
  stats: {
    type: Object,
    default: () => ({ totalInvitados: 0, confirmados: 0, pendientes: 0 })
  }
})

const emit = defineEmits(['logout', 'select-menu', 'toggle'])
const authStore = useAuthStore()

// ── Sidebar state ──────────────────────────────
const isCollapsed  = ref(false)
const isMobileOpen = ref(false)

// ── Perfil local (localStorage) ────────────────
const FOTO_KEY   = 'er_user_foto'
const NOMBRE_KEY = 'er_user_nombre'

const fotoUrl      = ref(null)
const nombreLocal  = ref(null)

onMounted(() => {
  fotoUrl.value     = localStorage.getItem(FOTO_KEY) || null
  nombreLocal.value = localStorage.getItem(NOMBRE_KEY) || null
})

const inicial       = computed(() => (nombreMostrado.value || 'U').charAt(0).toUpperCase())
const nombreMostrado = computed(() => nombreLocal.value || props.usuario.nombre)

// ── Modal perfil ───────────────────────────────
const mostrarPerfil = ref(false)
const fotoPreview   = ref(null)
const nombreEdit    = ref('')
const guardando     = ref(false)
const errorPerfil   = ref('')

function abrirPerfil() {
  fotoPreview.value = fotoUrl.value
  nombreEdit.value  = nombreMostrado.value
  errorPerfil.value = ''
  mostrarPerfil.value = true
}

function cerrarPerfil() {
  mostrarPerfil.value = false
}

function onFotoChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    errorPerfil.value = 'La imagen no puede superar 2 MB.'
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => { fotoPreview.value = ev.target.result }
  reader.readAsDataURL(file)
  errorPerfil.value = ''
}

function quitarFoto() {
  fotoPreview.value = null
}

async function guardarPerfil() {
  errorPerfil.value = ''
  const nombre = nombreEdit.value.trim()
  if (!nombre) { errorPerfil.value = 'El nombre no puede estar vacío.'; return }

  guardando.value = true
  try {
    // Guardar en localStorage
    localStorage.setItem(NOMBRE_KEY, nombre)
    nombreLocal.value = nombre

    if (fotoPreview.value) {
      localStorage.setItem(FOTO_KEY, fotoPreview.value)
      fotoUrl.value = fotoPreview.value
    } else {
      localStorage.removeItem(FOTO_KEY)
      fotoUrl.value = null
    }
    cerrarPerfil()
  } finally {
    guardando.value = false
  }
}

// ── Menu ───────────────────────────────────────
const menuItems = computed(() => [
  {
    id: 'invitados',
    icon: Users,
    label: 'Invitados',
    enabled: true,
    badge: props.stats.totalInvitados || null
  },
  {
    id: 'estadisticas',
    icon: BarChart2,
    label: 'Estadísticas',
    enabled: true,
    badge: null
  },
  {
    id: 'configuracion',
    icon: Settings,
    label: 'Configuración',
    enabled: true,
    badge: null
  },
  {
    id: 'usuarios',
    icon: ShieldCheck,
    label: 'Usuarios',
    enabled: props.usuario.rol === 'admin',
    badge: null
  },
  {
    id: 'actividad',
    icon: ClipboardList,
    label: 'Actividad',
    enabled: props.usuario.rol === 'admin',
    badge: null
  }
])

const nombreRol = computed(() => ({
  admin: 'Administrador',
  organizador: 'Organizador',
  asistente: 'Asistente',
  visualizador: 'Solo Lectura',
  guardia: 'Guardia'
}[props.usuario.rol] || props.usuario.rol))

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
  emit('toggle', isCollapsed.value)
}

function selectMenuItem(itemId) {
  const item = menuItems.value.find(i => i.id === itemId)
  if (item?.enabled) {
    emit('select-menu', itemId)
    closeMobile()
  }
}

function toggleMobile()  { isMobileOpen.value = !isMobileOpen.value }
function closeMobile()   { isMobileOpen.value = false }
</script>

<style scoped>
/* ── HAMBURGER ─────────────────────────────── */
.hamburger-btn {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1100;
  background: #FFD700;
  border: none;
  border-radius: 8px;
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}
.hamburger-btn span {
  display: block;
  width: 55%;
  height: 2px;
  background: #111;
  border-radius: 2px;
  transition: all .2s;
}
.hamburger-btn.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.hamburger-btn.active span:nth-child(2) { opacity: 0; }
.hamburger-btn.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

/* ── OVERLAY ───────────────────────────────── */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.55);
  z-index: 900;
  opacity: 0;
  pointer-events: none;
  transition: opacity .2s;
  backdrop-filter: blur(2px);
}
.sidebar-overlay.active { opacity: 1; pointer-events: all; }

/* ── SIDEBAR ───────────────────────────────── */
.sidebar {
  width: var(--sidebar-width, 220px);
  height: 100vh;
  background: #0f0f0f;
  border-right: 1px solid rgba(255,255,255,.07);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  transition: width .2s ease;
  z-index: 800;
}
.sidebar.collapsed { width: var(--sidebar-width-collapsed, 64px); }

/* ── HEADER ────────────────────────────────── */
.sidebar-header {
  padding: 1rem .75rem;
  border-bottom: 1px solid rgba(255,255,255,.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
}
.logo {
  display: flex;
  align-items: center;
  gap: .55rem;
}
.logo-mark {
  width: 30px;
  height: 30px;
  background: #FFD700;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111;
  flex-shrink: 0;
}
.logo-mark-center {
  margin: 0 auto;
}
.logo-text {
  font-size: .95rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: .02em;
  white-space: nowrap;
}
.toggle-btn {
  background: none;
  border: 1px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.4);
  width: 26px;
  height: 26px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s;
  flex-shrink: 0;
}
.toggle-btn:hover {
  border-color: #FFD700;
  color: #FFD700;
}

/* ── NAV ───────────────────────────────────── */
.sidebar-nav {
  flex: 1;
  padding: .5rem .5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  scrollbar-width: none;
}
.sidebar-nav::-webkit-scrollbar { display: none; }

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: .55rem .75rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(255,255,255,.45);
  cursor: pointer;
  transition: all .15s;
  font-size: .875rem;
  font-weight: 500;
  text-align: left;
}
.nav-item:hover:not(.disabled) {
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.9);
}
.nav-item.active {
  background: rgba(255,215,0,.12);
  color: #FFD700;
  font-weight: 600;
}
.nav-item.disabled {
  opacity: .3;
  cursor: not-allowed;
}
.nav-icon { flex-shrink: 0; }
.nav-text  { flex: 1; }
.nav-badge {
  background: #FFD700;
  color: #111;
  font-size: .7rem;
  font-weight: 700;
  padding: .1rem .4rem;
  border-radius: 10px;
  min-width: 1.3rem;
  text-align: center;
}

/* ── FOOTER ────────────────────────────────── */
.sidebar-footer {
  padding: .6rem .5rem;
  border-top: 1px solid rgba(255,255,255,.06);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Botón de usuario/perfil */
.user-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: .6rem;
  padding: .5rem .6rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background .15s;
  text-align: left;
}
.user-btn:hover { background: rgba(255,255,255,.06); }
.user-btn-collapsed { justify-content: center; }

.user-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.user-photo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}
.user-initial {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #FFD700;
  color: #111;
  font-size: .85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.edit-hint {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 14px;
  height: 14px;
  background: #333;
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,.6);
  opacity: 0;
  transition: opacity .15s;
}
.user-btn:hover .edit-hint { opacity: 1; }

.user-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.user-name {
  font-size: .82rem;
  font-weight: 600;
  color: rgba(255,255,255,.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-role {
  font-size: .72rem;
  color: rgba(255,255,255,.35);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Cerrar sesión */
.btn-logout {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  padding: .5rem;
  background: transparent;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 8px;
  color: rgba(255,255,255,.35);
  cursor: pointer;
  font-size: .8rem;
  font-weight: 500;
  transition: all .15s;
}
.btn-logout:hover {
  border-color: rgba(239,68,68,.4);
  color: #f87171;
  background: rgba(239,68,68,.06);
}

/* ── COLLAPSED STATE ───────────────────────── */
.sidebar.collapsed .sidebar-header {
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: .75rem .25rem;
}
.sidebar.collapsed .sidebar-nav { padding: .5rem .375rem; }
.sidebar.collapsed .nav-item { justify-content: center; padding: .6rem 0; }
.sidebar.collapsed .sidebar-footer { padding: .15rem .2rem; gap: 0; }
.sidebar.collapsed .user-btn { padding: .25rem 0; }
.sidebar.collapsed .btn-logout { padding: .25rem 0; border: none; }

/* ── MODAL PERFIL ──────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.7);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.modal-perfil {
  background: #141414;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 14px;
  width: 100%;
  max-width: 400px;
  padding: 1.5rem;
  box-shadow: 0 24px 60px rgba(0,0,0,.6);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.modal-header h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}
.modal-close {
  background: rgba(255,255,255,.06);
  border: none;
  border-radius: 6px;
  color: rgba(255,255,255,.5);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .15s;
}
.modal-close:hover { background: rgba(255,255,255,.12); color: #fff; }

/* Foto */
.foto-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .75rem;
  margin-bottom: 1.25rem;
}
.foto-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #FFD700;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255,215,0,.3);
}
.foto-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.foto-inicial {
  font-size: 2rem;
  font-weight: 800;
  color: #111;
}
.foto-actions {
  display: flex;
  gap: .5rem;
}
.btn-upload {
  display: flex;
  align-items: center;
  gap: .4rem;
  padding: .45rem .85rem;
  background: rgba(255,215,0,.1);
  border: 1px solid rgba(255,215,0,.3);
  border-radius: 7px;
  color: #FFD700;
  font-size: .8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
}
.btn-upload:hover { background: rgba(255,215,0,.18); }
.btn-remove-foto {
  display: flex;
  align-items: center;
  gap: .4rem;
  padding: .45rem .85rem;
  background: rgba(239,68,68,.08);
  border: 1px solid rgba(239,68,68,.25);
  border-radius: 7px;
  color: #f87171;
  font-size: .8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
}
.btn-remove-foto:hover { background: rgba(239,68,68,.15); }
.foto-hint {
  font-size: .72rem;
  color: rgba(255,255,255,.25);
  margin: 0;
}

/* Form */
.form-group {
  display: flex;
  flex-direction: column;
  gap: .4rem;
  margin-bottom: 1rem;
}
.form-group label {
  font-size: .8rem;
  font-weight: 600;
  color: rgba(255,255,255,.5);
}
.form-group input {
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 8px;
  padding: .65rem .85rem;
  font-size: .9rem;
  color: #fff;
  font-family: inherit;
  transition: border-color .15s;
  width: 100%;
  box-sizing: border-box;
}
.form-group input:focus {
  outline: none;
  border-color: rgba(255,215,0,.5);
}

.perfil-error {
  background: rgba(239,68,68,.08);
  border: 1px solid rgba(239,68,68,.2);
  color: #fca5a5;
  border-radius: 7px;
  padding: .5rem .75rem;
  font-size: .82rem;
  margin-bottom: .75rem;
}

/* Acciones modal */
.modal-actions {
  display: flex;
  gap: .5rem;
  justify-content: flex-end;
}
.btn-cancel {
  padding: .55rem 1.1rem;
  background: transparent;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 8px;
  color: rgba(255,255,255,.5);
  font-size: .85rem;
  cursor: pointer;
  transition: all .15s;
}
.btn-cancel:hover { border-color: rgba(255,255,255,.2); color: rgba(255,255,255,.8); }
.btn-save {
  padding: .55rem 1.25rem;
  background: #FFD700;
  border: none;
  border-radius: 8px;
  color: #111;
  font-size: .85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
}
.btn-save:hover:not(:disabled) { background: #f0c800; }
.btn-save:disabled { opacity: .5; cursor: not-allowed; }

/* ── MOBILE ────────────────────────────────── */
@media (max-width: 768px) {
  .hamburger-btn { display: flex; }
  .sidebar-overlay { display: block; }
  .sidebar {
    transform: translateX(-100%);
    width: min(80vw, 18rem);
    z-index: 1000;
  }
  .sidebar.mobile-open { transform: translateX(0); }
  .sidebar.collapsed { width: min(80vw, 18rem); }
  .toggle-btn { display: none; }
}
</style>
