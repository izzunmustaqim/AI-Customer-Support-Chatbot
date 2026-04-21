import { getSupabaseAdmin } from '@/lib/supabase/server';

describe('Supabase Server Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Re-import to get fresh module
    jest.isolateModules(() => {
      const { getSupabaseAdmin: freshGetSupabase } = require('@/lib/supabase/server');
      expect(() => freshGetSupabase()).toThrow('Missing Supabase environment variables');
    });
  });

  it('should throw error when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    jest.isolateModules(() => {
      const { getSupabaseAdmin: freshGetSupabase } = require('@/lib/supabase/server');
      expect(() => freshGetSupabase()).toThrow('Missing Supabase environment variables');
    });
  });

  it('should create client when both env vars are present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

    jest.isolateModules(() => {
      const { getSupabaseAdmin: freshGetSupabase } = require('@/lib/supabase/server');
      const client = freshGetSupabase();
      expect(client).toBeDefined();
      expect(client).toHaveProperty('from');
    });
  });
});
