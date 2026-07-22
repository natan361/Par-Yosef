import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
for (const vp of [{n:'mobile',width:375,height:812},{n:'desktop',width:1440,height:900}]) {
  for (const f of ['index.html','videos.html','zmanim.html','gallery.html','donate.html']) {
    const p = await b.newPage();
    const errs = [];
    p.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,100)); });
    p.on('pageerror', e => errs.push('PAGEERROR ' + e.message.slice(0,100)));
    await p.setViewport({ width: vp.width, height: vp.height });
    await p.evaluateOnNewDocument(() => sessionStorage.setItem('popup_dismissed','1'));
    await p.goto(`http://localhost:3000/${f}`, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 700));
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    console.log(`${vp.n.padEnd(8)} ${f.padEnd(13)} scrollW=${sw}${sw>vp.width+1?' ⚠':' ok'}${errs.length?'  ERR: '+errs.slice(0,2).join(' | '):''}`);
    await p.close();
  }
}
// French pass on the home page
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });
await p.evaluateOnNewDocument(() => sessionStorage.setItem('popup_dismissed','1'));
await p.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle2' });
await p.evaluate(() => setLang('fr'));
await new Promise(r => setTimeout(r, 500));
const untranslated = await p.evaluate(() => [...document.querySelectorAll('[data-i18n]')]
  .filter(el => !window.TRANSLATIONS?.fr?.[el.dataset.i18n])
  .map(el => el.dataset.i18n));
console.log('\nFR keys with no translation: ' + (untranslated.length ? untranslated.join(', ') : 'none'));
await p.screenshot({ path: './temporary screenshots/fr-check.png' });
await b.close();
