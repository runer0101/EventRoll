import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PaginationBar from '../../components/PaginationBar.vue'

describe('PaginationBar', () => {
  const defaultProps = {
    currentPage: 3,
    totalPages: 10,
    totalItems: 500,
    pageSize: 50,
    disabled: false,
  }

  it('renderiza los controles de paginación', () => {
    const wrapper = mount(PaginationBar, { props: defaultProps })

    expect(wrapper.find('.paginacion').exists()).toBe(true)
    expect(wrapper.find('.pagina-actual').text()).toContain('3')
    expect(wrapper.find('.pagina-actual').text()).toContain('10')
  })

  it('muestra la información de items', () => {
    const wrapper = mount(PaginationBar, {
      props: { ...defaultProps, total: 150 },
    })

    expect(wrapper.text()).toContain('150')
    expect(wrapper.text()).toContain('500')
  })

  it('el botón Primera navega a la página 1', async () => {
    const wrapper = mount(PaginationBar, { props: defaultProps })

    await wrapper.find('button:first-child').trigger('click')

    expect(wrapper.emitted('update:currentPage')).toBeTruthy()
    expect(wrapper.emitted('update:currentPage')[0]).toEqual([1])
  })

  it('el botón Anterior va a la página anterior', async () => {
    const wrapper = mount(PaginationBar, { props: defaultProps })

    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')

    expect(wrapper.emitted('update:currentPage')[0]).toEqual([2])
  })

  it('el botón Siguiente va a la página siguiente', async () => {
    const wrapper = mount(PaginationBar, { props: defaultProps })

    const buttons = wrapper.findAll('button')
    await buttons[2].trigger('click')

    expect(wrapper.emitted('update:currentPage')[0]).toEqual([4])
  })

  it('el botón Última navega a la última página', async () => {
    const wrapper = mount(PaginationBar, { props: defaultProps })

    const buttons = wrapper.findAll('button')
    await buttons[buttons.length - 1].trigger('click')

    expect(wrapper.emitted('update:currentPage')[0]).toEqual([10])
  })

  it('deshabilita botones cuando disabled es true', () => {
    const wrapper = mount(PaginationBar, {
      props: { ...defaultProps, disabled: true },
    })

    const buttons = wrapper.findAll('button')
    for (const btn of buttons) {
      expect(btn.attributes('disabled')).toBeDefined()
    }
  })

  it('Primera y Anterior están deshabilitados en página 1', () => {
    const wrapper = mount(PaginationBar, {
      props: { ...defaultProps, currentPage: 1 },
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('disabled')).toBeDefined()
    expect(buttons[1].attributes('disabled')).toBeDefined()
  })

  it('Siguiente y Última están deshabilitados en última página', () => {
    const wrapper = mount(PaginationBar, {
      props: { ...defaultProps, currentPage: 10 },
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[2].attributes('disabled')).toBeDefined()
    expect(buttons[3].attributes('disabled')).toBeDefined()
  })
})
