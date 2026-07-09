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
page.on('console', msg => { 
  if (msg.type() === 'error') consoleErrors.push(msg.text());
  if (msg.type() === 'log') console.log('[page]', msg.text());
});

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

// Click the "אשר" button on the pending event (id=2)
const approveBtn = await page.$('.btn-approve');
if (approveBtn) {
  await approveBtn.click();
  console.log('Clicked approve button');
  await new Promise(r => setTimeout(r, 1500));
} else {
  console.log('No approve button found');
}

// Scroll to approved section
await page.evaluate(() => window.scrollTo(0, 600));
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: join(DIR, 'temporary screenshots', 'fix-events-after-approve.png') });
console.log('After-approve screenshot taken');

// Now delete the tfc test event (id=1) and the test event (id=2) via API
const delRes1 = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.1`, {
  method: 'DELETE',
  headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + loginData.access_token }
});
const delRes2 = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.2`, {
  method: 'DELETE', 
  headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + loginData.access_token }
});
console.log('Deleted test events:', delRes1.status, delRes2.status);

await browser.close();
console.log('Console errors:', consoleErrors.length ? consoleErrors.slice(0,5).join(' | ') : 'none');