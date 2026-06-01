<script setup>
import MesaCanvas from '../components/MesaCanvas.vue'
import SidebarInvitados from '../components/SidebarInvitados.vue'
</script>

<template>
  <div class="plano-view">
    <MesaCanvas />
    <SidebarInvitados />
  </div>
</template>

<style scoped>
.plano-view {
  display: flex;
  height: calc(100vh - 64px - 2rem);
  height: calc(100dvh - 64px - 2rem);
  gap: 0;
}
@media (max-width: 768px) {
  .plano-view {
    flex-direction: column;
    height: auto;
    min-height: calc(100dvh - 56px - 1.5rem);
  }
}
</style>
