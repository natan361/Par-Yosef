import puppeteer from 'puppeteer';

async function shoot(p, sel, path) {
  const el = await p.$(sel);
  if (!el) { console.log('missing:', sel); return; }
  const box = await el.boundingBox();
  await p.screenshot({path, clip:{x:box.x,y:box.y,width:box.width,height:Math.min(box.height,600)}});
  console.log('saved', path);
}

// Desktop
{
  const b = await puppeteer.launch({headless:'new',args:['--no-sandbox']});
  const p = await b.newPage();
  await p.setViewport({width:1440,height:900});
  await p.goto('http://localhost:3000',{waitUntil:'networkidle2',timeout:25000});
  await p.evaluateHandle('document.fonts.ready');
  await p.evaluate(() => {
    document.querySelectorAll('.reveal,.stagger-children').forEach(e=>e.classList.add('visible'));
    document.querySelectorAll('.stat-num[data-target]').forEach(e=>{e.textContent=e.dataset.target;});
  });
  await new Promise(r=>setTimeout(r,800));
  await shoot(p,'#stats','temporary screenshots/desk-stats.png');
  await shoot(p,'#lessons','temporary screenshots/desk-lessons.png');
  await shoot(p,'.footer-cols','temporary screenshots/desk-footer.png');
  await b.close();
}

// Mobile
{
  const b = await puppeteer.launch({headless:'new',args:['--no-sandbox']});
  const p = await b.newPage();
  await p.setViewport({width:375,height:812,isMobile:true,hasTouch:true});
  await p.goto('http://localhost:3000',{waitUntil:'networkidle2',timeout:25000});
  await p.evaluateHandle('document.fonts.ready');
  await p.evaluate(() => {
    document.querySelectorAll('.reveal,.stagger-children').forEach(e=>e.classList.add('visible'));
    document.querySelectorAll('.stat-num[data-target]').forEach(e=>{e.textContent=e.dataset.target;});
  });
  await new Promise(r=>setTimeout(r,800));
  await shoot(p,'.footer-cols','temporary screenshots/mob-footer.png');
  await b.close();
}

console.log('done');
