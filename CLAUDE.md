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

## CSS Variables — הערכים האמיתיים ב-index.html

> שים לב: הפלטה בפועל שונה מהתיעוד הכללי למעלה. אלה הערכים שבקוד:

```
--bg:           #f7f4ef   (קרם — רקע ראשי)
--bg-card:      #ffffff   (לבן — כרטיסים)
--bg-dark:      #1E5A68   (טיל/ירוק-כהה — header, stats, events, footer)
--gold:         #CC8800   (זהב — accent ראשי)
--gold-light:   #E6A800   (זהב בהיר)
--text:         #1C3D52   (טקסט ראשי)
--muted:        #6B7280   (טקסט משני)
--border:       #E5E2DA   (גבולות)
```

פונטים בפועל: `Noto Serif Hebrew` (כותרות) + `Noto Sans Hebrew` (גוף)

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
