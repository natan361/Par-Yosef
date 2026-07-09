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
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const consoleErrors = [];
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

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

// Click events tab
await page.evaluate(() => {
  document.querySelectorAll('.admin-tab').forEach(b => { if (b.dataset.tab === 'events') b.click(); });
});
await new Promise(r => setTimeout(r, 1000));

// Scroll down to see pending events list
await page.evaluate(() => window.scrollTo(0, 600));
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: join(DIR, 'temporary screenshots', 'fix-events-pending-list.png') });
console.log('Events pending list screenshotted');

// Check the events section content
const eventsContent = await page.evaluate(() => {
  const pending = document.getElementById('events-pending');
  const approved = document.getElementById('events-approved-list');
  return {
    pendingHTML: pending ? pending.innerHTML.substring(0, 500) : 'NOT FOUND',
    approvedHTML: approved ? approved.innerHTML.substring(0, 300) : 'NOT FOUND',
    pendingVisible: pending ? true : false
  };
});
console.log('Events pending container:', JSON.stringify(eventsContent, null, 2));

await browser.close();
console.log('Console errors:', consoleErrors.length ? consoleErrors.slice(0,5).join(' | ') : 'none');