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
    <!-- Header del Sidebar -->
    <div class="sidebar-header">
      <div v-if="!isCollapsed" class="logo">
        <span class="logo-icon">E</span>
        <span class="logo-text">EventRoll</span>
      </div>
      <span v-else class="logo-icon-small">E</span>
      <button class="toggle-btn" :title="isCollapsed ? 'Expandir' : 'Colapsar'" @click="toggleSidebar">
        <span v-if="isCollapsed">›</span>
        <span v-else>‹</span>
      </button>
    </div>

    <!-- Navegación -->
    <nav class="sidebar-nav">
      <button
        v-for="item in menuItems"
        :key="item.id"
        :class="['nav-item', { active: activeItem === item.id, disabled: !item.enabled }]"
        :disabled="!item.enabled"
        :title="item.tooltip"
        @click="selectMenuItem(item.id)"
      >
        <component :is="item.icon" class="nav-icon" :size="18" />
        <span class="nav-text">{{ item.label }}</span>
        <span v-if="item.badge && !isCollapsed" class="nav-badge">{{ item.badge }}</span>
      </button>
    </nav>

    <!-- Usuario Info (abajo) -->
    <div class="sidebar-footer">
      <div v-if="!isCollapsed" class="user-info">
        <div class="user-avatar">
          {{ usuario.nombre.charAt(0).toUpperCase() }}
        </div>
        <div class="user-details">
          <div class="user-name">{{ usuario.nombre }}</div>
          <div class="user-role">{{ nombreRol }}</div>
        </div>
      </div>
      <div v-else class="user-avatar-small">
        {{ usuario.nombre.charAt(0).toUpperCase() }}
      </div>

      <button class="btn-logout-sidebar" :title="isCollapsed ? 'Cerrar sesión' : ''" @click="emit('logout')">
        <span>Cerrar Sesión</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Users, BarChart2, Settings, ShieldCheck, ClipboardList } from 'lucide-vue-next'

const props = defineProps({
  usuario: {
    type: Object,
    required: true
  },
  activeItem: {
    type: String,
    default: 'invitados'
  },
  stats: {
    type: Object,
    default: () => ({
      totalInvitados: 0,
      confirmados: 0,
      pendientes: 0
    })
  }
})

const emit = defineEmits(['logout', 'select-menu', 'toggle'])

const isCollapsed = ref(false)
const isMobileOpen = ref(false)

const menuItems = computed(() => [
  {
    id: 'invitados',
    icon: Users,
    label: 'Invitados',
    tooltip: 'Gestión de invitados',
    enabled: true,
    badge: props.stats.totalInvitados || null
  },
  {
    id: 'estadisticas',
    icon: BarChart2,
    label: 'Estadísticas',
    tooltip: 'Ver estadísticas',
    enabled: true,
    badge: null
  },
  {
    id: 'configuracion',
    icon: Settings,
    label: 'Configuración',
    tooltip: 'Configuración del sistema',
    enabled: true,
    badge: null
  },
  {
    id: 'usuarios',
    icon: ShieldCheck,
    label: 'Usuarios',
    tooltip: 'Gestión de usuarios (solo admin)',
    enabled: props.usuario.rol === 'admin',
    badge: null
  },
  {
    id: 'actividad',
    icon: ClipboardList,
    label: 'Actividad',
    tooltip: 'Registro de actividad',
    enabled: props.usuario.rol === 'admin',
    badge: null
  }
])

const nombreRol = computed(() => {
  const roles = {
    admin: 'Administrador',
    organizador: 'Organizador',
    asistente: 'Asistente',
    visualizador: 'Solo Lectura',
    guardia: 'Guardia'
  }
  return roles[props.usuario.rol] || props.usuario.rol
})

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
  emit('toggle', isCollapsed.value)
}

function selectMenuItem(itemId) {
  const item = menuItems.value.find(i => i.id === itemId)
  if (item && item.enabled) {
    emit('select-menu', itemId)
    closeMobile() // Cerrar móvil al seleccionar
  }
}

function toggleMobile() {
  isMobileOpen.value = !isMobileOpen.value
}

function closeMobile() {
  isMobileOpen.value = false
}
</script>

<style scoped>
/* ===== HAMBURGER MENU BUTTON (MOBILE) ===== */
.hamburger-btn {
  display: none;
  position: fixed;
  top: var(--spacing-md);
  left: var(--spacing-md);
  z-index: var(--z-modal);
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-md);
  width: clamp(2.5rem, 10vw, 3rem);
  height: clamp(2.5rem, 10vw, 3rem);
  cursor: pointer;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.375rem;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal);
}

.hamburger-btn span {
  display: block;
  width: 60%;
  height: 0.1875rem;
  background: var(--color-dark);
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
}

.hamburger-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(0.375rem, 0.375rem);
}

.hamburger-btn.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(0.375rem, -0.375rem);
}

.hamburger-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

/* ===== OVERLAY (MOBILE) ===== */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: var(--z-overlay);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-normal);
  backdrop-filter: blur(0.25rem);
}

.sidebar-overlay.active {
  opacity: 1;
  pointer-events: all;
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--color-dark);
  border-right: 0.1875rem solid var(--color-primary);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  transition: all var(--transition-normal);
  z-index: var(--z-sticky);
  box-shadow: var(--shadow-xl);
}

.sidebar.collapsed {
  width: var(--sidebar-width-collapsed);
}

/* ===== HEADER ===== */
.sidebar-header {
  padding: clamp(1rem, 3vw, 1.5rem) clamp(0.75rem, 2vw, 1.25rem);
  border-bottom: 0.125rem solid rgba(255, 215, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.sidebar:not(.collapsed) .sidebar-header {
  flex-direction: row;
  gap: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  animation: fadeIn var(--transition-normal);
}

.logo-icon {
  width: clamp(2.25rem, 5vw, 2.625rem);
  height: clamp(2.25rem, 5vw, 2.625rem);
  background: var(--color-primary);
  color: var(--color-dark);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: var(--font-weight-bold);
  box-shadow: 0 0.25rem 1rem rgba(255, 215, 0, 0.6);
  border: 0.125rem solid rgba(255, 215, 0, 0.3);
}

.logo-icon-small {
  width: clamp(2.25rem, 5vw, 2.625rem);
  height: clamp(2.25rem, 5vw, 2.625rem);
  background: var(--color-primary);
  color: var(--color-dark);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: var(--font-weight-bold);
  box-shadow: 0 0.25rem 1rem rgba(255, 215, 0, 0.6);
  border: 0.125rem solid rgba(255, 215, 0, 0.3);
  animation: fadeIn var(--transition-normal);
  margin: 0 auto;
}

.logo-text {
  font-size: clamp(1.25rem, 3.5vw, 1.75rem);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  letter-spacing: 0.1875em;
  text-shadow: 0 0 1.25rem rgba(255, 215, 0, 0.6);
}

.toggle-btn {
  background: rgba(255, 215, 0, 0.1);
  border: 0.125rem solid var(--color-primary);
  color: var(--color-primary);
  width: clamp(2rem, 4vw, 2.25rem);
  height: clamp(2rem, 4vw, 2.25rem);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-normal);
  line-height: 1;
}

.toggle-btn:hover {
  background: var(--color-primary);
  color: var(--color-dark);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

/* ===== NAVEGACIÓN ===== */
.sidebar-nav {
  flex: 1;
  padding: clamp(0.75rem, 2vw, 1.25rem);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary) var(--color-dark-secondary);
}

.sidebar-nav::-webkit-scrollbar {
  width: 0.375rem;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: var(--color-dark-secondary);
  border-radius: var(--radius-sm);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: var(--radius-sm);
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 2.5vw, 1.25rem);
  margin-bottom: var(--spacing-xs);
  background: rgba(255, 255, 255, 0.05);
  border: 0.125rem solid transparent;
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: clamp(0.875rem, 1.5vw, 0.9375rem);
  font-weight: var(--font-weight-semibold);
  position: relative;
  overflow: hidden;
}

.nav-item:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.5);
  color: var(--color-primary);
  transform: translateX(0.3125rem);
}

.nav-item.active {
  background: rgba(255, 215, 0, 0.2);
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: 0 0.25rem 1rem rgba(255, 215, 0, 0.3);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0.25rem;
  height: 60%;
  background: var(--color-primary);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.nav-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-item.disabled:hover {
  transform: none;
  border-color: transparent;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-secondary);
}

.nav-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  flex: 1;
  text-align: left;
  letter-spacing: 0.03125em;
}

.nav-badge {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-warning) 100%);
  color: var(--color-dark);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  min-width: 1.5rem;
  text-align: center;
  box-shadow: var(--shadow-md);
}

/* ===== FOOTER ===== */
.sidebar-footer {
  padding: clamp(0.75rem, 2vw, 1.25rem);
  border-top: 0.125rem solid rgba(255, 215, 0, 0.3);
  background: rgba(0, 0, 0, 0.3);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: rgba(255, 215, 0, 0.05);
  border-radius: var(--radius-lg);
  animation: fadeIn var(--transition-normal);
}

.user-avatar {
  width: clamp(2.5rem, 5vw, 2.8125rem);
  height: clamp(2.5rem, 5vw, 2.8125rem);
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
}

.user-avatar-small {
  width: clamp(2.5rem, 5vw, 2.8125rem);
  height: clamp(2.5rem, 5vw, 2.8125rem);
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: var(--font-weight-bold);
  margin: 0 auto var(--spacing-sm);
  box-shadow: var(--shadow-md);
  animation: fadeIn var(--transition-normal);
}

.user-details {
  flex: 1;
  overflow: hidden;
}

.user-name {
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  margin-bottom: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-logout-sidebar {
  width: 100%;
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.05);
  border: 0.125rem solid rgba(255, 215, 0, 0.5);
  border-radius: var(--radius-lg);
  color: var(--color-primary);
  cursor: pointer;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.btn-logout-sidebar:hover {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-warning) 100%);
  color: var(--color-dark);
  border-color: transparent;
  transform: translateY(-0.125rem);
  box-shadow: var(--shadow-lg);
}

/* ===== ANIMACIONES ===== */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ===== ESTADO COLAPSADO ===== */
.sidebar.collapsed .sidebar-header {
  padding: clamp(0.75rem, 2vw, 1rem) clamp(0.5rem, 1vw, 0.625rem);
}

.sidebar.collapsed .sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: clamp(0.5rem, 1vw, 0.75rem) 0.375rem;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 0.75rem 0;
}

.sidebar.collapsed .nav-text {
  display: none;
}

.sidebar.collapsed .nav-badge {
  display: none;
}

.sidebar.collapsed .sidebar-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0.375rem;
}

.sidebar.collapsed .btn-logout-sidebar {
  padding: 0.6rem;
  font-size: 0.65rem;
  letter-spacing: 0;
}

/* ===== RESPONSIVE BREAKPOINTS ===== */

/* Mobile (< 768px) */
@media (max-width: 768px) {
  .hamburger-btn {
    display: flex;
  }

  .sidebar-overlay {
    display: block;
  }

  .sidebar {
    transform: translateX(-100%);
    width: min(80vw, 20rem);
    z-index: var(--z-modal);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar.collapsed {
    width: min(80vw, 20rem);
  }

  .toggle-btn {
    display: none;
  }
}

/* Tablet (769px - 979px) */
@media (min-width: 769px) and (max-width: 979px) {
  .sidebar {
    width: clamp(12rem, 18vw, 15rem);
  }

  .sidebar.collapsed {
    width: 4rem;
  }
}

/* Desktop (980px+) */
@media (min-width: 980px) {
  .sidebar {
    width: var(--sidebar-width);
  }
}
</style>
