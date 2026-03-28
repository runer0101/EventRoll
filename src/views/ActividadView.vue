<script setup>
import { inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import PanelUsuarios from '../components/PanelUsuarios.vue'

const router = useRouter()
const authStore = useAuthStore()
const actividadReciente = inject('actividadReciente')
const manejarLogout = inject('manejarLogout')

const usuario = computed(() => authStore.usuario)

async function handleLogout() {
  await manejarLogout?.()
  router.push('/')
}
</script>

<template>
  <PanelUsuarios
    :usuario="usuario"
    :actividad-reciente="actividadReciente"
    @logout="handleLogout"
  />
</template>
