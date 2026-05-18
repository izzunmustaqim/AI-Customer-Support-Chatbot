/**
 * Tests for Dashboard Auth Utility
 */

// Must use jest.fn() inside jest.mock factory to avoid hoisting issues
jest.mock('next/headers', () => {
  const mockGet = jest.fn();
  const mockSet = jest.fn();
  const mockDelete = jest.fn();
  return {
    cookies: jest.fn().mockResolvedValue({
      get: mockGet,
      set: mockSet,
      delete: mockDelete,
    }),
    __mockGet: mockGet,
    __mockSet: mockSet,
    __mockDelete: mockDelete,
  };
});

// Access mocks after module is loaded
const { __mockGet: mockGet } = jest.requireMock('next/headers');

import {
  verifyPassword,
  isDashboardAuthenticated,
} from '@/lib/dashboard-auth';

describe('Dashboard Auth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.DASHBOARD_PASSWORD = 'test-password-123';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-secret';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', () => {
      expect(verifyPassword('test-password-123')).toBe(true);
    });

    it('should return false for incorrect password', () => {
      expect(verifyPassword('wrong-password')).toBe(false);
    });

    it('should return false when DASHBOARD_PASSWORD is not set', () => {
      delete process.env.DASHBOARD_PASSWORD;
      expect(verifyPassword('any-password')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(verifyPassword('')).toBe(false);
    });
  });

  describe('isDashboardAuthenticated', () => {
    it('should return false when no cookie is set', async () => {
      mockGet.mockReturnValue(undefined);
      const result = await isDashboardAuthenticated();
      expect(result).toBe(false);
    });

    it('should return false when cookie value is invalid', async () => {
      mockGet.mockReturnValue({ value: 'invalid-token' });
      const result = await isDashboardAuthenticated();
      expect(result).toBe(false);
    });

    it('should return true when cookie matches expected token', async () => {
      const expectedToken = Buffer.from(
        `test-password-123::test-secret`
      ).toString('base64');
      mockGet.mockReturnValue({ value: expectedToken });

      const result = await isDashboardAuthenticated();
      expect(result).toBe(true);
    });

    it('should return false when DASHBOARD_PASSWORD is not set', async () => {
      delete process.env.DASHBOARD_PASSWORD;
      const result = await isDashboardAuthenticated();
      expect(result).toBe(false);
    });
  });
});
