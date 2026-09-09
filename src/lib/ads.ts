/**
 * Google AdSense configuration, read from public env vars at build time.
 *
 * PUBLIC_ADSENSE_CLIENT  – your publisher id, e.g. "ca-pub-1234567890123456"
 * PUBLIC_ADSENSE_SLOT_*  – ad unit ids (numbers) created in the AdSense dashboard
 */
export const ADSENSE_CLIENT = (import.meta.env.PUBLIC_ADSENSE_CLIENT || '').trim();

/** "ca-pub-123…" → "pub-123…" (format required by ads.txt) */
export const ADSENSE_PUB_ID = ADSENSE_CLIENT.replace(/^ca-/, '');

export const adsenseEnabled = /^ca-pub-\d+$/.test(ADSENSE_CLIENT);

/**
 * When "1", every <AdUnit> renders a visible dashed placeholder (even without a
 * slot id) so ad placements can be verified before AdSense approval / fill.
 */
export const ADSENSE_DEBUG = import.meta.env.PUBLIC_ADSENSE_DEBUG === '1';

export const AD_SLOTS = {
  /** in-content unit on the home page and holiday pages */
  content: (import.meta.env.PUBLIC_ADSENSE_SLOT_CONTENT || '').trim(),
  /** unit shown under a revealed greeting */
  greeting: (import.meta.env.PUBLIC_ADSENSE_SLOT_GREETING || '').trim(),
};
