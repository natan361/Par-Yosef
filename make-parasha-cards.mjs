// make-parasha-cards.mjs — brand fallback image for every parasha
//
//   node make-parasha-cards.mjs
//
// Writes photo/parasha/<slug>.webp for all 54 portions plus the 5 combined
// ones, using the site's own palette and the gold seal. These are FALLBACKS:
// drop a real image at the same path and it wins — the generator skips any
// slug that already has a non-generated file (pass --force to rebuild all).
//
// Filenames are ASCII on purpose; Hebrew filenames break in browsers.

import sharp from 'sharp';
import { mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';

const OUT = 'photo/parasha';
const W = 1200, H = 675;
const FORCE = process.argv.includes('--force');

// [hebrew name, ascii slug, book]
const BOOKS = {
  bereshit: 'ספר בראשית', shemot: 'ספר שמות', vayikra: 'ספר ויקרא',
  bamidbar: 'ספר במדבר', devarim: 'ספר דברים',
};

const PARASHOT = [
  ['בראשית','bereshit','bereshit'],       ['נח','noach','bereshit'],
  ['לך לך','lech-lecha','bereshit'],      ['וירא','vayera','bereshit'],
  ['חיי שרה','chayei-sarah','bereshit'],  ['תולדות','toldot','bereshit'],
  ['ויצא','vayetze','bereshit'],          ['וישלח','vayishlach','bereshit'],
  ['וישב','vayeshev','bereshit'],         ['מקץ','miketz','bereshit'],
  ['ויגש','vayigash','bereshit'],         ['ויחי','vayechi','bereshit'],

  ['שמות','shemot','shemot'],             ['וארא','vaera','shemot'],
  ['בא','bo','shemot'],                   ['בשלח','beshalach','shemot'],
  ['יתרו','yitro','shemot'],              ['משפטים','mishpatim','shemot'],
  ['תרומה','terumah','shemot'],           ['תצוה','tetzaveh','shemot'],
  ['כי תשא','ki-tisa','shemot'],          ['ויקהל','vayakhel','shemot'],
  ['פקודי','pekudei','shemot'],

  ['ויקרא','vayikra','vayikra'],          ['צו','tzav','vayikra'],
  ['שמיני','shemini','vayikra'],          ['תזריע','tazria','vayikra'],
  ['מצורע','metzora','vayikra'],          ['אחרי מות','acharei-mot','vayikra'],
  ['קדושים','kedoshim','vayikra'],        ['אמור','emor','vayikra'],
  ['בהר','behar','vayikra'],              ['בחוקותי','bechukotai','vayikra'],

  ['במדבר','bamidbar','bamidbar'],        ['נשא','naso','bamidbar'],
  ['בהעלותך','behaalotcha','bamidbar'],   ['שלח','shlach','bamidbar'],
  ['קורח','korach','bamidbar'],           ['חוקת','chukat','bamidbar'],
  ['בלק','balak','bamidbar'],             ['פינחס','pinchas','bamidbar'],
  ['מטות','matot','bamidbar'],            ['מסעי','masei','bamidbar'],

  ['דברים','devarim','devarim'],          ['ואתחנן','vaetchanan','devarim'],
  ['עקב','ekev','devarim'],               ['ראה','reeh','devarim'],
  ['שופטים','shoftim','devarim'],         ['כי תצא','ki-teitzei','devarim'],
  ['כי תבוא','ki-tavo','devarim'],        ['נצבים','nitzavim','devarim'],
  ['וילך','vayelech','devarim'],          ['האזינו','haazinu','devarim'],
  ['וזאת הברכה','vezot-haberachah','devarim'],

  // combined readings in a 12-month year
  ['תזריע-מצורע','tazria-metzora','vayikra'],
  ['אחרי-קדושים','acharei-kedoshim','vayikra'],
  ['בהר-בחוקותי','behar-bechukotai','vayikra'],
  ['מטות-מסעי','matot-masei','bamidbar'],
  ['נצבים-וילך','nitzavim-vayelech','devarim'],
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// long names need to step down or they run past the card edge
const fitSize = (name) => (name.length > 12 ? 78 : name.length > 8 ? 92 : 108);

const card = (name, book) => `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="8%" r="86%">
      <stop offset="0%"  stop-color="#2B7C8D"/>
      <stop offset="62%" stop-color="#14414C"/>
      <stop offset="100%" stop-color="#0E2B33"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- the seal's double ring, the same signature the section headers use -->
  <rect x="54" y="54" width="${W - 108}" height="${H - 108}" fill="none"
        stroke="#CC8800" stroke-opacity=".45" stroke-width="1"/>
  <rect x="62" y="62" width="${W - 124}" height="${H - 124}" fill="none"
        stroke="#CC8800" stroke-opacity=".28" stroke-width="1"/>

  <text x="${W / 2}" y="252" text-anchor="middle" direction="rtl"
        font-family="'Segoe UI', Arial" font-size="30" letter-spacing="6"
        fill="#F0DCA8" fill-opacity=".85">${esc(book)}</text>

  <text x="${W / 2}" y="392" text-anchor="middle" direction="rtl"
        font-family="David, 'Segoe UI', Arial" font-size="${fitSize(name)}"
        font-weight="700" fill="#FFFFFF">${esc('פרשת ' + name)}</text>

  <line x1="${W / 2 - 110}" y1="446" x2="${W / 2 + 110}" y2="446" stroke="#CC8800" stroke-width="2"/>
  <line x1="${W / 2 - 110}" y1="452" x2="${W / 2 + 110}" y2="452" stroke="#CC8800" stroke-width="1" stroke-opacity=".6"/>

  <text x="${W / 2}" y="520" text-anchor="middle" direction="rtl"
        font-family="'Segoe UI', Arial" font-size="26"
        fill="#B7DAE0" fill-opacity=".78">ישיבת פאר יוסף</text>
</svg>`;

await mkdir(OUT, { recursive: true });
const existing = new Set(await readdir(OUT).catch(() => []));

const seal = existsSync('photo/logo-512.png')
  ? await sharp('photo/logo-512.png').resize(96, 96).toBuffer()
  : null;

let made = 0, kept = 0;
for (const [name, slug, book] of PARASHOT) {
  const file = `${slug}.webp`;
  if (!FORCE && existing.has(file)) { kept++; continue; }

  const layers = [];
  if (seal) layers.push({ input: seal, top: 96, left: Math.round(W / 2 - 48) });

  await sharp(Buffer.from(card(name, BOOKS[book])))
    .composite(layers)
    .webp({ quality: 88 })
    .toFile(`${OUT}/${file}`);
  made++;
}

console.log(`parasha cards → ${OUT}\n  generated: ${made}\n  left alone: ${kept}${kept ? '  (run with --force to rebuild)' : ''}`);
