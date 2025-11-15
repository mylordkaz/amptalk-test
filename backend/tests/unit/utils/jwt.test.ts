import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  generateToken,
  verifyToken,
  createTokenCookie,
  clearTokenCookie,
  getTokenCookieName,
  JwtPayload,
} from '../../../src/utils/jwt';
import { Response } from 'express';

describe('JWT Utilities', () => {
  const testUserId = 'test-user-id-123';
  const testEmail = 'test@example.com';
  const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testUserId, testEmail);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should include userId and email in token payload', () => {
      const token = generateToken(testUserId, testEmail);
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      expect(decoded.userId).toBe(testUserId);
      expect(decoded.email).toBe(testEmail);
    });

    it('should include expiration time in token', () => {
      const token = generateToken(testUserId, testEmail);
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('should generate different tokens for different users', () => {
      const token1 = generateToken('user1', 'user1@example.com');
      const token2 = generateToken('user2', 'user2@example.com');

      expect(token1).not.toBe(token2);
    });

    it('should generate different tokens even for same user (different iat)', () => {
      const token1 = generateToken(testUserId, testEmail);

      // Wait a tiny bit to ensure different issued-at time
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      const token2 = generateToken(testUserId, testEmail);
      vi.useRealTimers();

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode valid token', () => {
      const token = generateToken(testUserId, testEmail);
      const decoded = verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(testUserId);
      expect(decoded?.email).toBe(testEmail);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create a token that expires immediately
      const expiredToken = jwt.sign(
        { userId: testUserId, email: testEmail },
        JWT_SECRET,
        { expiresIn: '0s' }
      );

      // Wait a bit to ensure token is expired
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      const decoded = verifyToken(expiredToken);
      vi.useRealTimers();

      expect(decoded).toBeNull();
    });

    it('should return null for token with wrong signature', () => {
      const token = generateToken(testUserId, testEmail);
      const tamperedToken = token.slice(0, -5) + 'xxxxx'; // Tamper with signature
      const decoded = verifyToken(tamperedToken);

      expect(decoded).toBeNull();
    });

    it('should return null for malformed token', () => {
      const malformedTokens = [
        '',
        'not-a-token',
        'only.two.parts',
        'too.many.parts.here.extra',
      ];

      malformedTokens.forEach((token) => {
        const decoded = verifyToken(token);
        expect(decoded).toBeNull();
      });
    });

    it('should verify token signed with correct secret only', () => {
      const token = generateToken(testUserId, testEmail);
      const decoded = verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(testUserId);
    });
  });

  describe('createTokenCookie', () => {
    let mockRes: Partial<Response>;
    let cookieSpy: any;

    beforeEach(() => {
      cookieSpy = vi.fn();
      mockRes = {
        cookie: cookieSpy,
      };
    });

    it('should set cookie with token', () => {
      const token = 'test-token-123';
      createTokenCookie(mockRes as Response, token);

      expect(cookieSpy).toHaveBeenCalledTimes(1);
      expect(cookieSpy).toHaveBeenCalledWith(
        'auth_token',
        token,
        expect.objectContaining({
          httpOnly: true,
        })
      );
    });

    it('should set httpOnly flag to true', () => {
      const token = 'test-token-123';
      createTokenCookie(mockRes as Response, token);

      expect(cookieSpy).toHaveBeenCalledWith(
        'auth_token',
        token,
        expect.objectContaining({
          httpOnly: true,
        })
      );
    });

    it('should set secure flag based on environment', () => {
      const token = 'test-token-123';
      createTokenCookie(mockRes as Response, token);

      const options = cookieSpy.mock.calls[0][2];
      expect(options).toHaveProperty('secure');
      // In test environment, secure should be false
      expect(options.secure).toBe(false);
    });

    it('should set sameSite based on environment', () => {
      const token = 'test-token-123';
      createTokenCookie(mockRes as Response, token);

      const options = cookieSpy.mock.calls[0][2];
      expect(options).toHaveProperty('sameSite');
      // In test/development environment, sameSite should be 'lax'
      expect(options.sameSite).toBe('lax');
    });

    it('should set maxAge property', () => {
      const token = 'test-token-123';
      createTokenCookie(mockRes as Response, token);

      const options = cookieSpy.mock.calls[0][2];
      expect(options).toHaveProperty('maxAge');
      expect(typeof options.maxAge).toBe('number');
      expect(options.maxAge).toBeGreaterThan(0);
    });
  });

  describe('clearTokenCookie', () => {
    let mockRes: Partial<Response>;
    let clearCookieSpy: any;

    beforeEach(() => {
      clearCookieSpy = vi.fn();
      mockRes = {
        clearCookie: clearCookieSpy,
      };
    });

    it('should clear the auth_token cookie', () => {
      clearTokenCookie(mockRes as Response);

      expect(clearCookieSpy).toHaveBeenCalledTimes(1);
      expect(clearCookieSpy).toHaveBeenCalledWith(
        'auth_token',
        expect.any(Object)
      );
    });

    it('should clear cookie with correct options', () => {
      clearTokenCookie(mockRes as Response);

      expect(clearCookieSpy).toHaveBeenCalledWith(
        'auth_token',
        expect.objectContaining({
          httpOnly: true,
        })
      );
    });

    it('should use same sameSite setting as createTokenCookie', () => {
      clearTokenCookie(mockRes as Response);

      const options = clearCookieSpy.mock.calls[0][1];
      expect(options).toHaveProperty('sameSite');
      // In test/development environment
      expect(options.sameSite).toBe('lax');
    });
  });

  describe('getTokenCookieName', () => {
    it('should return the cookie name', () => {
      const cookieName = getTokenCookieName();

      expect(cookieName).toBe('auth_token');
      expect(typeof cookieName).toBe('string');
    });

    it('should return consistent cookie name', () => {
      const name1 = getTokenCookieName();
      const name2 = getTokenCookieName();

      expect(name1).toBe(name2);
    });
  });
});
