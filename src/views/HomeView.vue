<script setup>
import { useRouter } from 'vue-router'
import HomePage from '../components/HomePage.vue'

const router = useRouter()
</script>

<template>
  <HomePage @go-login="router.push('/login')" />
</template>
