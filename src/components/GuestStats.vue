<template>
  <div class="stats-grid">
    <div class="stat-card stat-card--total">
      <div class="stat-card__icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/></svg>
      </div>
      <div class="stat-card__body">
        <span class="stat-card__label">Capacidad</span>
        <div class="stat-card__value-row">
          <input
            v-if="permisos.configurarSillas"
            type="number"
            min="1"
            class="input-sillas"
            :value="sillasDisponibles"
            @input="$emit('update:sillasDisponibles', Math.max(1, parseInt($event.target.value) || 1))"
          />
          <span v-else class="stat-card__number">{{ sillasDisponibles }}</span>
        </div>
      </div>
    </div>

    <div class="stat-card stat-card--available">
      <div class="stat-card__icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="stat-card__body">
        <span class="stat-card__label">Disponibles</span>
        <span class="stat-card__number">{{ sillasRestantes }}</span>
      </div>
    </div>

    <div class="stat-card stat-card--confirmed">
      <div class="stat-card__icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
      </div>
      <div class="stat-card__body">
        <span class="stat-card__label">Confirmados</span>
        <span class="stat-card__number">{{ invitadosConfirmados }}</span>
      </div>
    </div>

    <div class="stat-card stat-card--occupation">
      <div class="stat-card__icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      </div>
      <div class="stat-card__body">
        <span class="stat-card__label">Ocupación</span>
        <span class="stat-card__number">{{ porcentajeOcupacion }}<small>%</small></span>
      </div>
      <div class="stat-progress">
        <div class="stat-progress__fill" :style="{ width: Math.min(porcentajeOcupacion, 100) + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  sillasDisponibles: { type: Number, required: true },
  sillasRestantes: { type: Number, required: true },
  invitadosConfirmados: { type: Number, required: true },
  porcentajeOcupacion: { type: Number, required: true },
  permisos: { type: Object, required: true }
})

defineEmits(['update:sillasDisponibles'])
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.stat-card {
  background: #141414;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 14px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s;
}

.stat-card:hover { border-color: rgba(255,215,0,0.25); }

.stat-card__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  color: #FFD700;
  background: rgba(255,215,0,0.08);
}

.stat-card--available .stat-card__icon { color: #4ade80; background: rgba(74,222,128,0.08); }
.stat-card--confirmed .stat-card__icon { color: #60a5fa; background: rgba(96,165,250,0.08); }
.stat-card--occupation .stat-card__icon { color: #f97316; background: rgba(249,115,22,0.08); }

.stat-card__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-card__label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
}

.stat-card__number {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.stat-card--available .stat-card__number { color: #4ade80; }
.stat-card--confirmed .stat-card__number { color: #60a5fa; }
.stat-card--occupation .stat-card__number { color: #f97316; }

.stat-card__number small {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.7;
  margin-left: 1px;
}

.stat-card__value-row {
  display: flex;
  align-items: center;
}

.stat-progress {
  height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}

.stat-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, #f97316, #ef4444);
  border-radius: 2px;
  transition: width 0.4s ease;
}

.input-sillas {
  padding: 0;
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
  border: none;
  border-bottom: 1px dashed rgba(255,215,0,0.35);
  border-radius: 0;
  width: 80px;
  background: transparent;
  color: #FFD700;
  transition: border-color 0.2s;
}

.input-sillas:focus {
  outline: none;
  border-bottom-color: rgba(255,215,0,0.8);
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .stat-card { padding: 10px 10px 8px; }
  .stat-card__number { font-size: 22px; }
  .stat-card__icon { width: 26px; height: 26px; }
}

@media (min-width: 481px) and (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  .stat-card { padding: 12px 12px 10px; }
  .stat-card__number { font-size: 24px; }
}
</style>
