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
await new Promise(r => setTimeout(r, 600));
const DIR = 'temporary screenshots';

// Header at top (transparent — dark nav text on light hero)
await page.screenshot({ path: DIR + '/chk-header-top.png', clip: { x: 0, y: 0, width: 1440, height: 72 } });

// Force scrolled state
await page.evaluate(() => document.getElementById('site-header').classList.add('scrolled'));
await new Promise(r => setTimeout(r, 200));
await page.screenshot({ path: DIR + '/chk-header-scrolled.png', clip: { x: 0, y: 0, width: 1440, height: 72 } });

// Stats
const stats = await page.$('#stats');
const sb = await stats.boundingBox();
await page.screenshot({ path: DIR + '/chk-stats.png', clip: { x: sb.x, y: sb.y, width: sb.width, height: sb.height } });

await browser.close();
console.log('done');
