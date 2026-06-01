<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useEventoStore } from '../stores/evento'
import { eventosAPI } from '../services/api'
import LoginPage from '../components/LoginPage.vue'

const router = useRouter()
const route = useRoute()
const eventoStore = useEventoStore()
const showRegister = route.query.mode === 'register'

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
    :modo-registro="showRegister"
    @login="handleLogin"
    @go-home="router.push('/')"
  />
</template>
