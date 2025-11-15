import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '../App.vue'
import { useAuthStore } from '@/stores/auth'

// Mock the auth API
vi.mock('@/api/auth', () => ({
  getCurrentUser: vi.fn(),
}))

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders loading state initially', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Loading...')
  })

  it('shows RouterView after auth check completes', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: { template: '<div>Router Content</div>' },
        },
      },
    })

    const store = useAuthStore()

    // Complete auth check
    await store.checkAuth()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Router Content')
  })
})
