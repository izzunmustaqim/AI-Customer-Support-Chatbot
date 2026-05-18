/**
 * Tests for API Route: POST/DELETE /api/dashboard-auth
 */

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status || 200,
      json: async () => body,
    }),
  },
}));

// Mock dashboard auth functions
const mockSetAuthCookie = jest.fn().mockResolvedValue(undefined);
const mockClearAuthCookie = jest.fn().mockResolvedValue(undefined);
const mockVerifyPassword = jest.fn();

jest.mock('@/lib/dashboard-auth', () => ({
  verifyPassword: (...args: unknown[]) => mockVerifyPassword(...args),
  setAuthCookie: (...args: unknown[]) => mockSetAuthCookie(...args),
  clearAuthCookie: (...args: unknown[]) => mockClearAuthCookie(...args),
}));

import { POST, DELETE } from '@/app/api/dashboard-auth/route';

const createRequest = (body: object) =>
  ({
    json: async () => body,
  } as unknown as Request);

describe('POST /api/dashboard-auth (Login)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 when password is missing', async () => {
    const res = await POST(createRequest({}));
    expect(res.status).toBe(400);
  });

  it('should return 401 when password is incorrect', async () => {
    mockVerifyPassword.mockReturnValue(false);
    const res = await POST(createRequest({ password: 'wrong' }));
    expect(res.status).toBe(401);
  });

  it('should return 200 and set cookie on correct password', async () => {
    mockVerifyPassword.mockReturnValue(true);
    const res = await POST(createRequest({ password: 'correct' }));
    expect(res.status).toBe(200);
    expect(mockSetAuthCookie).toHaveBeenCalled();
  });

  it('should verify password with provided value', async () => {
    mockVerifyPassword.mockReturnValue(false);
    await POST(createRequest({ password: 'my-secret' }));
    expect(mockVerifyPassword).toHaveBeenCalledWith('my-secret');
  });
});

describe('DELETE /api/dashboard-auth (Logout)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and clear cookie', async () => {
    const res = await DELETE();
    expect(res.status).toBe(200);
    expect(mockClearAuthCookie).toHaveBeenCalled();
  });
});
