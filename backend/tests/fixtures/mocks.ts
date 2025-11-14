import { vi } from 'vitest';
import { Request, Response } from 'express';

// Mock Cloudinary
export const mockCloudinaryUploadStream = vi.fn((options, callback) => {
  const mockStream = {
    on: vi.fn(),
    emit: vi.fn(),
    pipe: vi.fn(function (this: any) {
      // Simulate successful upload
      callback(null, {
        public_id: 'mock-public-id-123',
        secure_url: 'https://res.cloudinary.com/mock/image/upload/mock-public-id-123.jpg',
        format: 'jpg',
        width: 800,
        height: 600,
      });
      return this;
    }),
  };
  return mockStream;
});

export const mockCloudinaryDestroy = vi.fn((publicId) => {
  return Promise.resolve({
    result: 'ok',
  });
});

export const mockCloudinary = {
  config: vi.fn(),
  uploader: {
    upload_stream: mockCloudinaryUploadStream,
    destroy: mockCloudinaryDestroy,
  },
};

// Mock Prisma Client
export const mockPrismaImage = {
  create: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
  delete: vi.fn(),
  update: vi.fn(),
};

export const mockPrismaUser = {
  create: vi.fn(),
  findUnique: vi.fn(),
  findMany: vi.fn(),
};

export const mockPrisma = {
  image: mockPrismaImage,
  user: mockPrismaUser,
  $disconnect: vi.fn(),
};

// Mock Express Request
export const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    file: undefined,
    files: undefined,
    ...overrides,
  };
};

// Mock Express Response
export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    sendStatus: vi.fn().mockReturnThis(),
  };
  return res;
};

// Mock file buffer
export const createMockFile = (
  filename: string = 'test-image.jpg',
  mimetype: string = 'image/jpeg',
  size: number = 1024
): Express.Multer.File => {
  return {
    fieldname: 'image',
    originalname: filename,
    encoding: '7bit',
    mimetype: mimetype,
    size: size,
    buffer: Buffer.from('mock-file-content'),
    destination: '',
    filename: filename,
    path: '',
    stream: null as any,
  };
};

// Reset all mocks helper
export const resetAllMocks = () => {
  mockCloudinaryUploadStream.mockClear();
  mockCloudinaryDestroy.mockClear();
  mockPrismaImage.create.mockClear();
  mockPrismaImage.findMany.mockClear();
  mockPrismaImage.findUnique.mockClear();
  mockPrismaImage.delete.mockClear();
  mockPrismaImage.update.mockClear();
  mockPrismaUser.create.mockClear();
  mockPrismaUser.findUnique.mockClear();
  mockPrismaUser.findMany.mockClear();
};
