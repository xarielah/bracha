const SECRET =
  import.meta.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY;

const VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Cloudflare's public test key – always passes, safe as a dev default. */
export const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';

export interface TurnstileResult {
  ok: boolean;
  reason?: string;
}

/**
 * Verify a Cloudflare Turnstile token server-side.
 * If no secret is configured: allowed in dev, rejected in production.
 */
export async function verifyTurnstile(
  token: unknown,
  ip?: string
): Promise<TurnstileResult> {
  if (!SECRET) {
    if (import.meta.env.DEV) return { ok: true, reason: 'dev-bypass' };
    console.error('[turnstile] TURNSTILE_SECRET_KEY is not configured');
    return { ok: false, reason: 'not-configured' };
  }
  if (typeof token !== 'string' || !token) {
    return { ok: false, reason: 'missing-token' };
  }

  const body = new FormData();
  body.append('secret', SECRET);
  body.append('response', token);
  if (ip && ip !== 'unknown') body.append('remoteip', ip);

  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body });
    const data = (await res.json()) as {
      success: boolean;
      'error-codes'?: string[];
    };
    return {
      ok: data.success === true,
      reason: data['error-codes']?.join(',') || undefined,
    };
  } catch (e) {
    console.error('[turnstile] verification request failed', e);
    return { ok: false, reason: 'verify-error' };
  }
}
