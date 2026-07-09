import puppeteer from 'puppeteer';
import { join } from 'path';
import { fileURLToPath } from 'url';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const USERNAME = 'נתן חיים ' + Date.now().toString().slice(-4);
const PASSWORD = '123456';

function toFakeEmail(username) {
  let hash = 5381;
  for (let i = 0; i < username.length; i++) {
    hash = ((hash << 5) + hash) + username.charCodeAt(i);
    hash = hash & 0x7fffffff;
  }
  return 'u' + hash + '@peer-yosef-auth.com';
}

console.log(`Username: "${USERNAME}"`);
console.log(`Email: ${toFakeEmail(USERNAME)}`);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // --- SIGNUP ---
  console.log('\n=== SIGNUP ===');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.$eval('#auth-btn', el => el.click());
  await new Promise(r => setTimeout(r, 800));
  await page.$eval('#tab-signup', el => el.click());
  await new Promise(r => setTimeout(r, 300));

  const uInput = await page.$('#signup-form input[type="text"]');
  await uInput.click({ clickCount: 3 });
  await uInput.type(USERNAME);

  const pInput = await page.$('#signup-form input[type="password"]');
  await pInput.click({ clickCount: 3 });
  await pInput.type(PASSWORD);

  let capturedEmail = null;
  page.on('request', req => {
    if (req.url().includes('supabase') && req.postData()) {
      try { const b = JSON.parse(req.postData()); if (b.email) capturedEmail = b.email; } catch(e) {}
    }
  });

  await page.$eval('#signup-form button[type="submit"]', el => el.click());
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: join(DIR, 'temporary screenshots', 'test2-signup.png') });

  const signupErr = await page.$eval('#signup-error', el => el.textContent.trim()).catch(() => '');
  const headerAfterSignup = await page.$eval('#auth-btn', el => el.textContent.trim()).catch(() => '');

  console.log(`Email sent: ${capturedEmail}`);
  console.log(`Signup error: "${signupErr}"`);
  console.log(`Header: "${headerAfterSignup}"`);

  if (signupErr) { console.log('\n❌ SIGNUP FAILED'); process.exit(1); }
  console.log('✅ Signup OK');

  // --- LOGIN (fresh page) ---
  console.log('\n=== LOGIN ===');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  const headerAfterReload = await page.$eval('#auth-btn', el => el.textContent.trim()).catch(() => '');
  console.log(`Header after reload: "${headerAfterReload}"`);

  if (headerAfterReload !== 'כניסה / הרשמה') {
    console.log(`✅ Session auto-restored — showing: "${headerAfterReload}"`);
  } else {
    await page.$eval('#auth-btn', el => el.click());
    await new Promise(r => setTimeout(r, 800));
    const loginTab = await page.$('#tab-login');
    if (loginTab) { await loginTab.click(); await new Promise(r => setTimeout(r, 300)); }

    const lu = await page.$('#login-form input[type="text"]');
    if (lu) { await lu.click({ clickCount: 3 }); await lu.type(USERNAME); }
    const lp = await page.$('#login-form input[type="password"]');
    if (lp) { await lp.click({ clickCount: 3 }); await lp.type(PASSWORD); }

    await page.$eval('#login-form button[type="submit"]', el => el.click());
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: join(DIR, 'temporary screenshots', 'test2-login.png') });

    const loginErr = await page.$eval('#login-error', el => el.textContent.trim()).catch(() => '');
    const headerAfterLogin = await page.$eval('#auth-btn', el => el.textContent.trim()).catch(() => '');
    console.log(`Login error: "${loginErr}"`);
    console.log(`Header after login: "${headerAfterLogin}"`);

    if (loginErr) { console.log('\n❌ LOGIN FAILED'); process.exit(1); }
    console.log(`✅ Login OK — header: "${headerAfterLogin}"`);
  }

  console.log('\n✅ ALL TESTS PASSED');
} finally {
  await browser.close();
  const fs = await import('fs');
  fs.default.unlinkSync(new URL(import.meta.url));
}
