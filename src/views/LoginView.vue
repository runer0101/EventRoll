<script setup>
import { useRouter } from 'vue-router'
import { useEventoStore } from '../stores/evento'
import { eventosAPI } from '../services/api'
import LoginPage from '../components/LoginPage.vue'

const router = useRouter()
const eventoStore = useEventoStore()

async function handleLogin() {
  try {
    const res = await eventosAPI.getAll()
    const primer = res.data?.[0]
    if (primer?.id) eventoStore.setEventoId(primer.id)
  } catch {
    // No bloquea si falla
  }
  router.push('/app/invitados')
}
</script>

<template>
  <LoginPage
    @login="handleLogin"
    @go-home="router.push('/')"
  />
</template>
