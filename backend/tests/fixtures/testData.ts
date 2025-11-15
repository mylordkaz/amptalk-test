// Sample user data for testing
export const mockUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  password: '$2a$10$mockHashedPassword',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Another user for ownership verification tests
export const mockOtherUser = {
  id: 'test-user-id-999',
  email: 'other@example.com',
  password: '$2a$10$mockHashedPassword2',
  createdAt: new Date('2024-01-02'),
  updatedAt: new Date('2024-01-02'),
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

// Image owned by another user for ownership verification tests
export const mockOtherUserImage = {
  id: 'test-image-id-other',
  userId: 'test-user-id-999',
  filename: 'other-user-image.jpg',
  publicUrl: 'https://res.cloudinary.com/mock/image/upload/v1234567890/other-image.jpg',
  cloudinaryId: 'mock-cloudinary-id-other',
  uploadedAt: new Date('2024-01-04'),
  fileSize: 1536000,
  mimeType: 'image/jpeg',
};

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

// Auth test credentials
export const validCredentials = {
  email: 'valid@example.com',
  password: 'ValidPass123!',
};

export const invalidCredentials = {
  wrongPassword: {
    email: 'test@example.com',
    password: 'WrongPassword123!',
  },
  nonExistentUser: {
    email: 'nonexistent@example.com',
    password: 'Password123!',
  },
  weakPassword: {
    email: 'test@example.com',
    password: 'weak',
  },
  invalidEmail: {
    email: 'invalid-email',
    password: 'ValidPass123!',
  },
};

// Password test cases
export const passwordTestCases = {
  valid: 'StrongPass123!',
  tooShort: 'Pass1!',
  noUppercase: 'weakpass123!',
  noNumber: 'WeakPassword!',
  noSpecialChar: 'WeakPassword123',
  missingAll: 'weak',
};

// Mock JWT tokens
export const mockTokens = {
  valid: 'valid-jwt-token-123',
  invalid: 'invalid-jwt-token',
  expired: 'expired-jwt-token',
  malformed: 'malformed.token',
};
