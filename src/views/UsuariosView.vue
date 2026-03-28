<script setup>
import { inject } from 'vue'
import GestionUsuarios from '../components/GestionUsuarios.vue'

const registrarActividad = inject('registrarActividad')
</script>

<template>
  <GestionUsuarios @registrar-actividad="registrarActividad" />
</template>
