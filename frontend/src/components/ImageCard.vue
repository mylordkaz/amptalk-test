<script setup lang="ts">
import { computed } from 'vue'
import type { Image } from '@/types/image'
import { formatFileSize, formatDate, truncateFilename } from '@/utils/fileHelpers'

interface Props {
  image: Image
  isDeleting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  preview: [image: Image]
  delete: [image: Image]
}>()

/**
 * Truncated filename for display
 */
const displayFilename = computed(() => truncateFilename(props.image.filename, 25))
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg relative">
    <!-- Loading overlay -->
    <div
      v-if="isDeleting"
      class="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10"
    >
      <div class="flex flex-col items-center space-y-2">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <p class="text-sm text-gray-600">Deleting...</p>
      </div>
    </div>

    <!-- Image thumbnail -->
    <div
      @click="emit('preview', image)"
      class="aspect-square bg-gray-100 overflow-hidden cursor-pointer relative group"
    >
      <img
        :src="image.publicUrl"
        :alt="image.filename"
        class="w-full h-full object-cover transition-transform group-hover:scale-105"
      />

      <!-- Hover overlay with view icon -->
      <div
        class="absolute inset-0 bg-transparent group-hover:bg-black/30 transition-colors flex items-center justify-center"
      >
        <svg
          class="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </div>
    </div>

    <!-- Card content -->
    <div class="p-4">
      <!-- Filename -->
      <h3
        class="text-sm font-semibold text-gray-900 mb-2 truncate"
        :title="image.filename"
      >
        {{ displayFilename }}
      </h3>

      <!-- Metadata -->
      <div class="space-y-1 text-xs text-gray-600 mb-3">
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
          </svg>
          <span>{{ formatDate(image.uploadedAt) }}</span>
        </div>
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span>{{ formatFileSize(image.fileSize) }}</span>
        </div>


        <div class="flex items-center">
          <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <a
            :href="image.publicUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 hover:text-blue-700 hover:underline truncate"
            @click.stop
          >
            Image URL
          </a>
        </div>
      </div>

      <!-- Delete button -->
      <button
        @click="emit('delete', image)"
        :disabled="isDeleting"
        class="w-full flex items-center justify-center px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Delete
      </button>
    </div>
  </div>
</template>
