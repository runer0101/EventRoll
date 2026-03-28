<script setup>
import { inject } from 'vue'
import { Users, UserCheck, Clock } from 'lucide-vue-next'

const stats = inject('stats')
const eventoIdActual = inject('eventoIdActual')
</script>

<template>
  <div class="vista-estadisticas">
    <div class="section-header">
      <h2>Estadísticas del Evento</h2>
      <span class="section-tag">Evento ID {{ eventoIdActual?.() }}</span>
    </div>
    <div class="stats-grid">
      <div class="stat-card stat-total">
        <div class="stat-icon"><Users :size="36" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ stats?.totalInvitados ?? 0 }}</div>
          <div class="stat-label">Total Invitados</div>
        </div>
      </div>
      <div class="stat-card stat-confirmados">
        <div class="stat-icon"><UserCheck :size="36" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ stats?.confirmados ?? 0 }}</div>
          <div class="stat-label">Confirmados</div>
          <div v-if="stats?.totalInvitados > 0" class="stat-pct">
            {{ Math.round((stats.confirmados / stats.totalInvitados) * 100) }}% del total
          </div>
        </div>
      </div>
      <div class="stat-card stat-pendientes">
        <div class="stat-icon"><Clock :size="36" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ stats?.pendientes ?? 0 }}</div>
          <div class="stat-label">Pendientes</div>
          <div v-if="stats?.totalInvitados > 0" class="stat-pct">
            {{ Math.round((stats.pendientes / stats.totalInvitados) * 100) }}% del total
          </div>
        </div>
      </div>
    </div>
    <div v-if="stats?.totalInvitados > 0" class="progress-card">
      <div class="progress-header">
        <span>Progreso de confirmación</span>
        <span class="progress-pct">{{ Math.round((stats.confirmados / stats.totalInvitados) * 100) }}%</span>
      </div>
      <div class="progress-bar" role="progressbar" :aria-valuenow="Math.round((stats.confirmados / stats.totalInvitados) * 100)" aria-valuemin="0" aria-valuemax="100">
        <div
          class="progress-fill"
          :style="{ width: Math.round((stats.confirmados / stats.totalInvitados) * 100) + '%' }"
        ></div>
      </div>
    </div>
    <div v-else class="empty-stats">
      <p>No hay datos de invitados para mostrar estadísticas.</p>
    </div>
  </div>
</template>

<style scoped>
.vista-estadisticas {
  margin-bottom: var(--spacing-lg);
}

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

.section-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 215, 0, 0.12);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: var(--radius-full);
  color: var(--color-primary);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.stat-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border-accent);
  border-radius: var(--radius-xl) 0 var(--radius-xl) var(--radius-xl);
  clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
  animation: float-up 0.4s ease both;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: #FFD700;
  opacity: 0.6;
  transition: opacity var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 215, 0, 0.35);
  box-shadow: var(--glow-gold), 0 8px 32px rgba(0, 0, 0, 0.4);
  background: var(--glass-bg-strong);
}

.stat-card:hover::before { opacity: 1; }

.stat-confirmados:hover { border-color: rgba(52, 211, 153, 0.35); box-shadow: var(--glow-green), 0 8px 32px rgba(0,0,0,0.4); }
.stat-confirmados::before { background: #34d399; }
.stat-pendientes::before { background: #FBBF24; }

.stat-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
}

.stat-total .stat-icon svg      { color: #FFD700; }
.stat-confirmados .stat-icon svg { color: #34d399; }
.stat-pendientes .stat-icon svg  { color: #FBBF24; }

.stat-body { min-width: 0; }

.stat-value {
  font-family: 'Sora', var(--font-display);
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
  letter-spacing: -0.02em;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.stat-confirmados .stat-value { color: #34d399; text-shadow: 0 0 20px rgba(52,211,153,0.3); }
.stat-pendientes .stat-value  { color: #FBBF24; text-shadow: 0 0 20px rgba(251,191,36,0.3); }

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  margin-top: 0.3rem;
}

.stat-pct {
  margin-top: 0.25rem;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 500;
}

.progress-card {
  margin-top: 1.25rem;
  padding: 1.25rem 1.5rem;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
}

.progress-pct { color: var(--color-primary); font-weight: 800; font-size: 1rem; }

.progress-bar {
  height: 10px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-full);
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
}

.progress-fill {
  height: 100%;
  background: var(--gradient-progress);
  background-size: 200% 100%;
  animation: gradient-shift 3s ease infinite;
  border-radius: var(--radius-full);
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
}

.empty-stats {
  margin-top: 2rem;
  text-align: center;
  color: var(--color-text-muted);
  font-style: italic;
}

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 0.65rem; }
}
</style>
