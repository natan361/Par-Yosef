import puppeteer from 'puppeteer';
import { join } from 'path';

const SSDIR = 'c:\\Users\\ntyym\\OneDrive\\Desktop\\קלוד. אתרים . תוספים. וכו\\פאר יוסף\\temporary screenshots';
const SUPABASE_URL = 'https://bfjigrvzscvokmlzrlhv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmamlncnZ6c2N2b2ttbHpybGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjQyNzIsImV4cCI6MjA5ODI0MDI3Mn0.NnGeJHKsugrpiHyayoNKLOMrFd11Vbhsm2iYL879nH8';

const loginRes = await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=password', {
  method:'POST',
  headers:{'Content-Type':'application/json',apikey:SUPABASE_KEY},
  body:JSON.stringify({email:'u1721410869@peer-yosef-auth.com',password:'natyML720556807812'})
});
const loginData = await loginRes.json();

const browser = await puppeteer.launch({ headless:true, args:['--no-sandbox'] });

const page = await browser.newPage();
await page.setViewport({width:1440,height:900});
const errs=[];
page.on('console',m=>{
  if(m.type()==='error'&&!m.text().includes('404'))errs.push(m.text());
});
await page.goto('http://localhost:3000',{waitUntil:'networkidle0',timeout:20000});
await new Promise(r=>setTimeout(r,2000));

// Open modal
await page.evaluate(()=>document.getElementById('events-add-btn')?.click());
await new Promise(r=>setTimeout(r,500));

// Fill all fields
await page.type('#ev-title','הילולת רבי נחמן');
await page.evaluate(()=>{document.getElementById('ev-date').value='2026-08-01';});
await page.evaluate(()=>{document.getElementById('ev-time').value='20:00';});
await page.type('#ev-location','בית הכנסת פאר יוסף');
await page.type('#ev-name','חיים כהן');

await page.screenshot({path:SSDIR+'\\\\form-r2-filled.png'});
console.log('Form filled');

await page.click('.btn-submit-event');
await new Promise(r=>setTimeout(r,3500));
await page.screenshot({path:SSDIR+'\\\\form-r2-success.png'});
console.log('Submit done, errors:', errs.join('|')||'none');
await page.close();

// Admin check
const adminPage = await browser.newPage();
await adminPage.setViewport({width:1440,height:900});
await adminPage.goto('http://localhost:3000/admin.html',{waitUntil:'domcontentloaded'});
const sd={
  access_token:loginData.access_token,token_type:'bearer',
  expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,
  refresh_token:loginData.refresh_token,user:loginData.user
};
await adminPage.evaluate((k,v)=>localStorage.setItem(k,JSON.stringify(v)),
  'sb-bfjigrvzscvokmlzrlhv-auth-token',sd);
await adminPage.goto('http://localhost:3000/admin.html',{waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,2000));
await adminPage.evaluate(()=>{
  document.querySelectorAll('.admin-tab').forEach(b=>{if(b.dataset.tab==='events')b.click();});
});
await new Promise(r=>setTimeout(r,1000));
await adminPage.evaluate(()=>window.scrollTo(0,500));
await new Promise(r=>setTimeout(r,300));
await adminPage.screenshot({path:SSDIR+'\\\\form-r2-admin-card.png'});

const html=await adminPage.evaluate(()=>{
  const el=document.getElementById('events-pending');
  return el?el.innerText:'NOT FOUND';
});
console.log('Pending card text:', html.substring(0,300));

// Cleanup via REST
await fetch(SUPABASE_URL+'/rest/v1/events?submitted_by_name=eq.חיים%20כהן',{
  method:'DELETE',
  headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+loginData.access_token}
});
console.log('Cleanup done');

await adminPage.close();
await browser.close();