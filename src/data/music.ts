/**
 * Background music played on the greeting *reveal* page (`/g/:id`) – i.e. only
 * when the recipient opens a greeting that was sent to them. It is never played
 * in the editor / form.
 *
 * Two kinds of source are supported, chosen automatically from `src`:
 *  1. A local audio file: drop it in `public/music/` and point `src` at it,
 *     e.g. `/music/hanukkah.mp3`.
 *  2. A YouTube video: paste any YouTube URL (watch / youtu.be / shorts / embed)
 *     as `src`. Only the audio is played – the video itself is never shown.
 *
 * Optionally tweak `title` (tooltip) and `volume` (0–1).
 * Set `MUSIC_ENABLED` to `false` to turn the whole feature off site-wide.
 * A holiday with no entry (or an empty `src`) simply plays no music.
 */

export const MUSIC_ENABLED = true;

/** Played when a holiday has no track of its own. Leave `src` empty to disable. */
export const DEFAULT_TRACK = {
  src: '',
  title: 'מוזיקת רקע לחג',
  volume: 0.5,
};

interface MusicTrackInput {
  /** local path under /public OR a YouTube URL — empty = no music */
  src: string;
  /** human label, used for the control's tooltip / aria text */
  title: string;
  /** playback volume, 0–1 */
  volume: number;
}

export interface MusicTrack {
  /** "file" = <audio> element, "youtube" = audio-only YouTube IFrame player */
  kind: 'file' | 'youtube';
  /** file src to load (empty for youtube tracks) */
  src: string;
  /** YouTube video id (empty for file tracks) */
  youTubeId: string;
  title: string;
  volume: number;
}

const tracks: Record<string, Partial<MusicTrackInput>> = {
  'rosh-hashana': { src: 'https://www.youtube.com/watch?v=ys-Bbq27Lb4', title: 'ניגון לראש השנה' },
  'yom-kippur': { src: '', title: 'ניגון ליום כיפור', volume: 0.4 },
  sukkot: { src: 'https://www.youtube.com/watch?v=O7V3G_MFHRQ', title: 'שיר לסוכות' },
  'simchat-torah': { src: 'https://www.youtube.com/watch?v=wAN3zInv78k', title: 'ניגון לשמחת תורה' },
  hanukkah: { src: 'https://www.youtube.com/watch?v=fljmo-csj08', title: 'שיר לחנוכה' },
  'tu-bishvat': { src: 'https://www.youtube.com/watch?v=01YeL8iDRKk', title: 'שיר לט״ו בשבט' },
  purim: { src: 'https://www.youtube.com/watch?v=rsdT7KKBIxc', title: 'שיר לפורים' },
  pesach: { src: 'https://www.youtube.com/watch?v=Kh0Xu-W3UTk', title: 'שיר לפסח' },
  'yom-haatzmaut': { src: 'https://www.youtube.com/watch?v=MAKWacz-EqY', title: 'שיר ליום העצמאות' },
  'lag-baomer': { src: 'https://www.youtube.com/watch?v=_xBlBLn_FxQ', title: 'שיר לל״ג בעומר' },
  shavuot: { src: 'https://www.youtube.com/watch?v=-jclV0ItiY0', title: 'שיר לשבועות' },
};

/** Extract a video id from any common YouTube URL form, or "" if not YouTube. */
export function parseYouTubeId(src: string): string {
  try {
    const url = new URL(src, 'https://x');
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      return url.pathname.slice(1).split('/')[0] || '';
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (url.pathname === '/watch') return url.searchParams.get('v') || '';
      const m = url.pathname.match(/^\/(?:embed|shorts|v|live)\/([^/?#]+)/);
      if (m) return m[1];
    }
  } catch {
    /* not a URL */
  }
  return '';
}

export function getMusicTrack(slug: string | undefined): MusicTrack | null {
  if (!MUSIC_ENABLED || !slug) return null;
  const merged: MusicTrackInput = { ...DEFAULT_TRACK, ...tracks[slug] };
  if (!merged.src) return null;

  const youTubeId = parseYouTubeId(merged.src);
  return {
    kind: youTubeId ? 'youtube' : 'file',
    src: youTubeId ? '' : merged.src,
    youTubeId,
    title: merged.title,
    volume: merged.volume,
  };
}
