import puppeteer from 'puppeteer';
import { join } from 'path';
import { fileURLToPath } from 'url';
const DIR = fileURLToPath(new URL('.', import.meta.url));

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

// Helper
async function shot(url, filename, scrollY = 0, waitMs = 3000) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errs = [];
  page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, waitMs));
  if (scrollY) await page.evaluate(y => window.scrollTo(0,y), scrollY);
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: join(DIR, 'temporary screenshots', filename) });
  await page.close();
  return errs;
}

// index.html — scroll to events section
const errs1 = await shot('http://localhost:3000/index.html', 'frontend-index-events.png', 2200, 4000);
console.log('index errors:', errs1.filter(e => !e.includes('404')).join(' | ') || 'none');

// videos.html
const errs2 = await shot('http://localhost:3000/videos.html', 'frontend-videos.png', 0, 3000);
console.log('videos errors:', errs2.filter(e => !e.includes('404')).join(' | ') || 'none');

// donate.html
const errs3 = await shot('http://localhost:3000/donate.html', 'frontend-donate.png', 0, 3000);
console.log('donate errors:', errs3.filter(e => !e.includes('404')).join(' | ') || 'none');

await browser.close();
console.log('Done');