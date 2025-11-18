import type {
  Image,
  ImageUploadResponse,
  ImagesResponse,
  ImageDeleteResponse,
} from '@/types/image'
import apiClient from './client'

export const imageApi = {
  async uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData()
    formData.append('image', file)

    const response = await apiClient.post<ImageUploadResponse>(
      '/api/images/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  async getUserImages(): Promise<ImagesResponse> {
    const response = await apiClient.get<ImagesResponse>('/api/images')
    return response.data
  },

  async getImageById(id: string): Promise<{ image: Image }> {
    const response = await apiClient.get<{ image: Image }>(`/api/images/${id}`)
    return response.data
  },

  async deleteImage(id: string): Promise<ImageDeleteResponse> {
    const response = await apiClient.delete<ImageDeleteResponse>(`/api/images/${id}`)
    return response.data
  },
}

export default imageApi
