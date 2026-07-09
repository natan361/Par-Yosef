import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 25000 });
await page.evaluateHandle('document.fonts.ready');
await page.evaluate(() => {
  document.querySelectorAll('.reveal,.stagger-children').forEach(el => el.classList.add('visible'));
  document.querySelectorAll('.stat-num[data-target]').forEach(el => { el.textContent = el.dataset.target; });
  // pause gallery animation for screenshot
  const t = document.getElementById('galleryTrack');
  if (t) t.style.animationPlayState = 'paused';
});
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: 'temporary screenshots/fullpage.png', fullPage: true });
await browser.close();
console.log('done');
