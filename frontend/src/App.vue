<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const isCheckingAuth = ref(true)

onMounted(async () => {
  const authStore = useAuthStore()
  await authStore.checkAuth()
  isCheckingAuth.value = false
})
</script>

<template>
  <div v-if="isCheckingAuth" class="flex items-center justify-center h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading...</p>
    </div>
  </div>
  <RouterView v-else />
</template>
