import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials, RegisterData } from '@/types/auth'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => user.value !== null)
  const currentUser = computed(() => user.value)

  async function login(credentials: LoginCredentials): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.login(credentials)

      if (!response.success) {
        const errorMessage = response.error || 'Login failed. Please try again.'
        error.value = errorMessage
        user.value = null
        throw new Error(errorMessage)
      }

      user.value = response.user
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed. Please try again.'
      error.value = errorMessage
      user.value = null
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegisterData): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.register(data)

      if (!response.success) {
        const errorMessage = response.error || 'Registration failed. Please try again.'
        error.value = errorMessage
        user.value = null
        throw new Error(errorMessage)
      }

      user.value = response.user
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed. Please try again.'
      error.value = errorMessage
      user.value = null
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await authApi.logout()
      user.value = null
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Logout failed. Please try again.'
      error.value = errorMessage
      user.value = null
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function checkAuth(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.getCurrentUser()

      if (!response.success) {
        user.value = null
        return
      }

      user.value = response.user
    } catch (err: any) {
      const status = err.response?.status

      // Clear session only on auth failures (401/419), not transient errors
      if (status === 401 || status === 419) {
        user.value = null
      }

      if (status !== 401 && status !== 419) {
        console.error('Auth check failed:', err)
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchUser(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.getCurrentUser()

      if (!response.success) {
        const errorMessage = response.error || 'Failed to fetch user data.'
        error.value = errorMessage
        user.value = null
        throw new Error(errorMessage)
      }

      user.value = response.user
    } catch (err: any) {
      const status = err.response?.status
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch user data.'

      error.value = errorMessage

      // Clear session only on auth failures (401/419), not transient errors
      if (status === 401 || status === 419) {
        user.value = null
      }

      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  function clearAuth(): void {
    user.value = null
    error.value = null
    loading.value = false
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    currentUser,
    login,
    register,
    logout,
    checkAuth,
    fetchUser,
    clearError,
    clearAuth,
  }
})
