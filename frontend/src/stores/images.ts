import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Image } from '@/types/image'
import { imageApi } from '@/api/images'

export interface UploadStatus {
  filename: string
  status: 'pending' | 'uploading' | 'success' | 'failed'
  error?: string
}

export const useImageStore = defineStore('images', () => {
  const images = ref<Image[]>([])
  const isLoading = ref<boolean>(false)
  const isUploading = ref<boolean>(false)
  const deletingImageIds = ref<string[]>([])
  const error = ref<string | null>(null)
  const isCleared = ref<boolean>(false)

  // Multi-upload tracking
  const uploadingFiles = ref<Map<string, UploadStatus>>(new Map())
  const totalUploadCount = ref<number>(0)

  const sortedImages = computed(() => {
    return [...images.value].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )
  })

  const imageCount = computed(() => images.value.length)

  const isDeletingAny = computed(() => deletingImageIds.value.length > 0)

  const isDeletingImage = (id: string) => deletingImageIds.value.includes(id)

  // Multi-upload computed properties
  const uploadingCount = computed(() => {
    let count = 0
    uploadingFiles.value.forEach((status) => {
      if (status.status === 'uploading' || status.status === 'pending') {
        count++
      }
    })
    return count
  })

  const uploadedCount = computed(() => {
    let count = 0
    uploadingFiles.value.forEach((status) => {
      if (status.status === 'success' || status.status === 'failed') {
        count++
      }
    })
    return count
  })

  const uploadProgress = computed(() => {
    if (totalUploadCount.value === 0) return 0
    return Math.round((uploadedCount.value / totalUploadCount.value) * 100)
  })

  const isUploadingAny = computed(() => uploadingCount.value > 0 || isUploading.value)

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
      throw new Error(errorMessage)
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
      throw new Error(errorMessage)
    } finally {
      if (!isCleared.value) {
        isUploading.value = false
      }
    }
  }

  async function uploadImages(files: File[]): Promise<{ success: number; failed: number; errors: string[] }> {
    isCleared.value = false

    // Only clear non-validation errors
    const validationError = error.value?.startsWith('[VALIDATION]') ? error.value : null
    error.value = validationError

    // Initialize upload tracking
    uploadingFiles.value.clear()
    totalUploadCount.value = files.length

    // Create unique IDs for each file and set initial status
    const fileIds = new Map<File, string>()
    files.forEach((file, index) => {
      const fileId = `${file.name}-${Date.now()}-${index}`
      fileIds.set(file, fileId)
      uploadingFiles.value.set(fileId, {
        filename: file.name,
        status: 'pending',
      })
    })

    const CONCURRENCY_LIMIT = 3
    let successCount = 0
    let failedCount = 0
    const errorMessages: string[] = []

    // Upload files in batches with concurrency limit
    const uploadFile = async (file: File): Promise<void> => {
      const fileId = fileIds.get(file)!
      const status = uploadingFiles.value.get(fileId)!

      try {
        // Update status to uploading
        uploadingFiles.value.set(fileId, { ...status, status: 'uploading' })

        const response = await imageApi.uploadImage(file)

        if (isCleared.value) return

        // Add the new image to the beginning of the array
        images.value.unshift(response.image)

        // Update status to success
        uploadingFiles.value.set(fileId, { ...status, status: 'success' })
        successCount++
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Upload failed'

        if (!isCleared.value) {
          uploadingFiles.value.set(fileId, {
            ...status,
            status: 'failed',
            error: errorMessage
          })
          errorMessages.push(`${file.name}: ${errorMessage}`)
          failedCount++
        }
      }
    }

    // Process files in batches
    for (let i = 0; i < files.length; i += CONCURRENCY_LIMIT) {
      const batch = files.slice(i, i + CONCURRENCY_LIMIT)
      await Promise.allSettled(batch.map(file => uploadFile(file)))

      if (isCleared.value) break
    }

    // Set error if any uploads failed
    if (failedCount > 0 && !isCleared.value) {
      const uploadError = `[UPLOAD] ${failedCount} of ${files.length} uploads failed:\n${errorMessages.join('\n')}`

      // If there's already a validation error, append upload error
      if (error.value?.startsWith('[VALIDATION]')) {
        error.value = `${error.value}\n\n${uploadError}`
      } else {
        error.value = uploadError
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      errors: errorMessages
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
      throw new Error(errorMessage)
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
    // Clear multi-upload state
    uploadingFiles.value.clear()
    totalUploadCount.value = 0
  }

  return {
    images,
    isLoading,
    isUploading,
    deletingImageIds,
    error,
    isCleared,
    sortedImages,
    imageCount,
    isDeletingAny,
    isDeletingImage,
    // Multi-upload state
    uploadingFiles,
    totalUploadCount,
    uploadingCount,
    uploadedCount,
    uploadProgress,
    isUploadingAny,
    // Actions
    fetchImages,
    uploadImage,
    uploadImages,
    deleteImage,
    clearError,
    clearImages,
  }
})
