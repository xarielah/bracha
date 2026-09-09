import { getCollection } from './mongo';

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  /** seconds until the current window resets */
  retryAfter: number;
}

interface RateLimitDoc {
  _id: string;
  count: number;
  expireAt: Date;
}

/** Pull the caller's IP out of the proxy headers (Vercel / Cloudflare). */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

// Ensure the TTL index exists once per process; retry if it fails.
let indexReady: Promise<void> | null = null;
function ensureTtlIndex(): Promise<void> {
  if (!indexReady) {
    indexReady = (async () => {
      const col = await getCollection<RateLimitDoc>('ratelimits');
      await col.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
    })().catch((e) => {
      indexReady = null;
      throw e;
    });
  }
  return indexReady;
}

/**
 * Fixed-window counter backed by MongoDB. Shared across all serverless instances.
 * Fails open (returns ok:true) if the store is unreachable.
 */
export async function rateLimit(
  bucket: string,
  id: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const key = `${bucket}:${id}:${windowStart}`;
  const retryAfter = Math.ceil((windowStart + windowMs - now) / 1000);

  try {
    ensureTtlIndex().catch(() => {});
    const col = await getCollection<RateLimitDoc>('ratelimits');
    const doc = await col.findOneAndUpdate(
      { _id: key },
      {
        $inc: { count: 1 },
        $setOnInsert: { expireAt: new Date(windowStart + windowMs) },
      },
      { upsert: true, returnDocument: 'after' }
    );
    const count = doc?.count ?? 1;
    return {
      ok: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      retryAfter,
    };
  } catch (e) {
    console.error('[ratelimit] store unavailable, failing open', e);
    return { ok: true, limit, remaining: limit, retryAfter };
  }
}

export function tooManyRequests(retryAfter: number): Response {
  return new Response(
    JSON.stringify({ error: 'יותר מדי בקשות. נסו שוב בעוד רגע.' }),
    {
      status: 429,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'retry-after': String(Math.max(1, retryAfter)),
      },
    }
  );
}
