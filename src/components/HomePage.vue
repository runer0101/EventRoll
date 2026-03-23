<template>
  <div class="home">

    <!-- ══════════════ GRADIENT TOP LINE ══════════════ -->
    <div class="top-gradient-line"></div>

    <!-- ══════════════ NAVBAR ══════════════ -->
    <header class="navbar">
      <div class="nav-inner">
        <a class="nav-brand" href="#">
          <span class="brand-name">EventRoll</span>
        </a>

        <nav class="nav-links">
          <a href="#features">Funciones</a>
          <a href="#como-funciona">Cómo funciona</a>
        </nav>

        <div class="nav-actions">
          <button class="btn-ghost" @click="$emit('go-login')">Iniciar sesión</button>
          <button class="btn-primary-sm" @click="$emit('go-login')">
            Acceder al panel <span>→</span>
          </button>
        </div>
      </div>
    </header>

    <!-- ══════════════ HERO ══════════════ -->
    <section id="inicio" class="hero">
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>

      <div class="hero-inner">

        <!-- Left: text content -->
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-pulse"></span>
            Plataforma profesional de gestión de eventos
          </div>

          <h1 class="hero-title">
            Organiza cada invitado,<br>
            <span class="hero-accent">controla cada evento</span>
          </h1>

          <p class="hero-desc">
            Panel completo para gestionar listas de invitados, confirmar asistencia en
            tiempo real y coordinar equipos con roles y permisos específicos.
          </p>

          <div class="hero-cta">
            <button class="btn-hero" @click="$emit('go-login')">
              Acceder al panel
              <span class="btn-arrow">→</span>
            </button>
            <a class="btn-hero-ghost" href="#features">Ver funciones</a>
          </div>

          <div class="hero-proof">
            <div class="proof-pill">
              <Users class="proof-icon" :size="14" />
              Gestión de invitados
            </div>
            <div class="proof-pill">
              <Zap class="proof-icon" :size="14" />
              Tiempo real
            </div>
            <div class="proof-pill">
              <FileSpreadsheet class="proof-icon" :size="14" />
              Importación Excel
            </div>
            <div class="proof-pill">
              <Shield class="proof-icon" :size="14" />
              5 niveles de acceso
            </div>
          </div>
        </div>

        <!-- Right: fake dashboard mockup -->
        <div class="hero-mockup">
          <div class="mock-window">
            <!-- Window chrome -->
            <div class="mock-chrome">
              <div class="mock-dots">
                <span class="mock-dot mock-dot-red"></span>
                <span class="mock-dot mock-dot-yellow"></span>
                <span class="mock-dot mock-dot-green"></span>
              </div>
              <span class="mock-title">EventRoll — Panel de evento</span>
            </div>

            <!-- Stat cards -->
            <div class="mock-stats">
              <div class="mock-stat">
                <span class="mock-stat-num">248</span>
                <span class="mock-stat-label">Invitados</span>
              </div>
              <div class="mock-stat mock-stat-accent">
                <span class="mock-stat-num">186</span>
                <span class="mock-stat-label">Confirmados</span>
              </div>
              <div class="mock-stat">
                <span class="mock-stat-num">75%</span>
                <span class="mock-stat-label">Asistencia</span>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="mock-progress-wrap">
              <div class="mock-progress-header">
                <span class="mock-progress-label">Progreso de confirmación</span>
                <span class="mock-progress-pct">75%</span>
              </div>
              <div class="mock-progress-track">
                <div class="mock-progress-fill"></div>
              </div>
            </div>

            <!-- Fake table rows -->
            <div class="mock-table">
              <div class="mock-row">
                <span class="mock-avatar mock-avatar-gold"></span>
                <div class="mock-row-lines">
                  <span class="mock-line mock-line-long"></span>
                  <span class="mock-line mock-line-short"></span>
                </div>
                <span class="mock-check mock-check-yes">✓</span>
              </div>
              <div class="mock-row">
                <span class="mock-avatar mock-avatar-blue"></span>
                <div class="mock-row-lines">
                  <span class="mock-line mock-line-med"></span>
                  <span class="mock-line mock-line-short"></span>
                </div>
                <span class="mock-check mock-check-yes">✓</span>
              </div>
              <div class="mock-row">
                <span class="mock-avatar mock-avatar-purple"></span>
                <div class="mock-row-lines">
                  <span class="mock-line mock-line-long"></span>
                  <span class="mock-line mock-line-med"></span>
                </div>
                <span class="mock-check mock-check-pending">–</span>
              </div>
              <div class="mock-row">
                <span class="mock-avatar mock-avatar-teal"></span>
                <div class="mock-row-lines">
                  <span class="mock-line mock-line-med"></span>
                  <span class="mock-line mock-line-short"></span>
                </div>
                <span class="mock-check mock-check-yes">✓</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ══════════════ STATS STRIP ══════════════ -->
    <div class="stats-strip">
      <div class="stats-strip-inner">
        <div class="strip-stat">
          <span class="strip-num">248+</span>
          <span class="strip-label">eventos gestionados</span>
        </div>
        <span class="strip-sep">·</span>
        <div class="strip-stat">
          <span class="strip-num">10,000+</span>
          <span class="strip-label">invitados</span>
        </div>
        <span class="strip-sep">·</span>
        <div class="strip-stat">
          <span class="strip-num">99.9%</span>
          <span class="strip-label">uptime</span>
        </div>
        <span class="strip-sep">·</span>
        <div class="strip-stat">
          <span class="strip-num">5</span>
          <span class="strip-label">roles de acceso</span>
        </div>
      </div>
    </div>

    <!-- ══════════════ FEATURES ══════════════ -->
    <section id="features" class="features">
      <div class="section-inner">
        <p class="eyebrow">Funcionalidades</p>
        <h2 class="section-title">Todo lo que necesitas en un solo panel</h2>
        <p class="section-sub">
          Diseñado para equipos de organización que necesitan control total sobre sus eventos.
        </p>

        <div class="features-grid">
          <div class="feat-card feat-highlight">
            <div class="feat-icon-wrap feat-color-gold"><Users :size="20" /></div>
            <h3>Gestión de Invitados</h3>
            <p>Crea, edita y elimina invitados con filtros avanzados por categoría, nombre y estado de confirmación.</p>
          </div>
          <div class="feat-card">
            <div class="feat-icon-wrap feat-color-emerald"><CheckCircle :size="20" /></div>
            <h3>Control de Asistencia</h3>
            <p>Confirma la presencia de invitados en tiempo real desde cualquier dispositivo.</p>
          </div>
          <div class="feat-card">
            <div class="feat-icon-wrap feat-color-blue"><FileSpreadsheet :size="20" /></div>
            <h3>Importación Excel</h3>
            <p>Carga listas masivas desde archivos .xlsx con validación automática de datos.</p>
          </div>
          <div class="feat-card">
            <div class="feat-icon-wrap feat-color-purple"><Shield :size="20" /></div>
            <h3>Roles y Permisos</h3>
            <p>Asigna roles específicos: Admin, Organizador, Asistente, Guardia o Solo lectura.</p>
          </div>
          <div class="feat-card">
            <div class="feat-icon-wrap feat-color-orange"><Settings :size="20" /></div>
            <h3>Múltiples Eventos</h3>
            <p>Gestiona distintos eventos desde la misma plataforma con contextos completamente independientes.</p>
          </div>
          <div class="feat-card">
            <div class="feat-icon-wrap feat-color-teal"><TrendingUp :size="20" /></div>
            <h3>Estadísticas en Vivo</h3>
            <p>Visualiza el progreso de confirmación y métricas clave de tu evento al instante.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════ COMO FUNCIONA ══════════════ -->
    <section id="como-funciona" class="how-it-works">
      <div class="section-inner">
        <p class="eyebrow">Proceso</p>
        <h2 class="section-title">Listo en minutos</h2>

        <div class="steps">
          <div class="step">
            <div class="step-num">01</div>
            <h3>Accede al panel</h3>
            <p>Ingresa con tus credenciales y selecciona el evento activo que quieres gestionar.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">02</div>
            <h3>Carga tu lista</h3>
            <p>Importa tu lista de invitados desde Excel o agrégalos manualmente uno por uno.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">03</div>
            <h3>Gestiona en vivo</h3>
            <p>Durante el evento, confirma asistencia en tiempo real con tu equipo coordinado.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════ CTA FINAL ══════════════ -->
    <section class="cta-section">
      <div class="cta-glow"></div>
      <div class="cta-inner">
        <h2>¿Listo para tu próximo evento?</h2>
        <p>Accede al panel y empieza a organizar tus invitados ahora mismo.</p>
        <button class="btn-hero" @click="$emit('go-login')">
          Acceder al Panel →
        </button>
      </div>
    </section>

    <!-- ══════════════ FOOTER ══════════════ -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="brand-name">EventRoll</span>
        </div>
        <p class="footer-copy">© {{ year }} EventRoll · Sistema de gestión de eventos</p>
        <button class="footer-login" @click="$emit('go-login')">Acceder →</button>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { Users, Zap, FileSpreadsheet, Shield, CheckCircle, Settings, TrendingUp } from 'lucide-vue-next'
defineEmits(['go-login'])
const year = new Date().getFullYear()
</script>

<style scoped>
/* ════════════════════════════════════════════
   BASE — fondo muy oscuro, texto blanco limpio
════════════════════════════════════════════ */
.home {
  min-height: 100vh;
  min-height: 100dvh;
  background: #070707;
  color: #e8e8e8;
  font-family: 'Manrope', 'Segoe UI', sans-serif;
  overflow-x: hidden;
}

/* Top gradient brand line */
.top-gradient-line {
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, #FFD700 30%, #f0c800 60%, transparent 100%);
  opacity: 0.7;
}

/* ════════════════════════════════════════════
   NAVBAR — sin tinte dorado, completamente neutro
════════════════════════════════════════════ */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(7, 7, 7, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 4vw, 2rem);
  height: 60px;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-name {
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
  color: #ffffff;
  letter-spacing: 0.01em;
}

.nav-links {
  flex: 1;
  display: flex;
  gap: 0.15rem;
}

.nav-links a {
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  transition: color 0.15s;
}

.nav-links a:hover {
  color: rgba(255, 255, 255, 0.9);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-ghost {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  padding: 0.5rem 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.15s;
}

.btn-ghost:hover {
  color: rgba(255, 255, 255, 0.9);
}

/* Solo el botón CTA lleva el color de marca */
.btn-primary-sm {
  background: #FFD700;
  color: #0a0a0a;
  border: none;
  font-size: 0.875rem;
  font-weight: 700;
  font-family: inherit;
  padding: 0.5rem 1.1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
}

.btn-primary-sm:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

/* ════════════════════════════════════════════
   HERO
════════════════════════════════════════════ */
.hero {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  padding: 96px 0 80px;
  overflow: hidden;
  background-image: radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: 32px 32px;
}

/* Orbs muy sutiles, sin tinte dorado */
.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
}

.hero-orb-1 {
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.04) 0%, transparent 70%);
  top: -200px;
  left: -200px;
}

.hero-orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.015) 0%, transparent 70%);
  bottom: -100px;
  right: -100px;
}

.hero-inner {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 4vw, 2rem);
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 5rem;
  z-index: 1;
  width: 100%;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

/* Badge — neutro, sin dorado */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 0.3rem 0.9rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.03em;
  margin-bottom: 1.75rem;
}

.badge-pulse {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.8);
  animation: pulse 2.5s infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.4); }
}

.hero-title {
  font-family: 'Sora', sans-serif;
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -0.035em;
  color: #ffffff;
  margin: 0 0 1.5rem;
}

/* Acento del título — color de marca para enfatizar la propuesta de valor */
.hero-accent {
  color: #FFD700;
  font-weight: 800;
}

.hero-desc {
  font-size: clamp(0.95rem, 1.8vw, 1.05rem);
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.8;
  max-width: 52ch;
  margin: 0 0 2.5rem;
}

.hero-cta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}

/* Botón principal — único uso del color de marca */
.btn-hero {
  background: #FFD700;
  color: #0a0a0a;
  border: none;
  font-family: 'Sora', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 0.8rem 1.6rem;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  transition: opacity 0.15s, transform 0.2s;
  letter-spacing: 0.01em;
}

.btn-hero:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-arrow {
  transition: transform 0.2s;
}

.btn-hero:hover .btn-arrow {
  transform: translateX(4px);
}

/* Botón secundario — solo borde, sin color */
.btn-hero-ghost {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.8rem 1.25rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.15s;
}

.btn-hero-ghost:hover {
  color: rgba(255, 255, 255, 0.85);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Proof pills — completamente neutras */
.hero-proof {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.proof-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.38);
  font-weight: 500;
}

.proof-icon {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.3);
}

/* Feature icon colors */
.feat-color-gold svg    { color: #E5C100; }
.feat-color-emerald svg { color: #22c55e; }
.feat-color-blue svg    { color: #60a5fa; }
.feat-color-purple svg  { color: #a78bfa; }
.feat-color-orange svg  { color: #fb923c; }
.feat-color-teal svg    { color: #2dd4bf; }

/* ─── Dashboard mockup ─── */
.hero-mockup {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mock-window {
  width: 100%;
  max-width: 460px;
  background: #0f0f0f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04),
    0 40px 100px rgba(0, 0, 0, 0.8);
}

.mock-chrome {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  background: #0a0a0a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.mock-dots {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.mock-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.mock-dot-red    { background: #ff5f57; }
.mock-dot-yellow { background: #febc2e; }
.mock-dot-green  { background: #28c840; }

.mock-title {
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: 0.03em;
  flex: 1;
  text-align: center;
}

.mock-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 1rem 1rem 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.mock-stat {
  background: #111;
  padding: 0.85rem 0.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.mock-stat-accent {
  background: rgba(255, 215, 0, 0.04);
}

.mock-stat-num {
  font-family: 'Sora', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}

.mock-stat-accent .mock-stat-num {
  color: #FFD700;
}

.mock-stat-label {
  font-size: 0.64rem;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
  letter-spacing: 0.03em;
}

.mock-progress-wrap {
  padding: 0.85rem 1rem 0;
}

.mock-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.45rem;
}

.mock-progress-label {
  font-size: 0.67rem;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
}

.mock-progress-pct {
  font-size: 0.67rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.mock-progress-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  overflow: hidden;
}

.mock-progress-fill {
  height: 100%;
  width: 75%;
  background: #FFD700;
  border-radius: 999px;
}

.mock-table {
  padding: 0.75rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.mock-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.65rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 7px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.mock-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
}

.mock-avatar-gold   { background: #E5C100; }
.mock-avatar-blue   { background: #3B82F6; }
.mock-avatar-purple { background: #8B5CF6; }
.mock-avatar-teal   { background: #14B8A6; }

.mock-row-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.mock-line {
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  display: block;
}

.mock-line-long  { width: 70%; }
.mock-line-med   { width: 50%; }
.mock-line-short { width: 35%; background: rgba(255, 255, 255, 0.04); }

.mock-check {
  font-size: 0.7rem;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mock-check-yes {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.mock-check-pending {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* ════════════════════════════════════════════
   STATS STRIP — neutro, sin fondo dorado
════════════════════════════════════════════ */
.stats-strip {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: #0a0a0a;
}

.stats-strip-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem clamp(1rem, 4vw, 2rem);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.strip-stat {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-shrink: 0;
}

.strip-num {
  font-family: 'Sora', sans-serif;
  font-size: 1.35rem;
  font-weight: 800;
  color: #FFD700;
  letter-spacing: -0.02em;
  line-height: 1;
}

.strip-label {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 500;
}

.strip-sep {
  color: rgba(255, 255, 255, 0.1);
  font-size: 1.2rem;
  flex-shrink: 0;
}

/* ════════════════════════════════════════════
   SECCIONES COMPARTIDAS
════════════════════════════════════════════ */
.section-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 96px clamp(1rem, 4vw, 2rem);
  text-align: center;
}

/* Eyebrow — sin dorado, solo texto muted */
.eyebrow {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  margin: 0 0 0.75rem;
}

.section-title {
  font-family: 'Sora', sans-serif;
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.025em;
  margin: 0 0 1rem;
  line-height: 1.12;
}

.section-sub {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.95rem;
  max-width: 50ch;
  margin: 0 auto 3.5rem;
  line-height: 1.75;
}

/* ════════════════════════════════════════════
   FEATURES GRID
════════════════════════════════════════════ */
.features {
  background: #0a0a0a;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  text-align: left;
}

.feat-card {
  background: #0c0c0c;
  padding: 2rem 1.75rem;
  transition: background 0.2s;
}

.feat-card:hover {
  background: #111111;
}

.feat-highlight {
  background: #0e0e0e;
}

/* Icon wrappers — fondo muy sutil */
.feat-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  padding: 9px;
  width: 2.4rem;
  height: 2.4rem;
  margin-bottom: 1.1rem;
}

.feat-color-gold   { background: rgba(229, 193, 0, 0.08);  border: 1px solid rgba(229, 193, 0, 0.15); }
.feat-color-emerald{ background: rgba(34, 197, 94, 0.08);  border: 1px solid rgba(34, 197, 94, 0.15); }
.feat-color-blue   { background: rgba(96, 165, 250, 0.08); border: 1px solid rgba(96, 165, 250, 0.15);}
.feat-color-purple { background: rgba(167, 139, 250, 0.08);border: 1px solid rgba(167, 139, 250, 0.15);}
.feat-color-orange { background: rgba(251, 146, 60, 0.08); border: 1px solid rgba(251, 146, 60, 0.15); }
.feat-color-teal   { background: rgba(45, 212, 191, 0.08); border: 1px solid rgba(45, 212, 191, 0.15); }

.feat-card h3 {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  letter-spacing: -0.01em;
}

.feat-card p {
  color: rgba(255, 255, 255, 0.38);
  font-size: 0.85rem;
  line-height: 1.7;
  margin: 0;
}

/* ════════════════════════════════════════════
   CÓMO FUNCIONA
════════════════════════════════════════════ */
.how-it-works .section-inner {
  padding-bottom: 80px;
}

.steps {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  max-width: 900px;
  margin: 0 auto;
}

.step {
  flex: 1;
  min-width: 200px;
  text-align: center;
  padding: 2rem 1.5rem;
  background: #0c0c0c;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
}

.step-num {
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: rgba(255, 215, 0, 0.2);
  letter-spacing: -0.04em;
  margin-bottom: 0.75rem;
}

.step h3 {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.step p {
  color: rgba(255, 255, 255, 0.38);
  font-size: 0.85rem;
  line-height: 1.7;
  margin: 0;
}

.step-arrow {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.12);
  align-self: center;
  flex-shrink: 0;
}

/* ════════════════════════════════════════════
   CTA FINAL
════════════════════════════════════════════ */
.cta-section {
  position: relative;
  padding: 100px 1rem;
  text-align: center;
  overflow: hidden;
  background: #0a0a0a;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.cta-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(255, 215, 0, 0.06) 0%, transparent 65%);
  pointer-events: none;
}

.cta-inner {
  position: relative;
  max-width: 560px;
  margin: 0 auto;
}

.cta-inner h2 {
  font-family: 'Sora', sans-serif;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.025em;
  margin: 0 0 1rem;
}

.cta-inner p {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.95rem;
  margin: 0 0 2rem;
  line-height: 1.75;
}

/* ════════════════════════════════════════════
   FOOTER
════════════════════════════════════════════ */
.footer {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5rem 0;
  background: #070707;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 4vw, 2rem);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.footer-brand {
  display: flex;
  align-items: center;
}

.footer-brand .brand-name {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
}

.footer-copy {
  flex: 1;
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.8rem;
  margin: 0;
}

.footer-login {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.footer-login:hover {
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
}

/* ════════════════════════════════════════════
   RESPONSIVE
════════════════════════════════════════════ */
@media (max-width: 1024px) {
  .hero-inner {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
  }

  .hero-content {
    align-items: center;
  }

  .hero-desc {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-proof {
    justify-content: center;
  }

  .mock-window {
    max-width: 480px;
  }
}

@media (max-width: 900px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .step-arrow {
    display: none;
  }

  .strip-sep {
    display: none;
  }
}

@media (max-width: 680px) {
  .nav-links,
  .btn-ghost {
    display: none;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: clamp(2rem, 8vw, 3rem);
  }

  .hero-cta {
    flex-direction: column;
    align-items: center;
  }

  .steps {
    flex-direction: column;
  }

  .footer-inner {
    flex-direction: column;
    text-align: center;
  }

  .footer-copy {
    flex: none;
  }

  .stats-strip-inner {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
}
</style>
