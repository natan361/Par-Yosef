// optimize-images.mjs — generate WebP derivatives for the images the site actually uses.
// Originals are never modified or deleted. Re-run after adding new photos.
//   node optimize-images.mjs

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const DIR = 'photo';

// [source, output, max width, quality]
const JOBS = [
  ['heroimege.png',        'heroimege.webp',        1920, 80],
  ['heroimege.png',        'heroimege-mobile.webp',  900, 78],
  ['rabbi-photo.png',      'rabbi-photo.webp',       900, 82],
  ['rabbi-portrait.png',   'rabbi-portrait.webp',    900, 82],
  ['logo-main.png',        'logo-main.webp',         192, 90],
  ['community-01.jpeg',    'community-01.webp',      900, 80],
  ['community-02.jpeg',    'community-02.webp',      900, 80],
  ['community-03.jpeg',    'community-03.webp',      900, 80],
  ['community-05.jpeg',    'community-05.webp',      900, 80],
  ['img_06_480x640.jpeg',  'img_06_480x640.webp',    640, 80],
  ['img_11_480x640.jpeg',  'img_11_480x640.webp',    640, 80],
  ['img_15_480x640.jpeg',  'img_15_480x640.webp',    640, 80],
  ['img_18_480x640.jpeg',  'img_18_480x640.webp',    640, 80],
  ['img_24_480x640.jpeg',  'img_24_480x640.webp',    640, 80],
  ['img_30_480x640.jpeg',  'img_30_480x640.webp',    640, 80],
  ['img_32_600x800.jpeg',  'img_32_600x800.webp',    800, 80],
];

let before = 0, after = 0;
for (const [src, out, width, quality] of JOBS) {
  const srcPath = join(DIR, src), outPath = join(DIR, out);
  try {
    const meta = await sharp(srcPath).metadata();
    await sharp(srcPath)
      .resize({ width: Math.min(width, meta.width), withoutEnlargement: true })
      .webp({ quality })
      .toFile(outPath);
    const a = (await stat(srcPath)).size, b = (await stat(outPath)).size;
    before += a; after += b;
    const pct = Math.round((1 - b / a) * 100);
    console.log(`${out.padEnd(26)} ${String(Math.round(a / 1024)).padStart(5)}KB -> ${String(Math.round(b / 1024)).padStart(4)}KB  (-${pct}%)`);
  } catch (e) {
    console.log(`SKIP ${src}: ${e.message}`);
  }
}
console.log(`\nTotal: ${(before / 1e6).toFixed(2)}MB -> ${(after / 1e6).toFixed(2)}MB  (-${Math.round((1 - after / before) * 100)}%)`);
