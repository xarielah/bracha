import { defineMiddleware } from 'astro:middleware';
import { rateLimit, getClientIp, tooManyRequests } from './lib/ratelimit';

// Coarse limit applied to every API request, regardless of endpoint.
const API_LIMIT = 60;
const API_WINDOW_SEC = 60;

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(context.request);
    const rl = await rateLimit('api', ip, API_LIMIT, API_WINDOW_SEC);
    if (!rl.ok) return tooManyRequests(rl.retryAfter);
  }

  return next();
});
