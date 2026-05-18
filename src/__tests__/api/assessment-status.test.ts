/**
 * Tests for API Route: PATCH /api/assessment-status
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

// Mock dashboard auth
jest.mock('@/lib/dashboard-auth', () => ({
  isDashboardAuthenticated: jest.fn().mockResolvedValue(true),
}));

// Mock Supabase
const mockEq = jest.fn().mockResolvedValue({ error: null });
const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
const mockFrom = jest.fn().mockReturnValue({ update: mockUpdate });

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}));

import { PATCH } from '@/app/api/assessment-status/route';
import { isDashboardAuthenticated } from '@/lib/dashboard-auth';

const createRequest = (body: object) =>
  ({
    json: async () => body,
  } as unknown as Request);

describe('PATCH /api/assessment-status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isDashboardAuthenticated as jest.Mock).mockResolvedValue(true);
  });

  it('should return 401 when not authenticated', async () => {
    (isDashboardAuthenticated as jest.Mock).mockResolvedValue(false);
    const res = await PATCH(createRequest({ assessmentId: '123', reportStatus: 'sent' }));
    expect(res.status).toBe(401);
  });

  it('should return 400 when assessmentId is missing', async () => {
    const res = await PATCH(createRequest({ reportStatus: 'sent' }));
    expect(res.status).toBe(400);
  });

  it('should return 400 when reportStatus is missing', async () => {
    const res = await PATCH(createRequest({ assessmentId: '123' }));
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid status value', async () => {
    const res = await PATCH(
      createRequest({ assessmentId: '123', reportStatus: 'invalid' })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Invalid status');
  });

  it('should accept valid status: pending', async () => {
    const res = await PATCH(
      createRequest({ assessmentId: '123', reportStatus: 'pending' })
    );
    expect(res.status).toBe(200);
  });

  it('should accept valid status: sent', async () => {
    const res = await PATCH(
      createRequest({ assessmentId: '123', reportStatus: 'sent' })
    );
    expect(res.status).toBe(200);
  });

  it('should accept valid status: generating', async () => {
    const res = await PATCH(
      createRequest({ assessmentId: '123', reportStatus: 'generating' })
    );
    expect(res.status).toBe(200);
  });

  it('should accept valid status: failed', async () => {
    const res = await PATCH(
      createRequest({ assessmentId: '123', reportStatus: 'failed' })
    );
    expect(res.status).toBe(200);
  });

  it('should call Supabase with correct data', async () => {
    await PATCH(
      createRequest({ assessmentId: 'abc-123', reportStatus: 'generating' })
    );
    expect(mockFrom).toHaveBeenCalledWith('assessment_results');
    expect(mockUpdate).toHaveBeenCalledWith({ report_status: 'generating' });
    expect(mockEq).toHaveBeenCalledWith('id', 'abc-123');
  });

  it('should auto-set report_sent_at when status is sent', async () => {
    await PATCH(
      createRequest({ assessmentId: '123', reportStatus: 'sent' })
    );
    const updateArg = mockUpdate.mock.calls[0][0];
    expect(updateArg.report_status).toBe('sent');
    expect(updateArg.report_sent_at).toBeDefined();
  });

  it('should return 500 when Supabase update fails', async () => {
    mockEq.mockResolvedValueOnce({ error: { message: 'DB error' } });
    const res = await PATCH(
      createRequest({ assessmentId: '123', reportStatus: 'sent' })
    );
    expect(res.status).toBe(500);
  });
});
