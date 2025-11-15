import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response, NextFunction } from 'express';
import { authenticate } from '../../../src/middleware/auth';
import { AuthRequest } from '../../../src/types';
import * as jwtUtils from '../../../src/utils/jwt';

// Mock the JWT utilities
vi.mock('../../../src/utils/jwt', () => ({
  verifyToken: vi.fn(),
  getTokenCookieName: vi.fn(() => 'auth_token'),
}));

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let statusSpy: any;
  let jsonSpy: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock response
    jsonSpy = vi.fn();
    statusSpy = vi.fn(() => ({ json: jsonSpy }));

    mockRes = {
      status: statusSpy,
      json: jsonSpy,
    };

    mockNext = vi.fn();
  });

  describe('authenticate', () => {
    it('should authenticate with valid token and set req.user', () => {
      const testUserId = 'user-123';
      const testEmail = 'test@example.com';

      mockReq = {
        cookies: {
          auth_token: 'valid-token',
        },
      };

      // Mock verifyToken to return valid payload
      vi.mocked(jwtUtils.verifyToken).mockReturnValue({
        userId: testUserId,
        email: testEmail,
      });

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(jwtUtils.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockReq.user).toEqual({
        id: testUserId,
        email: testEmail,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusSpy).not.toHaveBeenCalled();
    });

    it('should return 401 when no token is provided', () => {
      mockReq = {
        cookies: {},
      };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required. No token provided.',
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
    });

    it('should return 401 when token is undefined', () => {
      mockReq = {
        cookies: {
          auth_token: undefined,
        },
      };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required. No token provided.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      mockReq = {
        cookies: {
          auth_token: 'invalid-token',
        },
      };

      // Mock verifyToken to return null (invalid token)
      vi.mocked(jwtUtils.verifyToken).mockReturnValue(null);

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(jwtUtils.verifyToken).toHaveBeenCalledWith('invalid-token');
      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token.',
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
    });

    it('should return 401 when token is expired', () => {
      mockReq = {
        cookies: {
          auth_token: 'expired-token',
        },
      };

      // Mock verifyToken to return null (expired token)
      vi.mocked(jwtUtils.verifyToken).mockReturnValue(null);

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(jwtUtils.verifyToken).toHaveBeenCalledWith('expired-token');
      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully and return 401', () => {
      mockReq = {
        cookies: {
          auth_token: 'some-token',
        },
      };

      // Mock verifyToken to throw an error
      vi.mocked(jwtUtils.verifyToken).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication failed.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should use correct cookie name from getTokenCookieName', () => {
      mockReq = {
        cookies: {
          auth_token: 'valid-token',
        },
      };

      vi.mocked(jwtUtils.verifyToken).mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
      });

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(jwtUtils.getTokenCookieName).toHaveBeenCalled();
    });

    it('should not call next when authentication fails', () => {
      mockReq = {
        cookies: {},
      };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should set user with correct structure', () => {
      const testPayload = {
        userId: 'test-user-id',
        email: 'user@test.com',
      };

      mockReq = {
        cookies: {
          auth_token: 'valid-token',
        },
      };

      vi.mocked(jwtUtils.verifyToken).mockReturnValue(testPayload);

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual({
        id: testPayload.userId,
        email: testPayload.email,
      });
    });

    it('should handle missing cookies object', () => {
      mockReq = {} as AuthRequest;

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
