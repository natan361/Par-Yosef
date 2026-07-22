import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });
await p.evaluateOnNewDocument(() => sessionStorage.setItem('popup_dismissed','1'));
await p.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 800));
await p.click('#lang-toggle');           // the real user path
await new Promise(r => setTimeout(r, 800));
const res = await p.evaluate(() => {
  const keys = [...document.querySelectorAll('[data-i18n]')].map(e => e.dataset.i18n);
  const shownHebrew = [...document.querySelectorAll('[data-i18n]')]
    .filter(e => /[֐-׿]/.test(e.textContent) && e.offsetParent)
    .map(e => e.dataset.i18n);
  return { lang: document.documentElement.lang, total: keys.length, stillHebrew: [...new Set(shownHebrew)] };
});
console.log(JSON.stringify(res, null, 1));
await p.evaluate(() => document.querySelector('#prayers').scrollIntoView({ block: 'start' }));
await new Promise(r => setTimeout(r, 2200));
await (await p.$('#prayers')).screenshot({ path: './temporary screenshots/fr-prayers.png' });
await b.close();
