import puppeteer from 'puppeteer';
const b = await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const p = await b.newPage();
await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:3000',{waitUntil:'networkidle2',timeout:20000});
await p.evaluateHandle('document.fonts.ready');
await p.evaluate(() => {
  document.querySelectorAll('.reveal,.stagger-children').forEach(e=>e.classList.add('visible'));
});
await new Promise(r => setTimeout(r, 1200));
const count = await p.evaluate(() => document.getElementById('galleryTrack').children.length);
console.log('galleryTrack children:', count, '(should be 22 = 11 × 2)');
const anim = await p.evaluate(() => getComputedStyle(document.getElementById('galleryTrack')).animationName);
console.log('animation:', anim);
const sec = await p.$('#gallery-strip');
const box = await sec.boundingBox();
await p.screenshot({path:'temporary screenshots/gallery-full.png', clip:{x:box.x,y:box.y,width:box.width,height:box.height}});
await b.close();
console.log('done');
