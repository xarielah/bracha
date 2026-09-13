import type { APIRoute } from 'astro';
import {
  CSRF_COOKIE,
  createCsrfToken,
  buildCsrfSetCookie,
  parseCookies,
} from '../../lib/csrf';

export const prerender = false;

/**
 * Issue (or refresh) a CSRF cookie and return the token.
 * Needed because holiday editor pages are statically prerendered on Vercel,
 * so page-load middleware never runs for them.
 */
export const GET: APIRoute = async ({ request, url }) => {
  const cookies = parseCookies(request.headers.get('cookie'));
  const existing = cookies[CSRF_COOKIE];
  const token =
    existing && existing.length >= 32 ? existing : createCsrfToken();

  const secure = url.protocol === 'https:';
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  // Always re-set so Max-Age refreshes; required when cookie was missing.
  headers.append('Set-Cookie', buildCsrfSetCookie(token, secure));

  return new Response(JSON.stringify({ token }), { status: 200, headers });
};

export const POST: APIRoute = () =>
  new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
    status: 405,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
