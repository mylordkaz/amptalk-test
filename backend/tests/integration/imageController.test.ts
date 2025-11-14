import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { mockImage, mockImages, mockUser, mockCloudinaryResponse } from '../fixtures/testData';

// Use vi.hoisted to ensure mocks are available before vi.mock calls
const { mockCloudinaryUploadStream, mockCloudinaryDestroy, mockPrismaImage } = vi.hoisted(() => {
  const mockCloudinaryUploadStream = vi.fn((options, callback) => {
    const mockStream = {
      writable: true,
      on: vi.fn().mockReturnThis(),
      once: vi.fn().mockReturnThis(),
      emit: vi.fn(),
      write: vi.fn().mockReturnValue(true),
      end: vi.fn(() => {
        // Simulate successful upload after stream ends
        process.nextTick(() => {
          callback(null, {
            public_id: 'mock-public-id-123',
            secure_url: 'https://res.cloudinary.com/mock/image/upload/mock-public-id-123.jpg',
            format: 'jpg',
            width: 800,
            height: 600,
          });
        });
      }),
      removeListener: vi.fn().mockReturnThis(),
      removeAllListeners: vi.fn().mockReturnThis(),
    };
    // Trigger end() when pipe is called
    setTimeout(() => {
      mockStream.end();
    }, 10);
    return mockStream;
  });

  const mockCloudinaryDestroy = vi.fn(() => Promise.resolve({ result: 'ok' }));

  const mockPrismaImage = {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  };

  return {
    mockCloudinaryUploadStream,
    mockCloudinaryDestroy,
    mockPrismaImage,
  };
});

// Mock the modules
vi.mock('../../src/config/cloudinary', () => ({
  default: {
    config: vi.fn(),
    uploader: {
      upload_stream: mockCloudinaryUploadStream,
      destroy: mockCloudinaryDestroy,
    },
  },
}));

vi.mock('../../src/lib/db', () => ({
  default: {
    image: mockPrismaImage,
    $disconnect: vi.fn(),
  },
}));

// Import routes after mocks are set up
import imageRoutes from '../../src/routes/imageRoutes';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/images', imageRoutes);

describe('Image Controller Integration Tests', () => {
  beforeEach(() => {
    mockCloudinaryUploadStream.mockClear();
    mockCloudinaryDestroy.mockClear();
    mockPrismaImage.create.mockClear();
    mockPrismaImage.findMany.mockClear();
    mockPrismaImage.findUnique.mockClear();
    mockPrismaImage.delete.mockClear();
    mockPrismaImage.update.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/images/upload', () => {
    it('should successfully upload an image', async () => {
      const userId = 'test-user-id-123';

      // Mock Prisma response
      mockPrismaImage.create.mockResolvedValue({
        ...mockImage,
        userId,
      });

      const response = await request(app)
        .post('/api/images/upload')
        .field('userId', userId)
        .attach('image', Buffer.from('fake-image-content'), 'test-image.jpg');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Image uploaded successfully');
      expect(response.body).toHaveProperty('image');
      expect(mockPrismaImage.create).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when no file is uploaded', async () => {
      const userId = 'test-user-id-123';

      const response = await request(app)
        .post('/api/images/upload')
        .field('userId', userId);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'No file uploaded');
      expect(mockPrismaImage.create).not.toHaveBeenCalled();
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/api/images/upload')
        .attach('image', Buffer.from('fake-image-content'), 'test-image.jpg');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'User ID is required');
      expect(mockPrismaImage.create).not.toHaveBeenCalled();
    });

    it('should handle Cloudinary upload errors', async () => {
      const userId = 'test-user-id-123';

      // Mock Cloudinary to return an error
      mockCloudinaryUploadStream.mockImplementationOnce((options, callback) => {
        const mockStream = {
          writable: true,
          on: vi.fn().mockReturnThis(),
          once: vi.fn().mockReturnThis(),
          emit: vi.fn(),
          write: vi.fn().mockReturnValue(true),
          end: vi.fn(() => {
            process.nextTick(() => {
              callback(new Error('Cloudinary upload failed'), null);
            });
          }),
          removeListener: vi.fn().mockReturnThis(),
          removeAllListeners: vi.fn().mockReturnThis(),
        };
        setTimeout(() => {
          mockStream.end();
        }, 10);
        return mockStream;
      });

      const response = await request(app)
        .post('/api/images/upload')
        .field('userId', userId)
        .attach('image', Buffer.from('fake-image-content'), 'test-image.jpg');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to upload image');
      expect(mockPrismaImage.create).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const userId = 'test-user-id-123';

      // Mock Prisma to throw an error
      mockPrismaImage.create.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/images/upload')
        .field('userId', userId)
        .attach('image', Buffer.from('fake-image-content'), 'test-image.jpg');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to upload image');
    });
  });

  describe('GET /api/images/user/:userId', () => {
    it('should return all images for a user', async () => {
      const userId = 'test-user-id-123';

      mockPrismaImage.findMany.mockResolvedValue(mockImages);

      const response = await request(app).get(`/api/images/user/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('images');
      expect(response.body.images).toHaveLength(3);
      expect(mockPrismaImage.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { uploadedAt: 'desc' },
      });
    });

    it('should return empty array when user has no images', async () => {
      const userId = 'test-user-id-456';

      mockPrismaImage.findMany.mockResolvedValue([]);

      const response = await request(app).get(`/api/images/user/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('images');
      expect(response.body.images).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      const userId = 'test-user-id-123';

      mockPrismaImage.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get(`/api/images/user/${userId}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch images');
    });
  });

  describe('GET /api/images/:id', () => {
    it('should return a single image by ID', async () => {
      const imageId = 'test-image-id-456';

      mockPrismaImage.findUnique.mockResolvedValue({
        ...mockImage,
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      });

      const response = await request(app).get(`/api/images/${imageId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('image');
      expect(response.body.image).toHaveProperty('id', mockImage.id);
      expect(response.body.image).toHaveProperty('user');
      expect(mockPrismaImage.findUnique).toHaveBeenCalledWith({
        where: { id: imageId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    });

    it('should return 404 when image is not found', async () => {
      const imageId = 'non-existent-id';

      mockPrismaImage.findUnique.mockResolvedValue(null);

      const response = await request(app).get(`/api/images/${imageId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Image not found');
    });

    it('should handle database errors', async () => {
      const imageId = 'test-image-id-456';

      mockPrismaImage.findUnique.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get(`/api/images/${imageId}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch image');
    });
  });

  describe('DELETE /api/images/:id', () => {
    it('should successfully delete an image', async () => {
      const imageId = 'test-image-id-456';

      mockPrismaImage.findUnique.mockResolvedValue(mockImage);
      mockPrismaImage.delete.mockResolvedValue(mockImage);
      mockCloudinaryDestroy.mockResolvedValue({ result: 'ok' });

      const response = await request(app).delete(`/api/images/${imageId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Image deleted successfully');
      expect(mockCloudinaryDestroy).toHaveBeenCalledWith(mockImage.cloudinaryId);
      expect(mockPrismaImage.delete).toHaveBeenCalledWith({ where: { id: imageId } });
    });

    it('should return 404 when image is not found', async () => {
      const imageId = 'non-existent-id';

      mockPrismaImage.findUnique.mockResolvedValue(null);

      const response = await request(app).delete(`/api/images/${imageId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Image not found');
      expect(mockCloudinaryDestroy).not.toHaveBeenCalled();
      expect(mockPrismaImage.delete).not.toHaveBeenCalled();
    });

    it('should handle Cloudinary deletion errors', async () => {
      const imageId = 'test-image-id-456';

      mockPrismaImage.findUnique.mockResolvedValue(mockImage);
      mockCloudinaryDestroy.mockRejectedValue(new Error('Cloudinary deletion failed'));

      const response = await request(app).delete(`/api/images/${imageId}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to delete image');
    });

    it('should handle database deletion errors', async () => {
      const imageId = 'test-image-id-456';

      mockPrismaImage.findUnique.mockResolvedValue(mockImage);
      mockCloudinaryDestroy.mockResolvedValue({ result: 'ok' });
      mockPrismaImage.delete.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete(`/api/images/${imageId}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to delete image');
    });
  });
});
