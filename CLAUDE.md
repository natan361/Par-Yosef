# CLAUDE.md — ישיבת פאר יוסף

---

## על הפרויקט

אתר קהילתי חמישה עמודים עבור **ישיבת פאר יוסף** (Known also as עטרת מנשה / היכל מוהרן), בית כנסת, ישיבה ובית מדרש ברסלב בירושלים.

| פרט | ערך |
|-----|-----|
| שם הארגון | פאר יוסף |
| מסורת | ברסלב |
| נוסד | 1982 |
| כתובת | קדושי סלוניקי, ירושלים 9339012 |
| ראש הישיבה | הרב אשר עבאדי שליט"א |
| גודל קהילה | כ-40 משפחות, כל הגילאים |
| אופי | קהילתי חם — בית כנסת + בית מדרש + לימוד תורה |
| ערוץ YouTube | https://www.youtube.com/@הרבאשרעבאדיעטרתמנשההיכלמוהרן |

---

## עמודי האתר (5)

- `index.html` — דף הבית (בעבודה)
- `donate.html` — תרומות
- `gallery.html` — גלריה
- `videos.html` — שיעורים וסרטונים
- `zmanim.html` — זמני תפילה

---

## שפה ואופי

- **שפה ראשית:** עברית (dir="rtl" lang="he")
- **שפה שנייה:** צרפתית — כל עמוד חייב לכלול toggle FR/HE בheader
- **טון:** חם, קהילתי, מכבד
- **אימוג'ים:** אסורים לחלוטין בכל מקום (☰ של hamburger מותר)
- **אנימציות:** חובה — האתר חייב להרגיש חי ודינמי, לא סטטי

---

## תמיכה בצרפתית — כללי מימוש

כל עמוד חייב לממש מערכת תרגום מלאה HE/FR:

**כפתור toggle בheader:**
```html
<button class="lang-btn" id="lang-toggle" onclick="setLang(currentLang==='he'?'fr':'he')">FR</button>
```

**מבנה HTML — כל טקסט ממשק עם data-i18n:**
```html
<span data-i18n="nav.home">דף הבית</span>
```

**JavaScript — אובייקט תרגומים + פונקציה:**
```js
const TRANSLATIONS = {
  he: { 'nav.home': 'דף הבית', 'nav.videos': 'סרטונים', ... },
  fr: { 'nav.home': 'Accueil',  'nav.videos': 'Vidéos',  ... }
};
let currentLang = localStorage.getItem('lang') || 'he';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang === 'fr' ? 'fr' : 'he';
  document.getElementById('lang-toggle').textContent = lang === 'he' ? 'FR' : 'HE';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (TRANSLATIONS[lang]?.[key]) el.textContent = TRANSLATIONS[lang][key];
  });
}
// Call on load:
setLang(currentLang);
```

**מה מתורגם לצרפתית:** כל טקסט ממשק (nav, כותרות סקשנים, כפתורים, placeholder, footer).
**מה לא מתורגם:** תוכן דינמי מה-API (שמות, כותרות שיעורים, חדשות).

---

## Mobile-First — כלל קבוע לכל עמוד

כל עמוד וכל פרומפט חייבים לכלול mobile layout מוקפד:

**גריד כרטיסי וידאו במובייל (≤767px):**
- 2 עמודות (לא 1) — gap: 10px
- תמונה ממוזערת: aspect-ratio 16/9 (לא גבוהה מדי)
- כותרת: font-size 12px, max 2 שורות
- padding כרטיס: 8px
- כך נראים ~4 כרטיסים בגובה המסך — כמו YouTube mobile

**breakpoints סטנדרטיים:**
```css
/* mobile */  @media (max-width: 767px)  { grid: 2 columns, gap: 10px }
/* tablet */  @media (max-width: 1024px) { grid: 2 columns, gap: 20px }
/* desktop */ default                   { grid: 3 columns, gap: 28px }
```

**Screenshot חובה בשלושה גדלים:** desktop + mobile + tablet

---

## ארכיטקטורה טכנית

- **HTML5 + CSS3 + Vanilla JS** — קובץ אחד לכל עמוד, ללא frameworks
- **פונטים:** Frank Ruhl Libre (כותרות) + Heebo (גוף) — מ-Google Fonts
- **CSS Variables** (ראה פלטה למטה)
- **Hebcal API** (ללא מפתח) לשבת ויזכור
- **Google Maps** embed ללא מפתח

---

## פלטת צבעים

```
--navy:         #1B2A4A  (כחול כהה — רקע ראשי)
--navy-dark:    #111C31  (כחול כהה יותר)
--gold:         #B8962E  (זהב — צבע מותג ראשי)
--gold-light:   #D4AF57  (זהב בהיר — הדגשות)
--cream:        #F7F3EC  (קרם — רקע סקשנים בהירים)
--white:        #FFFFFF
--text:         #1B2A4A
--muted:        #6B6B6B
--border:       #E2D9C8
--header-h:     72px
```

---

## תמונות

| מה | נתיב |
|----|------|
| לוגו (PNG) | `photo/logo-peer-yosef.png` |
| ציור שמן של הרב (הירו) | `photo/rabbi-portrait.png` (העתק מ: `photo/הרב אשר עבאדי.png`) |
| תמונת הרב (אודות) | `photo/rabbi-photo.png` (העתק מ: `photo/תמונה של הרב.png`) |
| טקסטורת שיש | `photo/img_01_1500x1500.png` |

**חשוב:** שמות קבצים עבריים עם רווחים גורמים לבעיות טעינה בדפדפן. תמיד השתמש בשמות ASCII.

---

## APIs

**Shabbat times + Parasha (Hebcal):**
```
https://www.hebcal.com/shabbat?cfg=json&geonameid=281184&m=50&lg=he
```

**Calendar events (Yahrzeits, holidays):**
```
https://www.hebcal.com/hebcal?v=1&cfg=json&year=YEAR&month=MONTH&maj=on&min=on&mod=on&nx=on&mf=on&ss=on&s=on&c=off&lg=he&geo=geoname&geonameid=281184
```

**Google Maps embed:**
```
https://www.google.com/maps?q=קדושי+סלוניקי,+ירושלים+9339012&output=embed&z=16
```

---

## אנימציות — דרישות

- **Hero entrance:** האלמנטים בהירו מופיעים ברצף בטעינת הדף (טקסט → תמונה → כפתורים)
- **Scroll animations:** כל סקשן fade-in + slide-up כשנכנס ל-viewport (IntersectionObserver)
- **Floating:** תמונת הרב בקשת מתנדנדת קלות (floating animation, אינסופי)
- **Hover effects:** כרטיסים מתרוממים מעט עם box-shadow
- **Easing:** cubic-bezier(0.22, 1, 0.36, 1) לאנימציות slide
- אל תשתמש ב-transition-all

---

## שרת מקומי

```bash
node serve.mjs          # מפעיל שרת על פורט 3000
```

**אל תצלם מ-file:/// — תמיד מ-localhost:3000**

---

## Screenshot Workflow

```bash
node screenshot.mjs http://localhost:3000           # desktop
node screenshot.mjs http://localhost:3000 mobile    # mobile (375px)
node screenshot.mjs http://localhost:3000 tablet    # tablet (768px)
```

Screenshots נשמרים ל: `./temporary screenshots/screenshot-N.png`
קרא כל PNG עם Read tool וניתח ויזואלית.
עשה לפחות 2 סבבי screenshot+בדיקה+תיקון.

---

## אתרי ייחוס

- https://yhb.org.il — ישיבת הר ברכה (חם, עשיר תוכן, community-focused)
- https://www.yrg.org.il — ישיבת רמת גן (אנימציות counter, clean)

---

## כללים קשים

1. **אין אימוג'ים** — בשום מקום בHTML (hamburger ☰ — בסדר)
2. **RTL בכל מקום** — dir="rtl" על html, כל layout ב-RTL
3. **אל תשנה** את פלטת הצבעים, הפונטים, או המבנה הכללי בלי הנחיה מפורשת
4. **Screenshot חובה** אחרי כל שינוי משמעותי
5. **ASCII בלבד** לנתיבי קבצים
6. **אדמין פאנל** — בנוי ועובד (admin.html). Phase 1 + Phase 2 הושלמו.

---

## מערכת העיצוב — "חותם" (רידיזיין יולי 2026)

> **הבלוק הקנוני נמצא ב-`index.html` תחת `DESIGN SYSTEM — "חותם" / the seal`.**
> כל 5 העמודים מכילים העתק זהה. אם משנים טוקן — משנים בכל 5.

**הרעיון:** הלוגו עצמו (`LOGO-PER-YOSEF.png`) הוא חותם זהב על קרם — טבעת כפולה,
כתר מוטבע, זהב שנקרא כקו חרוט ולא כמילוי שטוח. הדף לוקח את אותה לוגיקה.

**אלמנט החתימה:** הטבעת הכפולה של החותם, פרושה כקו שרץ מהכותרת עד קצה הקונטיינר
(`.sec-title::after` — שני border 1px בזהב). זה מחליף את פס הזהב הממורכז שחזר 8 פעמים.
`.gold-bar` הפך ל-`display:none` — אל תחזיר אותו.

### טוקנים עיקריים

```
טיל:   --teal-900 #0E2B33 · --teal-800 #14414C · --teal-700 #1E5A68 (מותג)
       --teal-600 #2B7C8D · --teal-200 #B7DAE0 · --teal-100 #DCECEF · --teal-50 #EFF7F8
זהב:   --gold-800 #6E4B00 · --gold-700 #8A5E00 · --gold-600 #A87200
       --gold-500 #CC8800 (מותג) · --gold-400 #E0A21F · --gold-200 #F0DCA8
       --gold-100 #F8EED6 · --gold-50 #FCF7EC
ניטרלי: --sand #f7f4ef · --sand-2 #F1ECE2 · --surface #fff
       --ink #16323D · --ink-2 #3D5B67 · --ink-3 #587079 · --line #E4DCCC · --line-2 #EFE9DE
```

**כלל נגישות קריטי:** `--gold-500` הוא 2.7:1 על קרם — **מילוי בלבד**, אסור לטקסט קטן.
לכל טקסט/לינק זהב על רקע בהיר: `--gold-700` (5.2:1). על רקע טיל: `--gold-200`.

### טיפוגרפיה

```
--font-display: 'Frank Ruhl Libre'  (כותרות, שמות, מספרים גדולים)
--font-body:    'Assistant'          (גוף, ממשק)
--fs-xs 13 · --fs-sm 15 · --fs-base 17 · --fs-md 19 · --fs-lg 22
--fs-xl/2xl/3xl = clamp() · --fs-hero clamp(56px, 9vw, 118px)
```

### מרווח · עומק · רדיוס · תנועה

```
--s1..--s9  = 4/8/12/16/24/32/48/64/96
--sec-y     = clamp(56px, 7vw, 96px)   ← ריתם הסקשנים. במובייל :root מוריד ל-48px.
--sh-1/2/3  = צללים רכים דו-שכבתיים · --sh-gold לכפתור הזהב
--r-xs/sm/md/lg/pill = 8/12/18/26/999
--ease cubic-bezier(.22,1,.36,1) · --dur-1/2/3 = 180/280/520ms
```

### כללים שנקבעו ברידיזיין — אל תשבור

1. ~~**שני רקעים בלבד**~~ — **בוטל ביולי 2026** בשכבת הפאנלים (ראה למטה). הקרקע נשארה
   `--sand`, אבל כל סקשן תוכן יושב עכשיו על משטח `--surface` לבן.
   `--teal-800` עדיין שמור לרגעי כובד (פרשה + תרומות) והם נשארים ברוחב מלא.
2. **הדר אחד בהיר** (`rgba(247,244,239,.78)` + blur) בכל העמודים — בלי היפוך שקוף/כהה.
3. **בלי ירוק ווטסאפ `#25D366`** — `.btn-green` הוא טיל.
4. **בלי שחור** — אין `#000`/`#1C1C1C`; כפתורים משניים הם outline זהב.
5. **`section { padding: var(--sec-y) 0 }`** — עדיין נכון לסקשנים שאינם `.panel`.
   סקשן `.panel` מקבל `padding: 0 var(--s5) var(--panel-gap)` והריתם שלו הוא הרווח
   בין הכרטיסים. אל תוסיף padding נקודתי עם `!important`.
6. **מובייל:** גריד שיעורים 2 עמודות, thumb `aspect-ratio:16/9`, `.lesson-desc` מוסתר.
7. **הירו במובייל:** כותרת למעלה / פרצוף הרב באמצע / כפתורים למטה (`background-position: 28% center`).

### RTL — מלכודת שחזרה

`margin-inline-start` הוא **ימין** ב-RTL. כדי לדחוף בלוק לימין: `margin-inline-start: <gutter>`
עם `margin-inline-end: auto` — לא הפוך.

---

## שכבת הפאנלים (יולי 2026) — פריסה בהשראת מרכז הרב

> הבלוק הקנוני: `index.html`, תחת `LAYOUT — the panel layer`. **זהה בכל 5 העמודים** —
> משנים בבלוק אחד, מעתיקים לחמישה.

הרפרנס: `mercazharav.org.il`. **כל המספרים כאן נמדדו מהאתר החי בדפדפן**
(`getComputedStyle` + bounding boxes), לא הוערכו מצילום מסך. **רק הפריסה וההיררכיה אומצו — הפלטה נשארה "חותם"
(טיל + זהב), הפונטים לא נגעו, ולא נוספו סקשנים או תוכן.**

שבעת הדפוסים שנלקחו:

1. **עמודה בקופסה** — `--wrap: 1110px` (במקום 1160). ההדר וגוף הדף חולקים אותו רוחב.
2. **כל סקשן תוכן הוא כרטיס לבן** — `section.panel > .container` מקבל `--surface`,
   גבול `--line`, ריפוד **16px/24px**, ו-`--sh-flat` (`0 2px 4px rgba(0,0,0,.075)`) —
   צל שטוח יחיד, לא הערימה הרכה של `--sh-1/2/3`. הסקשן הופך למרזב: `background: none`.
3. **קו זהב חוסם את ראש הכרטיס** — `border-top: 8px solid var(--gold-500)`.
   זה מחליף את `.sec-title::after` שרץ מהכותרת החוצה; בתוך פאנל הוא `display:none`.
4. **כותרת הסקשן: 40px משקל 500** — הרפרנס בונה היררכיה מגודל, לא ממשקל:
   כותרת גדולה ובהירה בזהב מעל כותרות כרטיס 16px בולד בדיו.
   **ראש הסקשן הוא שורה אחת** — גריד דו-טורי (`auto 1fr`). כותרת ב-`grid-column:1`
   (ימין ב-RTL), מטא (`.sec-eyebrow` / צ'יפים) ב-`grid-column:2; justify-self:end`.
   `.sec-sub` נופל לשורה 2. **חובה `grid-row: 1` מפורש** — סדר המקור הוא
   eyebrow→title, והצבה אוטומטית תפזר אותם לשתי שורות.
5. **פינות 0** — `--r-panel: 0`. הפאנל מאפס `--r-xs/sm/md/lg` ל-0 ואת `--sh-1/2/3`
   ל-`--sh-flat`, כך שכל מה שבתוכו ריבועי ושטוח. `--r-pill` נשאר לכפתורים.
6. **צפיפות** — `--panel-gap: 28px`. בנוסף, בתוך פאנל צעדי המרווח הגדולים יורדים
   דרגה (`--s6..--s9` → 24/32/40/56), ו-`section:not(.panel)` מקבל
   `--sec-y: clamp(40px,4vw,56px)` במקום עד 96px. גובה דף הבית ירד מ-6,320 ל-5,742px.
7. **`.panel-row`** — שני סקשנים משניים חולקים שורה (`1fr 1fr`), וההיררכיה נקראת
   מרוחב הכרטיס. בדף הבית: `#yizkor` + `#location`. מתפרק לעמודה אחת מתחת ל-900px.

מה **לא** הפך לפאנל, בכוונה: `#hero`, `#parasha`, `#donate-cta` בדף הבית, ו-`#shiur-section`
ב-zmanim / הסקשנים הכהים ב-videos. הם נשארים פסים ברוחב מלא ומספקים את קצב ההפסקה.

מלכודות שנתקלנו בהן:
- **`.gallery-strip-wrap`** היה אח של `.container` (full-bleed מכוון). הוזז פנימה
  ומקבל `margin-inline: calc(var(--s5) * -1)` כדי לדמם לקצוות הפאנל במקום לקצוות המסך.
- **`donate.html`** כבר בנוי כ-3fr/1fr עם רכס `.names-ticker`. הרכס הצטרף למערכת
  (משטח לבן + קו זהב עליון), והפאנלים בתוך `.donate-main` מקבלים `padding-inline: 0`
  כדי לא לייצר מרזב כפול.
- **`gallery.html`** לא היה לו `.container` כלל — נוסף, והפילטרים הועברו לתוך `.sec-head`
  כדי לשחזר את דפוס "כותרת מימין / צ'יפים משמאל" של הרפרנס.

## פוליש עיצוב (יולי 2026) — 7 שלבים

מעבר על כל האתר להעלאה מ"טוב" ל"פרימיום". כל השינויים בתוך מערכת "חותם":

1. **צבע/עומק:** הכפתור הראשי מקבל גרדיאנט זהב עליון-מואר (gold-400→600) עם
   קו-אור פנימי; הפסים הכהים (`#parasha`, `#donate-cta`) גרדיאנט אלכסוני
   teal-700→900 + שני מקורות אור רדיאליים + קו זהב עליון (`inset box-shadow`);
   רקע קרם עם wash חם + מרקם נייר `body::before` (SVG grain, opacity .035).
2. **תמונות:** רצועת גלריה עם `mask-image` שנמסה בקצוות; תמונת הרב עם פריים
   (מזרון לבן + גבול זהב + קו זהב מוסט מאחור).
3. **טקסט:** לכל `.sec-eyebrow` קו זהב קצר מוביל (`::before`), tracking הודק.
4. **היררכיה:** `.next-prayer` הפך לפס עדיפות — רקע gold-50, קו זהב עליון,
   נקודת דופק `.np-block-time::before`, שעה מוגדלת בזהב.
5. **תפריט:** `.mobile-bottom-nav` — גרדיאנט טיל, אינדיקטור זהב על הטאב הפעיל
   (`::before`), `env(safe-area-inset-bottom)`, `body` padding-bottom תואם.
6. **אנימציות:** קו הזהב תחת כותרת הסקשן נמתח ב-reveal
   (`.reveal.visible .sec-title::after { scaleX(1) }`, מ-scaleX(0)); `.gold-link`
   עם chevron `‹` שנע קדימה ב-hover; `.lift` צל רך (`--sh-3`).

> **צילום fullPage:** `shot.mjs` מאלץ `.visible` על כל `.reveal` לפני צילום —
> ה-observer מפגר אחרי גלילה תוכניתית ומשאיר סקשנים ב-opacity 0 (ארטיפקט צילום
> בלבד; באתר האמיתי רשת הביטחון ב-scroll חושפת אותם).

## זמני תפילה — אוטומציה (יולי 2026)

`prayer_times.time_rule`: `fixed` (שעה קבועה) · `sunset_minus_15` (מנחה — רבע
שעה לפני השקיעה) · `sunset` (ערבית — בזמן השקיעה). `resolvePrayerTime()` בשני
העמודים מחשב מול שקיעת היום מ-Hebcal. מנחה/ערבית של חול אוטומטיים — הגבאי לא
עורך אותם. תג "אוטומטי" מסמן באתר.

**רבנו תם:** `calcRTdeg()` = הבדלה (שקיעה + (זריחה − עלות)). **המניין** מתאסף
20 דק׳ אחרי ההבדלה → `calcRTminyan()` = `calcRTdeg + 20`. השורה "ערבית מוצ״ש
(רבנו תם)" מציגה את המניין; "יציאת שבת רבנו תם" מציגה את ההבדלה.

שני העמודים חולקים fetch יחיד של Hebcal (`getZmanim`/`getHebcal`) כדי שהשורות
האוטומטיות ייפתרו בציור הראשון בלי race.

**ניהול:** טאב "ניהול זמנים" — בורר "אופן חישוב" לכל שורה; שורה אוטומטית משביתה
את שדה השעה. שלוש עמודות (חול/שבת/חג) + "כניסת ויציאת חג" (`holiday_times`).

## התראות לקהילה

טבלה `announcements` ב-Supabase (קריאה ציבורית, כתיבה רק ל-`is_admin`).
מוצגת ב-`index.html` בסקשן `#announcements` — **מיד מתחת להירו**, ו**מוסתרת לגמרי**
(`hidden`) כשאין שורות פעילות, כדי שלא יישאר שלד ריק בדף.

- `level: 'urgent'` → נקודה זהובה פועמת וטקסט מודגש; `'info'` → נקודה טיל.
- `ends_at` → ההתראה נעלמת מעצמה. הסינון לפי חלון הזמן נעשה ב-JS ולא בשאילתה,
  כדי ששורה בלי חלון תמשיך להופיע.
- ניהול: טאב **"התראות"** ב-`admin.html` (ראשון ברשימה) — הוספה, הפעלה/כיבוי, מחיקה.
- טקסט ההתראה עובר `escHtml` לפני הזרקה ל-DOM — הוא מגיע מהאדמין ומוצג לציבור.

## זמני תפילה וחגים

**`prayer_times`** — `day_type` מקבל שלושה ערכים: `weekday` · `shabbat` · `holiday`.
כל אחד מרונדר כפאנל נפרד ב-`#prayers` בדף הבית וב-`zmanim.html`.
**פאנל החגים מוסתר** כשאין שורות `holiday` — שבוע רגיל מציג שני לוחות כרגיל.

**`holiday_times`** — כניסת ויציאת חג לתאריך ספציפי. זמני שבת מגיעים מ-Hebcal,
אבל זמני חג משתנים משנה לשנה ולכן נכתבים ידנית באדמין.
הדף מציג רק את **החג הקרוב הבא** (`starts_on >= today`, `limit 1`) — חג שעבר יורד מעצמו.

שניהם בטאב **"ניהול זמנים"** באדמין: שלוש עמודות לזמני תפילה, ומתחתן
"כניסת ויציאת חג".

> `.prayers-grid` עובר ל-3 עמודות דרך `:has(#holiday-panel:not([hidden]))` —
> בלי JS שנוגע בלייאאוט. דפדפן בלי `:has` פשוט נשאר עם שתי עמודות.

## אזור הניהול — כניסה

`admin.html` דורש session **וגם** `user_metadata.is_admin === true`.

- שם המשתמש הופך לאימייל דרך djb2: `toFakeEmail('מנהל אתר')` → `u1721410869@peer-yosef-auth.com`.
- **האדמין היחיד: שם משתמש `מנהל אתר`** (עם רווח).
- לעמוד יש **טופס התחברות משלו** בשער (`#admin-gate`). לפני כן הוא היה מפנה
  בשקט לדף הבית, וזו הייתה לולאה סגורה: הלינק "ניהול" בדף הבית מוסתר עד
  שאתה כבר אדמין, ולא הייתה שום דרך להתחבר.
- להוספת אדמין: `raw_user_meta_data` → `is_admin: true` (boolean, לא מחרוזת).

> יצירת משתמש ידנית ב-SQL תחזיר 500 בהתחברות אם חסרה שורה ב-`auth.identities`
> או אם עמודות טוקן הן NULL במקום `''`. עדיף ליצור דרך ה-API.

## לוגו · Favicon · SEO

מקור: `LOGO-PER-YOSEF.png` (1254×1254, חותם זהב עגול על רקע לבן).
הנכסים נוצרים ממנו עם `sharp` + מסכת עיגול (כדי שהפינות יהיו שקופות על ההדר):

| קובץ | שימוש |
|------|-------|
| `photo/logo-main.webp` / `.png` (256) | הדר + פוטר בכל העמודים |
| `photo/logo-512.png` | schema.org `logo` |
| `favicon.ico` (16/32/48/**96**) | **תג ה-`rel="icon"` היחיד** — זה מה שגוגל מציג בתוצאות |
| `photo/favicon-192/512.png` | אייקוני PWA ב-`site.webmanifest` בלבד — **לא** תגי `<link>` |
| `apple-touch-icon.png` (180) | iOS — משוטח על קרם, iOS מתעלם משקיפות |
| `photo/og-image.png` (1200×630) | `og:image` לשיתופים |
| `site.webmanifest` | PWA |

**כתובת האתר החי: `https://per-yosf.netlify.app/`** (Netlify). האתר עבר אירוח פעמיים —
`par-yosef.pages.dev` → `natan361.github.io/Par-Yosef/` → Netlify. ה-git remote עדיין
`github.com/natan361/Par-Yosef`. כל ה-canonical / `og:url` / `sitemap.xml` / `robots.txt`
חייבים להצביע על כתובת ה-Netlify — canonical שמצביע החוצה אומר לגוגל לא לאנדקס את הדף.

### כלל קשה: **תג `rel="icon"` אחד בדיוק בכל עמוד** (יולי 2026)

בעמודים היו שלושה תגי `rel="icon"` (ico + 96 + 192). גוגל תומך ב**פייבאיקון אחד
לכל hostname**, וכשעמוד מצהיר על כמה והאחד מהם לא עומד בדרישות — הוא מוותר על
הפייבאיקון לגמרי ומציג גלובוס גנרי. זה בדיוק מה שקרה: בטאב של הדפדפן הלוגו הופיע,
בגוגל לא.

```html
<link rel="icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

- **נתיב מוחלט** (`/`), לא יחסי — יחסי נפתר לא נכון בכל כתובת שאינה השורש.
- **בלי `sizes`**, ובלי להוסיף עוד תגי `icon`. יש הערה בקוד בכל עמוד שמסבירה למה.
- `apple-touch-icon` נשאר — אבל **לא** כי "זה rel אחר". גוגל מונה גם אותו כמקור
  פייבאיקון. הוא בטוח רק משום שהוא עצמו תקין: 180×180, מרובע, PNG.
- `favicon.ico` מכיל **16/32/48/96**. גוגל ממליץ "larger than 48x48", ולכן 48 לבדו
  היה בגבול התחתון. הפריימים ארוזים כ-**PNG בתוך ה-ICO** (PIL: מסכת עיגול ב-4x,
  `quantize` ל-64/128 צבעים, ואריזת מכולת ה-ICO ידנית — לא sharp, שכותב BMP) — פריים BMP של 48×48 שוקל 9,216 בייט לבדו, וזה מה שניפח את הקובץ הישן.
  הקובץ החדש: 7,840 בייט עם פריים נוסף.
- **גוגל מרענן פייבאיקון רק בסריקה הבאה של דף הבית**, וזה לוקח ימים עד שבועות.
  אין דרך להגיש פייבאיקון ישירות; URL Inspection → Request Indexing הוא המאיץ היחיד.

---

## סטטוס — מה בוצע ומה נשאר (עדכון אחרון: יוני 2026)

### בוצע

| # | מה | סטטוס |
|---|---|---|
| 1 | CSS responsive block | ✅ |
| 2 | Stats 3 עמודות desktop | ✅ |
| 3 | Lessons / Footer responsive | ✅ |
| 4 | playVideo() — iframe embed | ✅ |
| 5 | הילולות collapse | ✅ |
| 6 | גלריה לופ RTL תוקן | ✅ |
| 7 | Supabase — כל הטבלאות, Auth, Storage | ✅ |
| 8 | מערכת Auth (username+password, djb2 hash) | ✅ |
| 9 | Admin Phase 1 — admin.html + גלריה tab | ✅ |
| 10 | Admin Phase 2 — כל 5 טאבים + front-end integration | ✅ |
| 11 | Watch history — videos.html | ✅ |
| 12 | gallery.html — upload קהילתי + בקשת אישור | ✅ |

### נשאר לבצע — לפי סדר עדיפות

| # | מה | קובץ פרומפט |
|---|---|---|
| 1 | **גלריה** — לאמת ויזואלית שהלופ עובד + approved submissions מוצגים | — |
| 2 | **הירו mobile** — כותרת למעלה, כפתור למטה, פרצוף הרב באמצע | `prompt-ui-fixes.md` |
| 3 | **Stats mobile** — 3 מספרים בשורה אחת אופקית | `prompt-ui-fixes.md` |
| 4 | **UX מובייל כללי** — פרופורציות, ריווח, טיפוגרפיה, scroll-snap גלריה | `prompt-mobile-beautiful.md` |

### קבצי פרומפט בתיקייה

- `prompt-hero-gallery-hilulot.md` — הירו + גלריה + הילולות collapse
- `prompt-ui-fixes.md` — תיקוני UI: הירו mobile / stats / גלריה
- `prompt-mobile-beautiful.md` — 13 שיפורי UX מובייל
- `prompt-admin-phase2.md` — Admin Phase 2 (בוצע)

### הסבר הבאג של הגלריה (לידע עתידי)

בעמוד RTL (`dir="rtl"`), flex container מתמקם מהצד הימני של ה-wrap. זה גורם ל-`translateX(-50%)` לגלגל לכיוון הלא נכון (אל מחוץ לאזור הנראה). הפתרון שיושם:
1. `direction: ltr` על `.gallery-strip-wrap` — מאפס את נקודת ההתחלה לשמאל
2. JS מחשב `track.scrollWidth / 2` בפיקסלים מדויקים ומגדיר CSS variable `--gallery-scroll-end`
3. האנימציה מוחלת רק אחרי שהתמונות נטענו (`window.load`) כדי שהמדידה תהיה מדויקת
