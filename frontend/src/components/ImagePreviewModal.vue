<script setup lang="ts">
import { watch } from 'vue'
import type { Image } from '@/types/image'
import { formatFileSize, formatDateTime } from '@/utils/fileHelpers'

interface Props {
  image: Image | null
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

/**
 * Handle ESC key to close modal
 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

/**
 * Watch for modal open/close to manage body scroll and keyboard listeners
 */
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeydown)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeydown)
    }
  }
)
</script>

<template>
  <!-- Modal backdrop -->
  <Transition name="fade">
    <div
      v-if="isOpen && image"
      class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      @click="emit('close')"
    >
      <!-- Close button -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Close"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Modal content -->
      <div
        @click.stop
        class="max-w-6xl w-full max-h-full flex flex-col"
      >
        <!-- Image container -->
        <div class="flex-1 flex items-center justify-center mb-4">
          <img
            :src="image.publicUrl"
            :alt="image.filename"
            class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
          />
        </div>

        <!-- Metadata overlay -->
        <div class="bg-gray-900 bg-opacity-80 rounded-lg p-4 text-white">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Filename -->
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Filename</p>
              <p class="text-sm font-medium break-all">{{ image.filename }}</p>
            </div>

            <!-- File size -->
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Size</p>
              <p class="text-sm font-medium">{{ formatFileSize(image.fileSize) }}</p>
            </div>

            <!-- Upload date -->
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Uploaded</p>
              <p class="text-sm font-medium">{{ formatDateTime(image.uploadedAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Fade transition for modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
