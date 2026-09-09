# Background music for greeting reveal pages

Audio files here are served at `/music/<file>`. They are played **only** on the
recipient-facing reveal page (`/g/:id`), after the recipient taps "לחשיפת הברכה",
and can always be muted with the on-screen control.

## Two ways to set a track (in `src/data/music.ts`)

- **Local file** — add it here and set `src` to `/music/<file>`.
- **YouTube** — set `src` to any YouTube URL (watch / `youtu.be` / shorts / embed).
  Only the audio is played; the video is never shown. Playback still starts only
  after the recipient taps "לחשיפת הברכה", and can be muted with the control.
  Use videos you have the right to use.

## Adding / changing a local track

1. Add an audio file to this folder, e.g. `hanukkah.mp3`
   (mp3 is the safest cross-browser choice; keep it small — ideally < 1.5 MB,
   a 60–90s loop-friendly clip is plenty).
2. Open `src/data/music.ts` and point that holiday's `src` at the file.
3. Adjust `title` / `volume` there if needed.

To disable music for a single holiday, set its `src` to `''`.
To disable the feature everywhere, set `MUSIC_ENABLED = false` in `src/data/music.ts`.

## Licensing

Only add music you have the right to use (royalty-free / properly licensed).
