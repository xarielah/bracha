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
| `PUBLIC_ADSENSE_CLIENT` | לא | מזהה מפרסם AdSense (`ca-pub-…`). ריק = ללא פרסומות |
| `PUBLIC_ADSENSE_SLOT_CONTENT` | לא | מזהה יחידת מודעה בתוך התוכן (דף בית + דפי חג) |
| `PUBLIC_ADSENSE_SLOT_GREETING` | לא | מזהה יחידת מודעה מתחת לברכה שנחשפה |
| `PUBLIC_ADSENSE_DEBUG` | לא | `"1"` = placeholder נראה במקום כל יחידת מודעה |

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

## פרסומות (Google AdSense)

הכל כבוי כל עוד `PUBLIC_ADSENSE_CLIENT` ריק — אין סקריפט, אין `<ins>`, ו‑`/ads.txt`
מחזיר placeholder.

הפעלה:

1. פותחים חשבון ב‑https://www.google.com/adsense ומוסיפים את הדומיין לאישור.
2. מגדירים `PUBLIC_ADSENSE_CLIENT` (למשל `ca-pub-0000000000000000`) ב‑Vercel ו‑`.env`.
   זה מספיק כדי לטעון את הסקריפט, לאמת את האתר, לייצר `/ads.txt` ולהפעיל
   **Auto Ads** (אם מפעילים אותם בדשבורד).
3. למיקומים קבועים: יוצרים "יחידות מודעה" בדשבורד (Ads → By ad unit), ומעתיקים את
   ה‑`data-ad-slot` (מספר) אל `PUBLIC_ADSENSE_SLOT_CONTENT` ו‑`PUBLIC_ADSENSE_SLOT_GREETING`.

מיקומים בקוד (`src/components/AdUnit.astro`): דף הבית אחרי הגריד, דפי החג לפני סקשן
"על החג", ומתחת לברכה שנחשפה ב‑`/g/:id`. ה‑`push()` של כל יחידה רץ **בעצלתיים**
(IntersectionObserver) — נורה רק כשהיחידה נכנסת ל‑viewport עם רוחב > 0, כך שגם
יחידות מתחת לקיפול ובתוך אזורים שנחשפים בלחיצה מתמלאות. עמוד `/privacy` מתעדכן
אוטומטית עם פסקת AdSense כשהפרסומות פעילות. ל‑`/g/:id` (תוכן דל, `noindex`) — אם
AdSense מתלונן על "low value content", מסירים את ה‑`<AdUnit>` מ‑`src/pages/g/[id].astro`.

### למה עדיין אין פרסומות?

- **האתר ב‑AdSense במצב "Getting ready" / בבדיקה** — גוגל מאשרת את האתר (ימים עד
  ~שבועיים). **עד אישור לא מוצגות פרסומות בכלל**, ואין מה לתקן בקוד. בודקים ב‑
  AdSense → Sites.
- **פרסומות לרוב לא מוצגות ב‑`localhost` ובסביבות preview** של Vercel.
- מוגדר רק `PUBLIC_ADSENSE_CLIENT` בלי slots ובלי Auto Ads → אחרי אישור עדיין לא
  יופיע כלום. בוחרים אחת:
  - **Auto Ads**: מפעילים בלוח הבקרה של AdSense → הסקריפט הקיים מספיק, בלי slots.
  - **יחידות ידניות**: יוצרים ad units, מעתיקים את מספרי ה‑`data-ad-slot` אל
    `PUBLIC_ADSENSE_SLOT_CONTENT` / `PUBLIC_ADSENSE_SLOT_GREETING` ב‑Vercel
    **Production**, ומריצים **redeploy** (משתני `PUBLIC_*` נצרבים ב‑build).

### אימות שהחיווט תקין

1. `view-source` בדומיין החי → קיימים `adsbygoogle.js?client=ca-pub-…` ו‑
   `<meta name="google-adsense-account">`.
2. `https://<domain>/ads.txt` מחזיר `google.com, pub-…, DIRECT, f08c47fec0942fa0`
   (לא ה‑placeholder — אחרת המשתנה חסר ב‑Vercel Production).
3. `PUBLIC_ADSENSE_DEBUG="1"` → כל `<AdUnit>` מרונדרת כקופסה מקווקוות עם מזהה
   הסלוט, כדי לאמת מיקומים לפני אישור/מילוי.

> הערה: לעמידה מלאה ב‑GDPR/CCPA ייתכן שתידרש הטמעת CMP (מסך הסכמה לעוגיות).

## פריסה ל‑Vercel

1. מייבאים את הריפו ב‑Vercel (Framework: Astro – מזוהה אוטומטית).
2. מגדירים `MONGODB_URI`, `TURNSTILE_SECRET_KEY`, `PUBLIC_TURNSTILE_SITE_KEY`
   (ואופציונלית `MONGODB_DB`, `PUBLIC_SITE_URL`, ומשתני `PUBLIC_ADSENSE_*`)
   ב‑Environment Variables.
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
  lib/ads.ts              קונפיג AdSense מ‑env
  middleware.ts           rate limit גלובלי על /api/*
  components/
    Motif.astro           SVG אינליין לכל חג
    GreetingCard.astro    כרטיס הברכה – משותף לעורך ולדף הסופי (זהות ויזואלית)
    HolidayCard.astro     כרטיס ל‑grid בדף הבית
    AdUnit.astro          יחידת מודעה של AdSense (לא מרונדרת ללא client+slot)
    NotFound.astro
  scripts/celebrate.ts    אנימציית נשירת אלמנטים (canvas, מכבד prefers-reduced-motion)
  layouts/BaseLayout.astro <html dir="rtl"> + מטא + design tokens
  pages/
    index.astro           דף הבית
    [holiday]/index.astro  דף העורך
    g/[id].astro           דף הברכה (SSR)
    api/greetings.ts       POST – יצירת ברכה
    privacy.astro          מדיניות פרטיות (נדרש ל‑AdSense)
    ads.txt.ts             /ads.txt דינמי מ‑env
    404.astro
```
