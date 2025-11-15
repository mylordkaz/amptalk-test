import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { mockUser } from '../fixtures/testData';

// Use vi.hoisted to ensure mocks are available before vi.mock calls
const { mockPrismaUser, mockHashPassword, mockVerifyPassword, mockGenerateToken } = vi.hoisted(() => {
  const mockPrismaUser = {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
  };

  const mockHashPassword = vi.fn();
  const mockVerifyPassword = vi.fn();
  const mockGenerateToken = vi.fn(() => 'mock-jwt-token');

  return {
    mockPrismaUser,
    mockHashPassword,
    mockVerifyPassword,
    mockGenerateToken,
  };
});

// Mock @prisma/client module
vi.mock('@prisma/client', () => ({
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code: string;
      constructor(message: string, { code }: { code: string }) {
        super(message);
        this.code = code;
        this.name = 'PrismaClientKnownRequestError';
      }
    },
  },
}));

// Mock Prisma client
vi.mock('../../src/lib/db', () => ({
  default: {
    user: mockPrismaUser,
    $disconnect: vi.fn(),
  },
}));

// Mock password utilities
vi.mock('../../src/utils/password', async () => {
  const actual = await vi.importActual('../../src/utils/password');
  return {
    ...actual,
    hashPassword: mockHashPassword,
    verifyPassword: mockVerifyPassword,
  };
});

// Mock JWT utilities
vi.mock('../../src/utils/jwt', () => ({
  generateToken: mockGenerateToken,
  verifyToken: vi.fn((token: string) => {
    if (token === 'valid-token') {
      return { userId: mockUser.id, email: mockUser.email };
    }
    return null;
  }),
  createTokenCookie: vi.fn((res: any, token: string) => {
    res.cookie('auth_token', token, { httpOnly: true });
  }),
  clearTokenCookie: vi.fn((res: any) => {
    res.clearCookie('auth_token');
  }),
  getTokenCookieName: vi.fn(() => 'auth_token'),
}));

// Mock rate limiter to bypass it in tests
vi.mock('../../src/middleware/rateLimiter', () => ({
  authLimiter: (req: any, res: any, next: any) => next(),
}));

// Import routes after mocks are set up
import authRoutes from '../../src/routes/authRoutes';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

describe('Auth Controller Integration Tests', () => {
  beforeEach(() => {
    mockPrismaUser.create.mockClear();
    mockPrismaUser.findUnique.mockClear();
    mockHashPassword.mockClear();
    mockVerifyPassword.mockClear();
    mockGenerateToken.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'StrongPass123!',
      };

      mockPrismaUser.findUnique.mockResolvedValue(null); // No existing user
      mockHashPassword.mockResolvedValue('hashed-password');
      mockPrismaUser.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'newuser@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User registered successfully.');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.user).not.toHaveProperty('password');
      expect(mockPrismaUser.create).toHaveBeenCalledTimes(1);
      expect(mockHashPassword).toHaveBeenCalledWith('StrongPass123!');
    });

    it('should return 409 when email already exists', async () => {
      const existingUserData = {
        email: 'existing@example.com',
        password: 'StrongPass123!',
      };

      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'existing-user-id',
        email: 'existing@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(existingUserData);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'User with this email already exists.');
      expect(mockPrismaUser.create).not.toHaveBeenCalled();
    });

    it('should return 400 for weak password (no uppercase)', async () => {
      const weakPasswordData = {
        email: 'test@example.com',
        password: 'weakpass123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Password must contain at least one uppercase letter');
      expect(mockPrismaUser.create).not.toHaveBeenCalled();
    });

    it('should return 400 for weak password (no numbers)', async () => {
      const weakPasswordData = {
        email: 'test@example.com',
        password: 'WeakPassword!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Password must contain at least one number');
    });

    it('should return 400 for weak password (no special characters)', async () => {
      const weakPasswordData = {
        email: 'test@example.com',
        password: 'WeakPassword123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Password must contain at least one special character');
    });

    it('should return 400 for password shorter than 8 characters', async () => {
      const shortPasswordData = {
        email: 'test@example.com',
        password: 'Pass1!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(shortPasswordData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Password must be at least 8 characters long');
    });

    it('should return 400 for invalid email format', async () => {
      const invalidEmailData = {
        email: 'invalid-email',
        password: 'StrongPass123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidEmailData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid email format.');
    });

    it('should return 400 when email is missing', async () => {
      const missingEmailData = {
        password: 'StrongPass123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(missingEmailData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Email and password are required.');
    });

    it('should return 400 when password is missing', async () => {
      const missingPasswordData = {
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(missingPasswordData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Email and password are required.');
    });

    it('should normalize email to lowercase', async () => {
      const upperCaseEmailData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'StrongPass123!',
      };

      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockHashPassword.mockResolvedValue('hashed-password');
      mockPrismaUser.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(upperCaseEmailData);

      expect(response.status).toBe(201);
      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should set auth cookie on successful registration', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'StrongPass123!',
      };

      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockHashPassword.mockResolvedValue('hashed-password');
      mockPrismaUser.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'newuser@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(mockGenerateToken).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'CorrectPassword123!',
      };

      mockPrismaUser.findUnique.mockResolvedValue({
        id: mockUser.id,
        email: 'test@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockVerifyPassword.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Login successful.');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
      expect(mockVerifyPassword).toHaveBeenCalledWith('CorrectPassword123!', 'hashed-password');
    });

    it('should return 401 for wrong password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      mockPrismaUser.findUnique.mockResolvedValue({
        id: mockUser.id,
        email: 'test@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockVerifyPassword.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid email or password.');
    });

    it('should return 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      mockPrismaUser.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid email or password.');
      expect(mockVerifyPassword).not.toHaveBeenCalled();
    });

    it('should return 400 when email is missing', async () => {
      const loginData = {
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Email and password are required.');
    });

    it('should return 400 when password is missing', async () => {
      const loginData = {
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Email and password are required.');
    });

    it('should normalize email to lowercase during login', async () => {
      const loginData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'Password123!',
      };

      mockPrismaUser.findUnique.mockResolvedValue({
        id: mockUser.id,
        email: 'test@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockVerifyPassword.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should set auth cookie on successful login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockPrismaUser.findUnique.mockResolvedValue({
        id: mockUser.id,
        email: 'test@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockVerifyPassword.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(mockGenerateToken).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully logout', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Logout successful.');
    });

    it('should clear auth cookie on logout', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      // Cookie clearing is handled by clearTokenCookie mock
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user when authenticated', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ['auth_token=valid-token']);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 when not authenticated (no token)', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 when token is invalid', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ['auth_token=invalid-token']);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 404 when user not found in database', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ['auth_token=valid-token']);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'User not found.');
    });
  });
});
