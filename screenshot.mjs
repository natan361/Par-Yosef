// screenshot.mjs — Automated screenshot tool for ישיבת פאר יוסף
// Usage:
//   node screenshot.mjs                              → desktop, localhost:3000
//   node screenshot.mjs http://localhost:3000        → desktop
//   node screenshot.mjs http://localhost:3000 mobile → 375px viewport
//   node screenshot.mjs http://localhost:3000 tablet → 768px viewport
//   node screenshot.mjs http://localhost:3000 label  → custom label suffix

import puppeteer from 'puppeteer';
import { mkdir, access } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// ── Config ─────────────────────────────────────────────────────────────────
const URL     = process.argv[2] || 'http://localhost:3000';
const LABEL   = process.argv[3] || '';
const DIR     = './temporary screenshots';

const VIEWPORTS = {
  mobile: { width: 375,  height: 812,  deviceScaleFactor: 2 },
  tablet: { width: 768,  height: 1024, deviceScaleFactor: 2 },
  desktop:{ width: 1440, height: 900,  deviceScaleFactor: 1 },
};

const viewport = VIEWPORTS[LABEL] ?? VIEWPORTS.desktop;
const suffix   = LABEL ? `-${LABEL}` : '';

// ── Find next available filename ───────────────────────────────────────────
if (!existsSync(DIR)) await mkdir(DIR, { recursive: true });

let n = 1;
while (existsSync(join(DIR, `screenshot-${n}${suffix}.png`))) n++;
const filepath = join(DIR, `screenshot-${n}${suffix}.png`);

// ── Launch browser ─────────────────────────────────────────────────────────
// Try Puppeteer's bundled Chromium first, then fall back to installed Chrome
let browser;
try {
  browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
} catch {
  // Fallback: try common Chrome locations on Windows
  const chromePaths = [
    'C:/Users/ntyym/AppData/Local/Temp/puppeteer-test/chrome-win/chrome.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Users/ntyym/AppData/Local/Google/Chrome/Application/chrome.exe',
  ];
  let executablePath;
  for (const p of chromePaths) {
    try { await access(p); executablePath = p; break; } catch { /* try next */ }
  }
  if (!executablePath) {
    console.error('❌ Chrome not found. Install puppeteer: npm install puppeteer');
    process.exit(1);
  }
  browser = await puppeteer.launch({ executablePath, headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'] });
}

// ── Take screenshot ────────────────────────────────────────────────────────
const page = await browser.newPage();
await page.setViewport(viewport);

console.log(`📸 Navigating to ${URL} (${viewport.width}×${viewport.height})...`);
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 15000 });

// Wait for Hebrew fonts to load
await page.evaluateHandle('document.fonts.ready');

await page.screenshot({ path: filepath, fullPage: false });
await browser.close();

console.log(`✅ Screenshot saved: ${filepath}`);
console.log(`   Viewport: ${viewport.width}×${viewport.height}`);
console.log(`\n→ Now read the file with the Read tool to analyze it visually.`);
