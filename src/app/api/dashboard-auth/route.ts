import { NextResponse } from 'next/server';
import { verifyPassword, setAuthCookie, clearAuthCookie } from '@/lib/dashboard-auth';

/**
 * POST — Login: verify password and set auth cookie.
 */
export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    if (!verifyPassword(password)) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    await setAuthCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Dashboard Auth] Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE — Logout: clear the auth cookie.
 */
export async function DELETE() {
  try {
    await clearAuthCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Dashboard Auth] Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
