import type { APIRoute } from 'astro';
import { ADSENSE_PUB_ID, adsenseEnabled } from '../lib/ads';

export const prerender = true;

// https://support.google.com/adsense/answer/12171612
export const GET: APIRoute = () => {
  const body = adsenseEnabled
    ? `google.com, ${ADSENSE_PUB_ID}, DIRECT, f08c47fec0942fa0\n`
    : '# Set PUBLIC_ADSENSE_CLIENT to generate this file.\n';

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
