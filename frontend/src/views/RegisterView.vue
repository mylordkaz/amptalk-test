<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateEmail, validatePassword } from '@/utils/validation'
import PasswordStrength from '@/components/PasswordStrength.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const validationError = ref('')

onMounted(() => {
  authStore.clearError()
})

const handleSubmit = async () => {
  validationError.value = ''

  const emailValidation = validateEmail(email.value)
  if (!emailValidation.valid) {
    validationError.value = emailValidation.message || 'Invalid email'
    return
  }

  const passwordValidation = validatePassword(password.value)
  if (!passwordValidation.valid) {
    validationError.value = passwordValidation.message || 'Invalid password'
    return
  }

  if (password.value !== confirmPassword.value) {
    validationError.value = 'Passwords do not match'
    return
  }

  try {
    await authStore.register({ email: email.value, password: password.value })
    router.push('/dashboard')
  } catch (error) {
    // Error is already set in authStore.error
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full px-6">
      <div class="bg-white p-8 rounded-lg shadow-lg">
        <img src="/atim.webp" alt="Logo" class="mx-auto mb-6 h-40 w-auto" />
        <h1 class="text-2xl font-bold text-center mb-6">Register</h1>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :disabled="authStore.loading"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="new-password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :disabled="authStore.loading"
            />
            <PasswordStrength :password="password" />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :disabled="authStore.loading"
            />
          </div>

          <div v-if="validationError || authStore.error" class="text-sm text-red-600">
            {{ validationError || authStore.error }}
          </div>

          <button
            type="submit"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="authStore.loading"
          >
            {{ authStore.loading ? 'Registering...' : 'Register' }}
          </button>
        </form>

        <p class="mt-4 text-center text-sm text-gray-600">
          Already have an account?
          <router-link to="/login" class="text-blue-600 hover:text-blue-700">
            Login
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
