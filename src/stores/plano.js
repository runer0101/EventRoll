import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mesasAPI } from '../services/api'

export const usePlanoStore = defineStore('plano', () => {
  const mesas = ref([])
  const invitadosSinMesa = ref([])
  const cargando = ref(false)

  async function cargarMesas(eventoId) {
    if (!eventoId) return
    cargando.value = true
    try {
      const res = await mesasAPI.getAll(eventoId)
      if (res.success) mesas.value = res.data
    } finally {
      cargando.value = false
    }
  }

  async function cargarInvitadosSinMesa(eventoId) {
    if (!eventoId) return
    try {
      const res = await mesasAPI.getSinMesa(eventoId)
      if (res.success) invitadosSinMesa.value = res.data
    } catch { /* ignorar */ }
  }

  async function crearMesa(data) {
    const res = await mesasAPI.create(data)
    if (res.success) {
      mesas.value.push({ ...res.data, asignaciones: [] })
    }
    return res
  }

  async function eliminarMesa(id) {
    const res = await mesasAPI.delete(id)
    if (res.success) {
      mesas.value = mesas.value.filter(m => m.id !== id)
    }
    return res
  }

  async function actualizarPosicion(id, pos_x, pos_y) {
    const res = await mesasAPI.update(id, { pos_x, pos_y })
    if (res.success) {
      const mesa = mesas.value.find(m => m.id === id)
      if (mesa) {
        mesa.pos_x = pos_x
        mesa.pos_y = pos_y
      }
    }
    return res
  }

  async function asignarInvitado(mesaId, invitadoId, posicion) {
    const res = await mesasAPI.asignar(mesaId, invitadoId, posicion)
    if (res.success) {
      const mesa = mesas.value.find(m => m.id === mesaId)
      if (mesa) {
        const inv = invitadosSinMesa.value.find(i => i.id === invitadoId)
        if (inv) {
          mesa.asignaciones.push({
            id: res.data.id,
            posicion,
            invitado_id: invitadoId,
            invitado_nombre: inv.nombre,
            invitado_apellido: inv.apellido,
            invitado_categoria: inv.categoria,
            invitado_confirmado: inv.confirmado
          })
          invitadosSinMesa.value = invitadosSinMesa.value.filter(i => i.id !== invitadoId)
        }
      }
    }
    return res
  }

  async function desasignarInvitado(invitadoId) {
    const res = await mesasAPI.desasignar(invitadoId)
    if (res.success) {
      for (const mesa of mesas.value) {
        const idx = mesa.asignaciones.findIndex(a => a.invitado_id === invitadoId)
        if (idx >= 0) {
          const [asig] = mesa.asignaciones.splice(idx, 1)
          invitadosSinMesa.value.push({
            id: invitadoId,
            nombre: asig.invitado_nombre,
            apellido: asig.invitado_apellido,
            categoria: asig.invitado_categoria,
            confirmado: asig.invitado_confirmado
          })
          break
        }
      }
    }
    return res
  }

  return {
    mesas,
    invitadosSinMesa,
    cargando,
    cargarMesas,
    cargarInvitadosSinMesa,
    crearMesa,
    eliminarMesa,
    actualizarPosicion,
    asignarInvitado,
    desasignarInvitado
  }
})
