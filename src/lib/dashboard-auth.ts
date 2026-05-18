import { cookies } from 'next/headers';

const COOKIE_NAME = 'dashboard_token';
const TOKEN_MAX_AGE = 60 * 60 * 8; // 8 hours

/**
 * Generate a simple HMAC-like token from the password + a secret.
 * Not cryptographically heavy — just enough to stop casual tampering.
 */
function generateToken(password: string): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback-secret';
  // Base64-encode a combined string as a lightweight "signature"
  return Buffer.from(`${password}::${secret}`).toString('base64');
}

/**
 * Verify that the submitted password matches DASHBOARD_PASSWORD.
 */
export function verifyPassword(password: string): boolean {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) {
    console.warn('[Dashboard Auth] DASHBOARD_PASSWORD env var is not set');
    return false;
  }
  return password === expected;
}

/**
 * Set the dashboard auth cookie after successful login.
 */
export async function setAuthCookie(): Promise<void> {
  const password = process.env.DASHBOARD_PASSWORD || '';
  const token = generateToken(password);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    // Behind reverse proxies (Cloudflare Tunnel), the internal connection is
    // HTTP even though the external connection is HTTPS. Set COOKIE_SECURE=false
    // in .env.local on VPS deployments behind a tunnel/proxy.
    // Defaults to true in production for direct HTTPS deployments.
    secure: process.env.COOKIE_SECURE !== 'false' && process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE,
    path: '/',
  });
}

/**
 * Clear the dashboard auth cookie (logout).
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Check if the current request has a valid dashboard auth cookie.
 * Use in Server Components and API routes.
 */
export async function isDashboardAuthenticated(): Promise<boolean> {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) {
    // If no password is configured, deny access
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const expectedToken = generateToken(password);
  return token === expectedToken;
}

/**
 * Verify dashboard auth from an API route request.
 * Reads the cookie from the request headers.
 */
export function verifyDashboardAuthFromRequest(req: Request): boolean {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return false;

  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const token = match?.[1];
  if (!token) return false;

  const expectedToken = generateToken(password);
  return token === expectedToken;
}
