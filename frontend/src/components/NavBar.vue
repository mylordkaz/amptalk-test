<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    router.push('/login')
  }
}
</script>

<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="text-lg font-semibold text-gray-900">
          Dashboard
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-700">
            {{ authStore.currentUser?.email }}
          </span>
          <button
            @click="handleLogout"
            class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            :disabled="authStore.loading"
          >
            {{ authStore.loading ? 'Logging out...' : 'Logout' }}
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
