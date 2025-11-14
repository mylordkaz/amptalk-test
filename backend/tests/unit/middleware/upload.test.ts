import { describe, it, expect, beforeEach } from 'vitest';
import { upload } from '../../../src/middleware/upload';
import { createMockFile, mockRequest } from '../../fixtures/mocks';

describe('Upload Middleware', () => {
  describe('File Filter', () => {
    it('should accept image files', () => {
      const req = mockRequest() as any;
      const file = createMockFile('test.jpg', 'image/jpeg');

      let callbackResult: { error: Error | null; accepted: boolean } = {
        error: null,
        accepted: false,
      };

      // @ts-ignore - accessing private fileFilter
      upload.fileFilter(req, file, (error: Error | null, accepted: boolean) => {
        callbackResult = { error, accepted };
      });

      expect(callbackResult.error).toBeNull();
      expect(callbackResult.accepted).toBe(true);
    });

    it('should accept PNG images', () => {
      const req = mockRequest() as any;
      const file = createMockFile('test.png', 'image/png');

      let callbackResult: { error: Error | null; accepted: boolean } = {
        error: null,
        accepted: false,
      };

      // @ts-ignore - accessing private fileFilter
      upload.fileFilter(req, file, (error: Error | null, accepted: boolean) => {
        callbackResult = { error, accepted };
      });

      expect(callbackResult.error).toBeNull();
      expect(callbackResult.accepted).toBe(true);
    });

    it('should accept GIF images', () => {
      const req = mockRequest() as any;
      const file = createMockFile('test.gif', 'image/gif');

      let callbackResult: { error: Error | null; accepted: boolean } = {
        error: null,
        accepted: false,
      };

      // @ts-ignore - accessing private fileFilter
      upload.fileFilter(req, file, (error: Error | null, accepted: boolean) => {
        callbackResult = { error, accepted };
      });

      expect(callbackResult.error).toBeNull();
      expect(callbackResult.accepted).toBe(true);
    });

    it('should reject non-image files', () => {
      const req = mockRequest() as any;
      const file = createMockFile('test.pdf', 'application/pdf');

      let callbackResult: { error: Error | null; accepted: boolean } = {
        error: null,
        accepted: false,
      };

      // @ts-ignore - accessing private fileFilter
      upload.fileFilter(req, file, (error: Error | null, accepted: boolean) => {
        callbackResult = { error, accepted };
      });

      expect(callbackResult.error).toBeInstanceOf(Error);
      expect(callbackResult.error?.message).toBe('Only image files are allowed!');
    });

    it('should reject text files', () => {
      const req = mockRequest() as any;
      const file = createMockFile('test.txt', 'text/plain');

      let callbackResult: { error: Error | null; accepted: boolean } = {
        error: null,
        accepted: false,
      };

      // @ts-ignore - accessing private fileFilter
      upload.fileFilter(req, file, (error: Error | null, accepted: boolean) => {
        callbackResult = { error, accepted };
      });

      expect(callbackResult.error).toBeInstanceOf(Error);
      expect(callbackResult.error?.message).toBe('Only image files are allowed!');
    });

    it('should reject video files', () => {
      const req = mockRequest() as any;
      const file = createMockFile('test.mp4', 'video/mp4');

      let callbackResult: { error: Error | null; accepted: boolean } = {
        error: null,
        accepted: false,
      };

      // @ts-ignore - accessing private fileFilter
      upload.fileFilter(req, file, (error: Error | null, accepted: boolean) => {
        callbackResult = { error, accepted };
      });

      expect(callbackResult.error).toBeInstanceOf(Error);
      expect(callbackResult.error?.message).toBe('Only image files are allowed!');
    });
  });

  describe('Storage Configuration', () => {
    it('should use memory storage', () => {
      // @ts-ignore - accessing storage property
      expect(upload.storage).toBeDefined();
      // @ts-ignore - accessing storage property
      expect(upload.storage.constructor.name).toBe('MemoryStorage');
    });
  });

  describe('File Size Limits', () => {
    it('should have a 5MB file size limit configured', () => {
      // @ts-ignore - accessing limits property
      expect(upload.limits).toBeDefined();
      // @ts-ignore - accessing limits property
      expect(upload.limits.fileSize).toBe(5 * 1024 * 1024); // 5MB
    });
  });
});
