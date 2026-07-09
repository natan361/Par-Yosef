import puppeteer from 'puppeteer';
import { join } from 'path';
import { fileURLToPath } from 'url';
const DIR = fileURLToPath(new URL('.', import.meta.url));

const SUPABASE_URL = 'https://bfjigrvzscvokmlzrlhv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmamlncnZ6c2N2b2ttbHpybGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjQyNzIsImV4cCI6MjA5ODI0MDI3Mn0.NnGeJHKsugrpiHyayoNKLOMrFd11Vbhsm2iYL879nH8';

// Login as the pre-seeded admin
const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
  body: JSON.stringify({ email: 'u1721410869@peer-yosef-auth.com', password: 'natyML720556807812' })
});
const loginData = await loginRes.json();
if (loginData.error) { console.error('Login error:', loginData.error); process.exit(1); }
console.log('Logged in as:', loginData.user?.user_metadata?.display_name);

// Also insert a test pending event directly so we have data to show
const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + loginData.access_token,
    Prefer: 'return=minimal'
  },
  body: JSON.stringify({
    title: 'שיעור בענין האמונה — לבדיקה',
    event_date: '2026-07-15',
    event_type: 'event',
    description: 'שיעור מיוחד לקיץ',
    status: 'pending',
    submitted_by_name: 'יוסי כהן'
  })
});
console.log('Insert pending event status:', insertRes.status);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const consoleErrors = [];
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

// Inject session
await page.goto('http://localhost:3000/admin.html', { waitUntil: 'domcontentloaded' });
const sessionData = {
  access_token: loginData.access_token, token_type: 'bearer',
  expires_in: 3600, expires_at: Math.floor(Date.now()/1000)+3600,
  refresh_token: loginData.refresh_token, user: loginData.user
};
await page.evaluate((key, val) => localStorage.setItem(key, JSON.stringify(val)),
  'sb-bfjigrvzscvokmlzrlhv-auth-token', sessionData);

await page.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));

// Gallery tab — default (pending filter)
await page.screenshot({ path: join(DIR, 'temporary screenshots', 'fix-gallery-pending.png') });
console.log('Gallery pending screenshotted');

// Click approved filter
await page.evaluate(() => {
  document.querySelectorAll('.filter-btn').forEach(b => {
    if (b.textContent.includes('מאושרים')) b.click();
  });
});
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: join(DIR, 'temporary screenshots', 'fix-gallery-approved.png') });
console.log('Gallery approved screenshotted');

// Events tab
await page.evaluate(() => {
  document.querySelectorAll('.admin-tab').forEach(b => { if (b.dataset.tab === 'events') b.click(); });
});
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: join(DIR, 'temporary screenshots', 'fix-events-tab.png') });
console.log('Events tab screenshotted');

// Videos tab
await page.evaluate(() => {
  document.querySelectorAll('.admin-tab').forEach(b => { if (b.dataset.tab === 'videos') b.click(); });
});
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: join(DIR, 'temporary screenshots', 'fix-videos-tab.png') });
console.log('Videos tab screenshotted');

// News tab
await page.evaluate(() => {
  document.querySelectorAll('.admin-tab').forEach(b => { if (b.dataset.tab === 'news') b.click(); });
});
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: join(DIR, 'temporary screenshots', 'fix-news-tab.png') });
console.log('News tab screenshotted');

await browser.close();
console.log('Console errors:', consoleErrors.length ? consoleErrors.join(' | ') : 'none');