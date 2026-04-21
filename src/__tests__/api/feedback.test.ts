/**
 * Tests for API Route: POST /api/feedback
 * Uses node test environment workaround for NextResponse
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

// Mock Supabase
const mockInsert = jest.fn().mockResolvedValue({ error: null });
const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}));

import { POST } from '@/app/api/feedback/route';

// Polyfill Request for Node test env
const createRequest = (body: object) => ({
  json: async () => body,
} as unknown as Request);

describe('POST /api/feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 when conversationId is missing', async () => {
    const res = await POST(createRequest({ rating: 5 }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('required');
  });

  it('should return 400 when rating is missing', async () => {
    const res = await POST(createRequest({ conversationId: '123' }));
    expect(res.status).toBe(400);
  });

  it('should return 200 on valid submission', async () => {
    const res = await POST(
      createRequest({ conversationId: '123', rating: 5, comment: 'Great!' })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('should call Supabase with correct data', async () => {
    await POST(
      createRequest({ conversationId: 'conv-abc', rating: 4, comment: 'Helpful' })
    );
    expect(mockFrom).toHaveBeenCalledWith('feedback');
    expect(mockInsert).toHaveBeenCalledWith({
      conversation_id: 'conv-abc',
      rating: 4,
      comment: 'Helpful',
    });
  });

  it('should handle null comment', async () => {
    await POST(createRequest({ conversationId: '123', rating: 3 }));
    expect(mockInsert).toHaveBeenCalledWith({
      conversation_id: '123',
      rating: 3,
      comment: null,
    });
  });

  it('should return 500 when Supabase insert fails', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'DB error' } });
    const res = await POST(
      createRequest({ conversationId: '123', rating: 5 })
    );
    expect(res.status).toBe(500);
  });
});
