// Sample user data for testing
export const mockUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  password: '$2a$10$mockHashedPassword',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Sample image data for testing
export const mockImage = {
  id: 'test-image-id-456',
  userId: 'test-user-id-123',
  filename: 'test-image.jpg',
  publicUrl: 'https://res.cloudinary.com/mock/image/upload/v1234567890/test-image.jpg',
  cloudinaryId: 'mock-cloudinary-id-789',
  uploadedAt: new Date('2024-01-01'),
  fileSize: 1024000,
  mimeType: 'image/jpeg',
};

// Multiple images for list testing
export const mockImages = [
  {
    id: 'test-image-id-1',
    userId: 'test-user-id-123',
    filename: 'image1.jpg',
    publicUrl: 'https://res.cloudinary.com/mock/image/upload/v1234567890/image1.jpg',
    cloudinaryId: 'mock-cloudinary-id-1',
    uploadedAt: new Date('2024-01-01'),
    fileSize: 1024000,
    mimeType: 'image/jpeg',
  },
  {
    id: 'test-image-id-2',
    userId: 'test-user-id-123',
    filename: 'image2.png',
    publicUrl: 'https://res.cloudinary.com/mock/image/upload/v1234567890/image2.png',
    cloudinaryId: 'mock-cloudinary-id-2',
    uploadedAt: new Date('2024-01-02'),
    fileSize: 2048000,
    mimeType: 'image/png',
  },
  {
    id: 'test-image-id-3',
    userId: 'test-user-id-123',
    filename: 'image3.gif',
    publicUrl: 'https://res.cloudinary.com/mock/image/upload/v1234567890/image3.gif',
    cloudinaryId: 'mock-cloudinary-id-3',
    uploadedAt: new Date('2024-01-03'),
    fileSize: 512000,
    mimeType: 'image/gif',
  },
];

// Cloudinary upload response
export const mockCloudinaryResponse = {
  public_id: 'mock-public-id-123',
  secure_url: 'https://res.cloudinary.com/mock/image/upload/mock-public-id-123.jpg',
  format: 'jpg',
  width: 800,
  height: 600,
  bytes: 102400,
  created_at: '2024-01-01T00:00:00Z',
};
