import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import { authApi } from '@/api/auth'

// Mock the auth API
vi.mock('@/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('has correct initial state', () => {
    const store = useAuthStore()

    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('sets user and isAuthenticated on successful login', async () => {
    const store = useAuthStore()
    const mockUser = { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() }

    vi.mocked(authApi.login).mockResolvedValue({
      success: true,
      user: mockUser,
      message: 'Login successful',
    })

    await store.login({ email: 'test@example.com', password: 'Password123!' })

    expect(store.user).toEqual(mockUser)
    expect(store.isAuthenticated).toBe(true)
    expect(store.error).toBeNull()
  })

  it('sets error on failed login', async () => {
    const store = useAuthStore()

    vi.mocked(authApi.login).mockResolvedValue({
      success: false,
      error: 'Invalid credentials',
    })

    try {
      await store.login({ email: 'test@example.com', password: 'wrong' })
    } catch {
      // Expected to throw
    }

    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.error).toBe('Invalid credentials')
  })

  it('clears user state on logout', async () => {
    const store = useAuthStore()
    const mockUser = { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() }

    // Set up logged-in state
    vi.mocked(authApi.login).mockResolvedValue({
      success: true,
      user: mockUser,
      message: 'Login successful',
    })
    await store.login({ email: 'test@example.com', password: 'Password123!' })

    // Mock logout
    vi.mocked(authApi.logout).mockResolvedValue({ success: true, message: 'Logged out successfully' })

    // Logout
    await store.logout()

    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('clears error when clearError is called', () => {
    const store = useAuthStore()

    store.error = 'Some error'
    store.clearError()

    expect(store.error).toBeNull()
  })

  it('resets all auth state when clearAuth is called', () => {
    const store = useAuthStore()

    // Set some state
    store.user = { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() }
    store.error = 'Some error'

    store.clearAuth()

    expect(store.user).toBeNull()
    expect(store.error).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })
})
