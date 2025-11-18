<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/NavBar.vue'
import ImageUploadZone from '@/components/ImageUploadZone.vue'
import ImageGallery from '@/components/ImageGallery.vue'

const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- User info section -->
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Welcome to your Dashboard
        </h1>

        <div class="space-y-2 text-gray-700">
          <p>
            <span class="font-semibold">Email:</span> {{ authStore.currentUser?.email }}
          </p>
          <p>
            <span class="font-semibold">User ID:</span> {{ authStore.currentUser?.id }}
          </p>
          <p>
            <span class="font-semibold">Account created:</span>
            {{ authStore.currentUser?.createdAt ? new Date(authStore.currentUser.createdAt).toLocaleDateString() : 'N/A' }}
          </p>
        </div>
      </div>

      <!-- Image management section -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-6">My Images</h2>

        <!-- Upload zone -->
        <ImageUploadZone />

        <!-- Image gallery -->
        <ImageGallery />
      </div>
    </div>
  </div>
</template>
