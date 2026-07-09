import puppeteer from 'puppeteer';
const b = await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const p = await b.newPage();
await p.setViewport({width:375,height:812,isMobile:true,hasTouch:true});
await p.goto('http://localhost:3000/videos.html',{waitUntil:'networkidle0',timeout:30000});
await p.evaluateHandle('document.fonts.ready');
await p.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(e=>e.classList.add('visible'));
});
await new Promise(r=>setTimeout(r,4000));
await p.screenshot({path:'temporary screenshots/videos-mobile-full.png', fullPage:true});
console.log('done');
await b.close();
