import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordStrength from '../PasswordStrength.vue'

describe('PasswordStrength Component', () => {
  it('renders nothing when password is empty', () => {
    const wrapper = mount(PasswordStrength, {
      props: { password: '' },
    })

    expect(wrapper.text()).toBe('')
  })

  it('shows "Weak" label for weak password', () => {
    const wrapper = mount(PasswordStrength, {
      props: { password: 'weak' },
    })

    expect(wrapper.text()).toContain('Weak')
  })

  it('shows "Strong" label for strong password', () => {
    const wrapper = mount(PasswordStrength, {
      props: { password: 'StrongPass123!' },
    })

    expect(wrapper.text()).toContain('Strong')
  })

  it('displays all requirement checkmarks correctly', () => {
    const wrapper = mount(PasswordStrength, {
      props: { password: 'StrongPass123!' },
    })

    const text = wrapper.text()

    // All requirements should show checkmarks (✓)
    expect(text).toContain('✓ At least 8 characters')
    expect(text).toContain('✓ One uppercase letter')
    expect(text).toContain('✓ One lowercase letter')
    expect(text).toContain('✓ One number')
    expect(text).toContain('✓ One special character')
  })

  it('shows circles (○) for unmet requirements', () => {
    const wrapper = mount(PasswordStrength, {
      props: { password: 'weak' },
    })

    const text = wrapper.text()

    // Unmet requirements should show circles (○)
    expect(text).toContain('○ At least 8 characters')
    expect(text).toContain('○ One uppercase letter')
    expect(text).toContain('○ One number')
    expect(text).toContain('○ One special character')
  })
})
