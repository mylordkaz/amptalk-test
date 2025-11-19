<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useImageStore } from '@/stores/images'
import type { Image } from '@/types/image'
import ImageCard from './ImageCard.vue'
import ImagePreviewModal from './ImagePreviewModal.vue'
import DeleteConfirmModal from './DeleteConfirmModal.vue'

const imageStore = useImageStore()

// Pagination state
const currentPage = ref(1)
const imagesPerPage = 12

// Modal state
const previewImage = ref<Image | null>(null)
const isPreviewOpen = ref(false)
const deleteImage = ref<Image | null>(null)
const isDeleteModalOpen = ref(false)

/**
 * Get paginated images
 */
const paginatedImages = computed(() => {
  const start = (currentPage.value - 1) * imagesPerPage
  const end = start + imagesPerPage
  return imageStore.sortedImages.slice(start, end)
})

/**
 * Calculate total pages
 */
const totalPages = computed(() => {
  return Math.ceil(imageStore.imageCount / imagesPerPage)
})

/**
 * Check if previous page is available
 */
const hasPreviousPage = computed(() => currentPage.value > 1)

/**
 * Check if next page is available
 */
const hasNextPage = computed(() => currentPage.value < totalPages.value)

/**
 * Get page numbers for pagination display
 */
const pageNumbers = computed(() => {
  const pages: number[] = []
  const maxPagesToShow = 5
  const halfRange = Math.floor(maxPagesToShow / 2)

  let startPage = Math.max(1, currentPage.value - halfRange)
  let endPage = Math.min(totalPages.value, startPage + maxPagesToShow - 1)

  // Adjust start if we're near the end
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})

/**
 * Go to specific page
 */
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Scroll to top of gallery
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

/**
 * Go to previous page
 */
function previousPage() {
  if (hasPreviousPage.value) {
    goToPage(currentPage.value - 1)
  }
}

/**
 * Go to next page
 */
function nextPage() {
  if (hasNextPage.value) {
    goToPage(currentPage.value + 1)
  }
}

/**
 * Handle image preview
 */
function handlePreview(image: Image) {
  previewImage.value = image
  isPreviewOpen.value = true
}

/**
 * Close preview modal
 */
function closePreview() {
  isPreviewOpen.value = false
  // Wait for transition to complete before clearing image
  setTimeout(() => {
    previewImage.value = null
  }, 300)
}

/**
 * Handle delete request
 */
function handleDeleteRequest(image: Image) {
  deleteImage.value = image
  isDeleteModalOpen.value = true
}

/**
 * Confirm delete
 */
async function confirmDelete() {
  if (deleteImage.value) {
    await imageStore.deleteImage(deleteImage.value.id)
    isDeleteModalOpen.value = false
    deleteImage.value = null

    // If current page is now empty and it's not page 1, go to previous page
    if (paginatedImages.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  }
}

/**
 * Cancel delete
 */
function cancelDelete() {
  isDeleteModalOpen.value = false
  deleteImage.value = null
}

/**
 * Check if image is being deleted
 */
function isImageDeleting(imageId: string): boolean {
  return imageStore.isDeletingImage(imageId)
}

/**
 * Fetch images on mount
 */
onMounted(() => {
  if (!imageStore.isCleared) {
    imageStore.fetchImages()
  }
})
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="imageStore.isLoading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="text-gray-600">Loading images...</p>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="imageStore.imageCount === 0"
      class="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300"
    >
      <svg
        class="w-16 h-16 text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No images yet</h3>
      <p class="text-gray-600">Upload your first image to get started</p>
    </div>

    <!-- Gallery grid -->
    <div v-else>
      <!-- Image count header -->
      <div class="mb-6 flex items-center justify-between">
        <p class="text-sm text-gray-600">
          Showing
          <span class="font-semibold">{{ paginatedImages.length }}</span>
          of
          <span class="font-semibold">{{ imageStore.imageCount }}</span>
          {{ imageStore.imageCount === 1 ? 'image' : 'images' }}
        </p>
        <p v-if="totalPages > 1" class="text-sm text-gray-600">
          Page {{ currentPage }} of {{ totalPages }}
        </p>
      </div>

      <!-- Images grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        <ImageCard
          v-for="image in paginatedImages"
          :key="image.id"
          :image="image"
          :is-deleting="isImageDeleting(image.id)"
          @preview="handlePreview"
          @delete="handleDeleteRequest"
        />
      </div>

      <!-- Pagination controls -->
      <div v-if="totalPages > 1" class="flex items-center justify-center space-x-2">
        <!-- Previous button -->
        <button
          @click="previousPage"
          :disabled="!hasPreviousPage"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <!-- Page numbers -->
        <div class="flex space-x-2">
          <!-- First page if not in range -->
          <template v-if="pageNumbers.length > 0 && pageNumbers[0]! > 1">
            <button
              @click="goToPage(1)"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              1
            </button>
            <span v-if="pageNumbers[0]! > 2" class="px-2 py-2 text-gray-500">...</span>
          </template>

          <!-- Page number buttons -->
          <button
            v-for="page in pageNumbers"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>

          <!-- Last page if not in range -->
          <template v-if="pageNumbers.length > 0 && pageNumbers[pageNumbers.length - 1]! < totalPages">
            <span v-if="pageNumbers[pageNumbers.length - 1]! < totalPages - 1" class="px-2 py-2 text-gray-500">...</span>
            <button
              @click="goToPage(totalPages)"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {{ totalPages }}
            </button>
          </template>
        </div>

        <!-- Next button -->
        <button
          @click="nextPage"
          :disabled="!hasNextPage"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Image preview modal -->
    <ImagePreviewModal
      :image="previewImage"
      :is-open="isPreviewOpen"
      @close="closePreview"
    />

    <!-- Delete confirmation modal -->
    <DeleteConfirmModal
      :is-open="isDeleteModalOpen"
      :image-name="deleteImage?.filename || ''"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>
