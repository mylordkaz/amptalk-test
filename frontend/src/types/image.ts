export interface Image {
  id: string
  userId: string
  filename: string
  publicUrl: string
  cloudinaryId: string
  uploadedAt: string
  fileSize: number
  mimeType: string
}

export interface ImageUploadResponse {
  message: string
  image: Image
}

export interface ImagesResponse {
  images: Image[]
}

export interface ImageDeleteResponse {
  message: string
}
