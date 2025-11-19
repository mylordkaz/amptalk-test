<script setup lang="ts">
import { ref } from 'vue'
import { useImageStore } from '@/stores/images'
import { validateImageFile, ACCEPTED_IMAGE_TYPES } from '@/utils/fileHelpers'

const imageStore = useImageStore()
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

/**
 * Handle file selection from input
 */
function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) {
    uploadFile(file)
    // Reset input so the same file can be selected again
    input.value = ''
  }
}

/**
 * Handle drop event
 */
function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer?.files[0]
  if (file) {
    uploadFile(file)
  }
}

/**
 * Handle drag over event
 */
function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

/**
 * Handle drag leave event
 */
function handleDragLeave() {
  isDragging.value = false
}

/**
 * Upload file after validation
 */
async function uploadFile(file: File) {
  // Clear any previous errors
  imageStore.clearError()

  // Validate file
  const validation = validateImageFile(file)
  if (!validation.valid) {
    imageStore.error = validation.error || 'Invalid file'
    return
  }

  // Upload through store
  await imageStore.uploadImage(file)
}

/**
 * Trigger file input click
 */
function triggerFileInput() {
  fileInputRef.value?.click()
}

/**
 * Get accepted file types for input
 */
const acceptedTypes = ACCEPTED_IMAGE_TYPES.join(',')
</script>

<template>
  <div class="mb-8">
    <div
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
      :class="[
        'relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer',
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400 bg-white',
        imageStore.isUploading ? 'opacity-75 pointer-events-none' : ''
      ]"
    >
      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        :accept="acceptedTypes"
        @change="handleFileSelect"
        class="hidden"
      />

      <!-- Upload content -->
      <div class="flex flex-col items-center justify-center space-y-4">
        <!-- Upload icon -->
        <svg
          v-if="!imageStore.isUploading"
          class="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <!-- Loading spinner -->
        <div
          v-if="imageStore.isUploading"
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        ></div>

        <!-- Text -->
        <div class="text-center">
          <p v-if="!imageStore.isUploading" class="text-lg font-medium text-gray-700">
            <span v-if="isDragging" class="text-blue-600">Drop image here</span>
            <span v-else>
              Drop your image here or
              <span class="text-blue-600">click to browse</span>
            </span>
          </p>
          <p v-else class="text-lg font-medium text-gray-700">
            Uploading...
          </p>

          <p class="mt-2 text-sm text-gray-500">
            JPEG, PNG, GIF, WebP • Max 5 MB
          </p>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div
      v-if="imageStore.error"
      class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start"
    >
      <svg
        class="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div class="flex-1">
        <p class="text-sm text-red-800">{{ imageStore.error }}</p>
        <button
          @click="imageStore.clearError"
          class="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
</template>
