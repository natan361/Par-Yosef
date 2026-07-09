import puppeteer from 'puppeteer';
import { join } from 'path';
import { fileURLToPath } from 'url';
const DIR = fileURLToPath(new URL('.', import.meta.url));

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

async function shot(viewport, url, filename, actionFn, waitMs) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const errs = [];
  page.on('console', m => { if (m.type()==='error' && !m.text().includes('404')) errs.push(m.text()); });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, waitMs || 2000));
  if (actionFn) await actionFn(page);
  await page.screenshot({ path: join(DIR, 'temporary screenshots', filename) });
  await page.close();
  return errs;
}

// 1. Desktop — modal open
const e1 = await shot(
  { width: 1440, height: 900 },
  'http://localhost:3000',
  'form-r1-desktop-modal.png',
  async (page) => {
    await page.evaluate(() => document.getElementById('events-add-btn')?.click());
    await new Promise(r => setTimeout(r, 500));
  }
);
console.log('desktop modal errors:', e1.join(' | ') || 'none');

// 2. Mobile — modal open
const e2 = await shot(
  { width: 375, height: 812 },
  'http://localhost:3000',
  'form-r1-mobile-modal.png',
  async (page) => {
    await page.evaluate(() => document.getElementById('events-add-btn')?.click());
    await new Promise(r => setTimeout(r, 500));
  }
);
console.log('mobile modal errors:', e2.join(' | ') || 'none');

// 3. Admin tabs — no hilulot
const SUPABASE_URL = 'https://bfjigrvzscvokmlzrlhv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmamlncnZ6c2N2b2ttbHpybGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjQyNzIsImV4cCI6MjA5ODI0MDI3Mn0.NnGeJHKsugrpiHyayoNKLOMrFd11Vbhsm2iYL879nH8';
const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
  body: JSON.stringify({ email: 'u1721410869@peer-yosef-auth.com', password: 'natyML720556807812' })
});
const loginData = await loginRes.json();

const adminPage = await browser.newPage();
await adminPage.setViewport({ width: 1440, height: 900 });
await adminPage.goto('http://localhost:3000/admin.html', { waitUntil: 'domcontentloaded' });
const sessionData = {
  access_token: loginData.access_token, token_type: 'bearer',
  expires_in: 3600, expires_at: Math.floor(Date.now()/1000)+3600,
  refresh_token: loginData.refresh_token, user: loginData.user
};
await adminPage.evaluate((k,v) => localStorage.setItem(k, JSON.stringify(v)),
  'sb-bfjigrvzscvokmlzrlhv-auth-token', sessionData);
await adminPage.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));
await adminPage.screenshot({ path: join(DIR, 'temporary screenshots', 'form-r1-admin.png') });
await adminPage.close();
console.log('admin screenshot done');

await browser.close();