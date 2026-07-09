import puppeteer from 'puppeteer';
import { join } from 'path';
import { fileURLToPath } from 'url';
const DIR = fileURLToPath(new URL('.', import.meta.url));

const SUPABASE_URL = 'https://bfjigrvzscvokmlzrlhv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmamlncnZ6c2N2b2ttbHpybGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjQyNzIsImV4cCI6MjA5ODI0MDI3Mn0.NnGeJHKsugrpiHyayoNKLOMrFd11Vbhsm2iYL879nH8';

const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
  body: JSON.stringify({ email: 'u1721410869@peer-yosef-auth.com', password: 'natyML720556807812' })
});
const loginData = await loginRes.json();
if (loginData.error) { console.error('Login error:', loginData.error); process.exit(1); }

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

async function shot(url, filename, scrollY, waitMs, setupFn) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errs = [];
  page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, waitMs || 2000));
  if (setupFn) await setupFn(page);
  if (scrollY) { await page.evaluate(y => window.scrollTo(0,y), scrollY); await new Promise(r => setTimeout(r, 300)); }
  await page.screenshot({ path: join(DIR, 'temporary screenshots', filename) });
  await page.close();
  return errs.filter(e => !e.includes('404'));
}

async function mobileShot(url, filename, scrollY, waitMs) {
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 });
  const errs = [];
  page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, waitMs || 2000));
  if (scrollY) { await page.evaluate(y => window.scrollTo(0,y), scrollY); await new Promise(r => setTimeout(r, 300)); }
  await page.screenshot({ path: join(DIR, 'temporary screenshots', filename) });
  await page.close();
  return errs.filter(e => !e.includes('404'));
}

// 1. index.html desktop — event modal open
const e1 = await shot('http://localhost:3000', 'r1-index-desktop.png', 0, 3000, async (page) => {
  await page.evaluate(() => {
    const btn = document.getElementById('events-add-btn');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
});
console.log('index desktop errors:', e1.join(' | ') || 'none');

// 2. index.html — hilulot section desktop (ראה עוד should be hidden)
const e2 = await shot('http://localhost:3000', 'r1-index-hilulot.png', 0, 4000, async (page) => {
  await page.evaluate(() => {
    const sec = document.getElementById('yizkor');
    if (sec) sec.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 300));
});
console.log('hilulot errors:', e2.join(' | ') || 'none');

// 3. index.html mobile — hilulot (ראה עוד should be visible)
const e3 = await mobileShot('http://localhost:3000', 'r1-index-hilulot-mobile.png', 0, 4000);
console.log('mobile errors:', e3.join(' | ') || 'none');

// 4. admin.html — events tab with no hilulot tab
const adminPage = await browser.newPage();
await adminPage.setViewport({ width: 1440, height: 900 });
await adminPage.goto('http://localhost:3000/admin.html', { waitUntil: 'domcontentloaded' });
const sessionData = {
  access_token: loginData.access_token, token_type: 'bearer',
  expires_in: 3600, expires_at: Math.floor(Date.now()/1000)+3600,
  refresh_token: loginData.refresh_token, user: loginData.user
};
await adminPage.evaluate((key, val) => localStorage.setItem(key, JSON.stringify(val)),
  'sb-bfjigrvzscvokmlzrlhv-auth-token', sessionData);
await adminPage.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));
await adminPage.screenshot({ path: join(DIR, 'temporary screenshots', 'r1-admin-tabs.png') });
await adminPage.evaluate(() => {
  document.querySelectorAll('.admin-tab').forEach(b => { if (b.dataset.tab === 'events') b.click(); });
});
await new Promise(r => setTimeout(r, 1000));
await adminPage.screenshot({ path: join(DIR, 'temporary screenshots', 'r1-admin-events.png') });
await adminPage.close();
console.log('Admin screenshots done');

await browser.close();