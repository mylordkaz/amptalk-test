import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from '../../../src/utils/password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash format
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should hash empty string', async () => {
      const hash = await hashPassword('');

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[aby]\$.{56}$/);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should reject empty password against valid hash', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('', hash);

      expect(isValid).toBe(false);
    });

    it('should handle case-sensitive passwords', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('testpassword123!', hash);

      expect(isValid).toBe(false);
    });

    it('should handle passwords with special characters', async () => {
      const password = 'P@ssw0rd!#$%^&*()';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept valid strong password', () => {
      const result = validatePasswordStrength('StrongPass123!');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject password shorter than 8 characters', () => {
      const result = validatePasswordStrength('Test1!');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long');
    });

    it('should reject empty password', () => {
      const result = validatePasswordStrength('');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase letter', () => {
      const result = validatePasswordStrength('weakpass123!');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should reject password without numbers', () => {
      const result = validatePasswordStrength('WeakPassword!');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must contain at least one number');
    });

    it('should reject password without special characters', () => {
      const result = validatePasswordStrength('WeakPassword123');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Password must contain at least one special character'
      );
    });

    it('should accept password with all allowed special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{};\':"|,.<>/?';

      for (const char of specialChars) {
        const password = `Password123${char}`;
        const result = validatePasswordStrength(password);

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      }
    });

    it('should accept very long password', () => {
      const longPassword = 'A'.repeat(49) + 'a1!';
      const result = validatePasswordStrength(longPassword);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept password with multiple uppercase, numbers, and special chars', () => {
      const result = validatePasswordStrength('MyStr0ng!P@ssw0rd#2024');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject password with only 7 characters even if complex', () => {
      const result = validatePasswordStrength('Abc12!@');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long');
    });

    it('should accept exactly 8 character password with all requirements', () => {
      const result = validatePasswordStrength('Pass123!');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
