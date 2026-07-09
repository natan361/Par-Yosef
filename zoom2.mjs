import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 20000 });
await page.evaluateHandle('document.fonts.ready');
await page.evaluate(() => {
  document.querySelectorAll('.reveal,.stagger-children').forEach(el => el.classList.add('visible'));
  document.querySelectorAll('.stat-num[data-target]').forEach(el => { el.textContent = el.dataset.target; });
});
await new Promise(r => setTimeout(r, 1000));
const DIR = 'temporary screenshots';
const sections = [['stats','zoom-stats2'],['lessons','zoom-lessons2'],['gallery-strip','zoom-gallery2'],['about','zoom-about2']];
for (const [id, name] of sections) {
  const el = await page.$('#' + id);
  if (!el) { console.log('missing:', id); continue; }
  const box = await el.boundingBox();
  await page.screenshot({ path: DIR + '/' + name + '.png', clip: { x: box.x, y: box.y, width: box.width, height: box.height } });
  console.log('saved:', name);
}
await browser.close();
console.log('done');
