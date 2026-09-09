# ברכות לחגי ישראל

אתר ליצירת ברכות אישיות, אינטראקטיביות ומעוצבות לכל חגי ישראל, ולשיתופן בקישור אחד.

- **דף הבית** – grid של כל החגים, לכל חג עיצוב לפי הסממנים הדומיננטיים שלו (SVG/CSS מקורי).
- **דף עורך** (`/[holiday]`) – WYSIWYG: מזינים שם המברך/ת (חובה), שם המבורך/ת (חובה)
  ומלל אישי (עד ~60 מילים, לא חובה), והברכה מתעדכנת בזמן אמת. יוצרים קישור לשיתוף.
- **דף ברכה** (`/g/:id`) – מוגש מהשרת (SSR). קודם preview "לחצו כדי לחשוף את הברכה
  שקיבלתם!", ואז חשיפה עם אנימציית חג.
- SEO: RTL, תגיות canonical/OG/Twitter, JSON-LD (`WebSite`, `ItemList`, `BreadcrumbList`,
  `FAQPage`), `sitemap-index.xml`, `robots.txt`, תוכן עשיר על כל חג.

## סטאק

Astro 7 · פלט `static` + אדפטר `@astrojs/vercel` (רוט אחד ורוט API הם on-demand) ·
MongoDB (driver רשמי) · Heebo (גוף) + Rubik (כותרות) · תמיכת light/dark mode (ברירת מחדל: בהיר, נשמר ב‑localStorage).

## הרצה מקומית

```bash
npm install
cp .env.example .env      # ומלאו MONGODB_URI
npx astro dev --background # ניהול: astro dev stop | status | logs
```

פותחים http://localhost:4321

## משתני סביבה

| משתנה             | חובה | תיאור                                             |
|-------------------|------|--------------------------------------------------|
| `MONGODB_URI`     | כן   | מחרוזת חיבור ל‑MongoDB Atlas / שרת Mongo          |
| `MONGODB_DB`      | לא   | שם מסד הנתונים (ברירת מחדל `bracha`)              |
| `PUBLIC_SITE_URL` | לא   | כתובת האתר ל‑canonical/OG/sitemap ולקישורי שיתוף |
| `PUBLIC_TURNSTILE_SITE_KEY` | לא | מפתח אתר של Cloudflare Turnstile (ברירת מחדל: מפתח בדיקה) |
| `TURNSTILE_SECRET_KEY` | לא* | מפתח סודי של Turnstile לאימות בצד השרת |

\* בפיתוח (`astro dev`) האימות מדלג כשאין מפתח סודי; בפרודקשן היעדר `TURNSTILE_SECRET_KEY`
גורם לכל שליחה להיכשל (fail‑closed).

הברכות נשמרות באוסף `greetings`. `_id` הוא מזהה אקראי בן 10 תווים (לא ניתן לניחוש).

## אבטחת ה‑API

- **Cloudflare Turnstile** על טופס הברכה: ווידג'ט בעמוד העורך, ואימות ה‑token מול
  `siteverify` ב‑`src/pages/api/greetings.ts` (`src/lib/turnstile.ts`). מפתחות אמיתיים:
  https://dash.cloudflare.com/?to=/:account/turnstile
- **Rate limiting** מבוסס MongoDB (חלון קבוע, משותף בין כל ה‑serverless instances,
  אוסף `ratelimits` עם TTL index) — `src/lib/ratelimit.ts`:
  - `src/middleware.ts` — 60 בקשות/דקה לכל IP על כל `/api/*`.
  - `POST /api/greetings` — בנוסף: 5 יצירות/דקה ו‑40 יצירות/שעה לכל IP.
  - נכשל "פתוח" (מאפשר) אם מסד הנתונים לא זמין, כדי לא לחסום תעבורה לגיטימית.

## פריסה ל‑Vercel

1. מייבאים את הריפו ב‑Vercel (Framework: Astro – מזוהה אוטומטית).
2. מגדירים `MONGODB_URI`, `TURNSTILE_SECRET_KEY`, `PUBLIC_TURNSTILE_SITE_KEY`
   (ואופציונלית `MONGODB_DB`, `PUBLIC_SITE_URL`) ב‑Environment Variables.
3. ב‑MongoDB Atlas: מתירים גישה מ‑`0.0.0.0/0` (או מרשימת ה‑IP של Vercel) ומוסיפים משתמש DB.
4. Deploy. עדכנו את כתובת ה‑`Sitemap` ב‑`public/robots.txt` לדומיין הסופי.

## מבנה

```
src/
  data/holidays.ts        מקור אמת יחיד לכל החגים (סממנים, פלטה, תוכן SEO, FAQ)
  lib/mongo.ts            סינגלטון חיבור + getCollection / אוסף greetings
  lib/greeting.ts         טיפוסים + ולידציה (שמות חובה, מלל ≤ 60 מילים)
  lib/id.ts               יצירת מזהה ברכה
  lib/ratelimit.ts        rate limiting מבוסס MongoDB + חילוץ IP
  lib/turnstile.ts        אימות Cloudflare Turnstile בצד השרת
  middleware.ts           rate limit גלובלי על /api/*
  components/
    Motif.astro           SVG אינליין לכל חג
    GreetingCard.astro    כרטיס הברכה – משותף לעורך ולדף הסופי (זהות ויזואלית)
    HolidayCard.astro     כרטיס ל‑grid בדף הבית
    NotFound.astro
  scripts/celebrate.ts    אנימציית נשירת אלמנטים (canvas, מכבד prefers-reduced-motion)
  layouts/BaseLayout.astro <html dir="rtl"> + מטא + design tokens
  pages/
    index.astro           דף הבית
    [holiday]/index.astro  דף העורך
    g/[id].astro           דף הברכה (SSR)
    api/greetings.ts       POST – יצירת ברכה
    404.astro
```
