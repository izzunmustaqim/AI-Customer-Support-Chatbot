/**
 * Tests for API Route: POST /api/contact
 */

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status || 200,
      json: async () => body,
    }),
  },
}));

const mockInsert = jest.fn().mockResolvedValue({ error: null });
const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}));

import { POST } from '@/app/api/contact/route';

const createRequest = (body: object) => ({
  json: async () => body,
} as unknown as Request);

describe('POST /api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 when email is missing', async () => {
    const res = await POST(createRequest({ name: 'John' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Email');
  });

  it('should return 200 with valid email', async () => {
    const res = await POST(
      createRequest({ email: 'john@example.com', name: 'John' })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('should save all contact fields to database', async () => {
    await POST(
      createRequest({
        conversationId: 'conv-123',
        name: 'Jane',
        email: 'jane@test.com',
        phone: '+1234567890',
        company: 'Acme Inc',
        message: 'Interested in demo',
      })
    );
    expect(mockFrom).toHaveBeenCalledWith('contact_submissions');
    expect(mockInsert).toHaveBeenCalledWith({
      conversation_id: 'conv-123',
      name: 'Jane',
      email: 'jane@test.com',
      phone: '+1234567890',
      company: 'Acme Inc',
      message: 'Interested in demo',
    });
  });

  it('should handle missing optional fields with null', async () => {
    await POST(createRequest({ email: 'min@test.com' }));
    expect(mockInsert).toHaveBeenCalledWith({
      conversation_id: null,
      name: null,
      email: 'min@test.com',
      phone: null,
      company: null,
      message: null,
    });
  });

  it('should return 500 when database insert fails', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'DB error' } });
    const res = await POST(createRequest({ email: 'fail@test.com' }));
    expect(res.status).toBe(500);
  });
});
