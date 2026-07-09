import puppeteer from 'puppeteer';
const b = await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const p = await b.newPage();
await p.setViewport({width:375,height:812,isMobile:true,hasTouch:true});
await p.goto('http://localhost:3000',{waitUntil:'networkidle2',timeout:25000});
await p.evaluateHandle('document.fonts.ready');
await p.evaluate(() => {
  document.querySelectorAll('.reveal,.stagger-children').forEach(e=>e.classList.add('visible'));
  document.querySelectorAll('.stat-num[data-target]').forEach(e=>{e.textContent=e.dataset.target;});
  const t = document.getElementById('galleryTrack');
  if (t) t.style.animationPlayState = 'paused';
});
await new Promise(r=>setTimeout(r,1200));
const DIR = 'temporary screenshots';
await p.screenshot({path:DIR+'/mob-full.png', fullPage:true});
// Section shots
const sections = ['stats','parasha','lessons','events','yizkor','gallery-strip','about','location','donate-cta'];
for (const id of sections) {
  const el = await p.$('#'+id);
  if (!el) { console.log('missing:',id); continue; }
  const box = await el.boundingBox();
  await p.screenshot({path:DIR+'/mob-'+id+'.png', clip:{x:box.x,y:box.y,width:box.width,height:box.height}});
  console.log('saved mob-'+id);
}
await b.close();
console.log('done');
