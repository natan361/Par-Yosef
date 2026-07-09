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

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

// Submit event via index.html form
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const errs = [];
page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });

await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));

// Open event modal
await page.evaluate(() => document.getElementById('events-add-btn')?.click());
await new Promise(r => setTimeout(r, 500));

// Fill form
await page.type('#ev-name', 'שיעור מיוחד לכבוד שבת');
await page.evaluate(() => { document.getElementById('ev-date').value = '2026-07-20'; });
await page.type('#event-hdate', 'כ"ד תמוז');
await page.type('#ev-desc', 'שיעור מיוחד עם הרב');
await page.type('#ev-contact', 'דוד לוי');
await page.type('#ev-phone', 'בית הכנסת פאר יוסף, ירושלים');

await page.screenshot({ path: join(DIR, 'temporary screenshots', 'r2-form-filled.png') });
console.log('Form filled screenshot taken');

// Submit
await page.click('#event-form button[type="submit"]');
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: join(DIR, 'temporary screenshots', 'r2-form-success.png') });
console.log('Form submitted');
await page.close();

// Admin — check the pending event with location + hebrew_date
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

// Go to events tab
await adminPage.evaluate(() => {
  document.querySelectorAll('.admin-tab').forEach(b => { if (b.dataset.tab === 'events') b.click(); });
});
await new Promise(r => setTimeout(r, 1000));
await adminPage.evaluate(() => window.scrollTo(0, 500));
await new Promise(r => setTimeout(r, 300));
await adminPage.screenshot({ path: join(DIR, 'temporary screenshots', 'r2-admin-pending-card.png') });

// Read the pending card HTML
const cardHTML = await adminPage.evaluate(() => {
  const el = document.getElementById('events-pending');
  return el ? el.innerHTML.substring(0, 800) : 'NOT FOUND';
});
console.log('Pending card HTML:', cardHTML);

// Clean up — delete this test event
const { data } = await (await fetch(`${SUPABASE_URL}/rest/v1/events?title=eq.שיעור מיוחד לכבוד שבת&select=id`, {
  headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + loginData.access_token }
})).json();
if (data?.[0]?.id) {
  await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${data[0].id}`, {
    method: 'DELETE',
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + loginData.access_token }
  });
  console.log('Cleaned up test event id:', data[0].id);
}

await adminPage.close();
await browser.close();
console.log('Errors:', errs.filter(e => !e.includes('404')).join(' | ') || 'none');