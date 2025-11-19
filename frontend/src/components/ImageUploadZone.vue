<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useImageStore } from '@/stores/images'
import { validateImageFiles, ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BATCH_SIZE } from '@/utils/fileHelpers'

const imageStore = useImageStore()
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Track error auto-dismiss timeout
let errorTimeout: number | null = null

/**
 * Handle file selection from input
 */
function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])

  if (files.length > 0) {
    uploadFiles(files)
    input.value = ''
  }
}

/**
 * Handle drop event
 */
function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const files = Array.from(event.dataTransfer?.files || [])
  if (files.length > 0) {
    uploadFiles(files)
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
 * Upload files after validation
 */
async function uploadFiles(files: File[]) {
  // Clear any previous errors
  imageStore.clearError()

  // Validate files
  const validation = validateImageFiles(files)

  // Check if too many files
  if (validation.tooManyFiles) {
    imageStore.error = `Maximum ${MAX_UPLOAD_BATCH_SIZE} images allowed. Please select fewer files.`
    return
  }

  // Show validation errors for invalid files
  if (validation.invalid.size > 0) {
    const errorMessages: string[] = []
    validation.invalid.forEach((error, file) => {
      errorMessages.push(`${file.name}: ${error}`)
    })

    if (validation.valid.length === 0) {
      // All files invalid - reject entire batch
      imageStore.error = `[VALIDATION] All files are invalid:\n${errorMessages.join('\n')}`
      return
    } else {
      // Mixed batch - warn about skipped files, continue with valid ones
      const skipCount = validation.invalid.size
      const validCount = validation.valid.length
      imageStore.error = `[VALIDATION] ${skipCount} of ${skipCount + validCount} files skipped:\n${errorMessages.join('\n')}`
      // Don't return - proceed to upload valid files
    }
  }

  // If we have valid files, upload them
  if (validation.valid.length > 0) {
    const result = await imageStore.uploadImages(validation.valid)

    // Show summary after upload
    if (result.success > 0 && result.failed === 0) {
      // All succeeded - error will be cleared automatically
    } else if (result.failed > 0) {
      // Some or all failed - error is already set by store
    }
  }
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

/**
 * Get upload progress message
 */
const uploadMessage = computed(() => {
  if (imageStore.uploadedCount > 0 && imageStore.totalUploadCount > 0) {
    return `Uploading ${imageStore.uploadedCount} of ${imageStore.totalUploadCount} files...`
  }
  return 'Uploading...'
})

/**
 * Check if current error is a validation or upload error (needs manual dismiss)
 */
const isValidationError = computed(() => {
  return imageStore.error?.startsWith('[VALIDATION]') || imageStore.error?.startsWith('[UPLOAD]') || false
})

/**
 * Get display error without the marker
 */
const displayError = computed(() => {
  if (!imageStore.error) return ''
  return imageStore.error.replace('[VALIDATION] ', '').replace('[UPLOAD] ', '')
})

/**
 * Auto-dismiss error after 3 seconds (except validation and upload errors)
 */
watch(() => imageStore.error, (newError) => {
  if (errorTimeout !== null) {
    clearTimeout(errorTimeout)
    errorTimeout = null
  }

  // Set new timeout only for non-validation and non-upload errors
  if (newError && !newError.startsWith('[VALIDATION]') && !newError.startsWith('[UPLOAD]')) {
    errorTimeout = window.setTimeout(() => {
      imageStore.clearError()
      errorTimeout = null
    }, 3000) as unknown as number
  }
})

/**
 * Cleanup timeout on component unmount
 */
onUnmounted(() => {
  if (errorTimeout !== null) {
    clearTimeout(errorTimeout)
  }
})
</script>

<template>
  <div class="mb-8">
    <!-- Error message -->
    <div
      v-if="imageStore.error"
      class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start"
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
        <p class="text-sm text-red-800 whitespace-pre-line">{{ displayError }}</p>
        <!-- Show dismiss button for validation errors -->
        <button
          v-if="isValidationError"
          @click="imageStore.clearError"
          class="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Dismiss
        </button>
      </div>
    </div>

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
        imageStore.isUploadingAny ? 'opacity-75 pointer-events-none' : ''
      ]"
    >
      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        multiple
        :accept="acceptedTypes"
        @change="handleFileSelect"
        class="hidden"
      />

      <!-- Upload content -->
      <div class="flex flex-col items-center justify-center space-y-4">
        <!-- Upload icon -->
        <svg
          v-if="!imageStore.isUploadingAny"
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
          v-if="imageStore.isUploadingAny"
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        ></div>

        <!-- Text -->
        <div class="text-center w-full">
          <p v-if="!imageStore.isUploadingAny" class="text-lg font-medium text-gray-700">
            <span v-if="isDragging" class="text-blue-600">Drop images here</span>
            <span v-else>
              Drop your images here or
              <span class="text-blue-600">click to browse</span>
            </span>
          </p>
          <p v-else class="text-lg font-medium text-gray-700">
            {{ uploadMessage }}
          </p>

          <!-- Progress bar -->
          <div v-if="imageStore.isUploadingAny && imageStore.totalUploadCount > 0" class="mt-3 w-full max-w-xs mx-auto">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${imageStore.uploadProgress}%` }"
              ></div>
            </div>
            <p class="text-sm text-gray-600 mt-1">{{ imageStore.uploadProgress }}%</p>
          </div>

          <p class="mt-2 text-sm text-gray-500">
            JPEG, PNG, GIF, WebP • Max 5 MB per file • Up to 10 files
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
