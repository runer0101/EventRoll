import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GuestStats from '../../components/GuestStats.vue'

const permisosConfigurar = { configurarSillas: true }
const permisosSinConfigurar = { configurarSillas: false }

describe('GuestStats', () => {
  it('renderiza las 4 tarjetas de stats', () => {
    const wrapper = mount(GuestStats, {
      props: {
        sillasDisponibles: 100,
        sillasRestantes: 50,
        invitadosConfirmados: 50,
        porcentajeOcupacion: 50,
        permisos: permisosSinConfigurar,
      },
    })

    const cards = wrapper.findAll('.stat-card')
    expect(cards).toHaveLength(4)
  })

  it('muestra input editable cuando configurarSillas es true', () => {
    const wrapper = mount(GuestStats, {
      props: {
        sillasDisponibles: 100,
        sillasRestantes: 50,
        invitadosConfirmados: 50,
        porcentajeOcupacion: 50,
        permisos: permisosConfigurar,
      },
    })

    expect(wrapper.find('input.input-sillas').exists()).toBe(true)
  })

  it('muestra span no editable cuando configurarSillas es false', () => {
    const wrapper = mount(GuestStats, {
      props: {
        sillasDisponibles: 100,
        sillasRestantes: 50,
        invitadosConfirmados: 50,
        porcentajeOcupacion: 50,
        permisos: permisosSinConfigurar,
      },
    })

    expect(wrapper.find('input.input-sillas').exists()).toBe(false)
    expect(wrapper.find('.stat-card__number').exists()).toBe(true)
  })

  it('emite update:sillasDisponibles al cambiar el input', async () => {
    const wrapper = mount(GuestStats, {
      props: {
        sillasDisponibles: 100,
        sillasRestantes: 50,
        invitadosConfirmados: 50,
        porcentajeOcupacion: 50,
        permisos: permisosConfigurar,
      },
    })

    const input = wrapper.find('input.input-sillas')
    await input.setValue('200')
    await input.trigger('input')

    expect(wrapper.emitted('update:sillasDisponibles')).toBeTruthy()
    expect(wrapper.emitted('update:sillasDisponibles')[0]).toEqual([200])
  })

  it('fuerza el valor mínimo a 1', async () => {
    const wrapper = mount(GuestStats, {
      props: {
        sillasDisponibles: 100,
        sillasRestantes: 50,
        invitadosConfirmados: 50,
        porcentajeOcupacion: 50,
        permisos: permisosConfigurar,
      },
    })

    const input = wrapper.find('input.input-sillas')
    await input.setValue('0')
    await input.trigger('input')

    expect(wrapper.emitted('update:sillasDisponibles')[0]).toEqual([1])
  })

  it('muestra el porcentaje de ocupación correcto', () => {
    const wrapper = mount(GuestStats, {
      props: {
        sillasDisponibles: 200,
        sillasRestantes: 150,
        invitadosConfirmados: 50,
        porcentajeOcupacion: 25,
        permisos: permisosSinConfigurar,
      },
    })

    const numbers = wrapper.findAll('.stat-card__number')
    const porcentajeText = numbers[numbers.length - 1].text()
    expect(porcentajeText).toContain('25')
  })
})
