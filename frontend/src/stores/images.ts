import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Image } from '@/types/image'
import { imageApi } from '@/api/images'

export const useImageStore = defineStore('images', () => {
  const images = ref<Image[]>([])
  const isLoading = ref<boolean>(false)
  const isUploading = ref<boolean>(false)
  const deletingImageIds = ref<string[]>([])
  const error = ref<string | null>(null)
  const isCleared = ref<boolean>(false)

  const sortedImages = computed(() => {
    return [...images.value].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )
  })

  const imageCount = computed(() => images.value.length)

  const isDeletingAny = computed(() => deletingImageIds.value.length > 0)

  const isDeletingImage = (id: string) => deletingImageIds.value.includes(id)

  async function fetchImages(): Promise<void> {
    // Prevent concurrent fetch requests
    if (isLoading.value) {
      return
    }

    isCleared.value = false
    isLoading.value = true
    error.value = null

    try {
      const response = await imageApi.getUserImages()
      if (isCleared.value) return
      images.value = response.images
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Failed to fetch images. Please try again.'
      if (!isCleared.value) {
        error.value = errorMessage
      }
      throw new Error(errorMessage, { cause: err })
    } finally {
      if (!isCleared.value) {
        isLoading.value = false
      }
    }
  }

  async function uploadImage(file: File): Promise<Image> {
    isCleared.value = false
    isUploading.value = true
    error.value = null

    try {
      const response = await imageApi.uploadImage(file)

      if (isCleared.value) {
        throw new Error('Store was cleared during upload')
      }

      // Add the new image to the beginning of the array
      images.value.unshift(response.image)

      return response.image
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Failed to upload image. Please try again.'
      if (!isCleared.value) {
        error.value = errorMessage
      }
      throw new Error(errorMessage, { cause: err })
    } finally {
      if (!isCleared.value) {
        isUploading.value = false
      }
    }
  }

  async function deleteImage(id: string): Promise<void> {
    if (isDeletingImage(id)) {
      return
    }

    isCleared.value = false
    // Add to the array of images being deleted
    deletingImageIds.value.push(id)
    error.value = null

    try {
      await imageApi.deleteImage(id)

      if (isCleared.value) return

      // Remove the image from the array
      images.value = images.value.filter((img) => img.id !== id)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Failed to delete image. Please try again.'
      if (!isCleared.value) {
        error.value = errorMessage
      }
      throw new Error(errorMessage, { cause: err })
    } finally {
      if (!isCleared.value) {
        // Remove from the array of images being deleted
        deletingImageIds.value = deletingImageIds.value.filter((deletingId) => deletingId !== id)
      }
    }
  }

  function clearError(): void {
    error.value = null
  }

  function clearImages(): void {
    isCleared.value = true
    images.value = []
    error.value = null
    isLoading.value = false
    isUploading.value = false
    deletingImageIds.value = []
  }

  return {
    images,
    isLoading,
    isUploading,
    deletingImageIds,
    error,
    sortedImages,
    imageCount,
    isDeletingAny,
    isDeletingImage,
    fetchImages,
    uploadImage,
    deleteImage,
    clearError,
    clearImages,
  }
})
