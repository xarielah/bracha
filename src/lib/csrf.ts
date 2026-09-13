/** Double-submit CSRF cookie + header/body token for Bracha form POSTs. */

export const CSRF_COOKIE = 'bracha_csrf';
export const CSRF_HEADER = 'x-csrf-token';
const MAX_AGE_SEC = 60 * 60 * 2; // 2 hours

export interface CsrfResult {
  ok: boolean;
  reason?: string;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

/** Cryptographically random URL-safe token. */
export function createCsrfToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += b.toString(16).padStart(2, '0');
  return s;
}

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

export function buildCsrfSetCookie(token: string, secure: boolean): string {
  const parts = [
    `${CSRF_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    `Max-Age=${MAX_AGE_SEC}`,
    'SameSite=Lax',
  ];
  // Readable by JS (double-submit) — must NOT be HttpOnly.
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

/**
 * Ensure a CSRF cookie exists on HTML navigations.
 * Returns the Set-Cookie value to append, or null if already present / not needed.
 */
export function maybeIssueCsrfCookie(request: Request, url: URL): string | null {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  if (url.pathname.startsWith('/api/')) return null;

  const cookies = parseCookies(request.headers.get('cookie'));
  if (cookies[CSRF_COOKIE] && cookies[CSRF_COOKIE].length >= 32) return null;

  const secure = url.protocol === 'https:';
  return buildCsrfSetCookie(createCsrfToken(), secure);
}

/**
 * Verify CSRF for a mutating API request.
 * Requires: cookie present, X-CSRF-Token header (or body.csrfToken) matches cookie,
 * and Origin/Referer (when present) matches this site.
 */
export function verifyCsrf(
  request: Request,
  url: URL,
  bodyToken?: unknown
): CsrfResult {
  const cookies = parseCookies(request.headers.get('cookie'));
  const cookieToken = cookies[CSRF_COOKIE];
  if (!cookieToken || cookieToken.length < 32) {
    return { ok: false, reason: 'missing-cookie' };
  }

  const headerToken = request.headers.get(CSRF_HEADER)?.trim() || '';
  const fromBody =
    typeof bodyToken === 'string' ? bodyToken.trim() : '';
  const presented = headerToken || fromBody;
  if (!presented) return { ok: false, reason: 'missing-token' };

  if (!timingSafeEqual(cookieToken, presented)) {
    return { ok: false, reason: 'mismatch' };
  }

  // Defense in depth: reject cross-origin browser POSTs when Origin is sent.
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).origin !== url.origin) {
        return { ok: false, reason: 'bad-origin' };
      }
    } catch {
      return { ok: false, reason: 'bad-origin' };
    }
  } else {
    const referer = request.headers.get('referer');
    if (referer) {
      try {
        if (new URL(referer).origin !== url.origin) {
          return { ok: false, reason: 'bad-referer' };
        }
      } catch {
        return { ok: false, reason: 'bad-referer' };
      }
    }
  }

  return { ok: true };
}
