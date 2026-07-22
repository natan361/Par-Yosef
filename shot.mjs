// shot.mjs — screenshot helper that skips the welcome popup
// Usage: node shot.mjs <page> <viewport> <name> [--full]
//   node shot.mjs index.html desktop hero
//   node shot.mjs videos.html mobile vids --full
// No leading slash — Git Bash rewrites a bare "/" into a Windows path.
import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const PATHNAME = '/' + (process.argv[2] || 'index.html').replace(/^\/+/, '');
const LABEL    = process.argv[3] || 'desktop';
const NAME     = process.argv[4] || 'shot';
const FULL     = process.argv.includes('--full');
const DIR      = './temporary screenshots';

const VIEWPORTS = {
  mobile:  { width: 375,  height: 812,  deviceScaleFactor: 2 },
  tablet:  { width: 768,  height: 1024, deviceScaleFactor: 2 },
  desktop: { width: 1440, height: 900,  deviceScaleFactor: 1 },
};

if (!existsSync(DIR)) await mkdir(DIR, { recursive: true });

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport(VIEWPORTS[LABEL] ?? VIEWPORTS.desktop);

// The welcome modal gates on sessionStorage, so pre-set it before any script runs
await page.evaluateOnNewDocument(() => {
  sessionStorage.setItem('popup_dismissed', '1');
});

await page.goto(`http://localhost:3000${PATHNAME}`, { waitUntil: 'networkidle2', timeout: 20000 });
await page.evaluateHandle('document.fonts.ready');

// Sections reveal on IntersectionObserver, so a full-page capture of a page
// that was never scrolled comes back blank. Walk it down, then return to top.
if (FULL) {
  await page.evaluate(async () => {
    // half-viewport steps: a 0.8 step can carry a full-height section from
    // below the fold to above it between two frames, and IntersectionObserver
    // never samples it — the section then photographs blank
    const step = window.innerHeight * 0.5;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo(0, 0);
  });
}
await new Promise((r) => setTimeout(r, 1200)); // let entrance animations settle

const path = `${DIR}/${NAME}-${LABEL}.png`;
await page.screenshot({ path, fullPage: FULL });
await browser.close();
console.log(`saved ${path}`);
