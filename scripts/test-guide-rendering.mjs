import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = createRequire(import.meta.url)(process.argv[2] || 'playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Same-origin HTTP allows pixel inspection without relaxing canvas security.
const server = createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!path.startsWith(root + '/')) { res.writeHead(403).end(); return; }
    const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.svg':'image/svg+xml', '.webp':'image/webp' };
    res.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream');
    res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ channel:'chrome', headless:true });
try {
  await Promise.all([[1440,900],[390,844]].map(async ([width,height]) => {
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}), errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/splash.html`);
    await page.locator('.desktop-guide.is-guide-visible').waitFor();
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>{
      window.renderCheck={samples:0,blank:[],poses:{},watch:true};
      function sample(){
        const result=window.renderCheck,a=document.querySelector('[data-guide-actor]'),g=document.querySelector('[data-desktop-guide]');
        if(!a.hidden&&Number(g.dataset.step)>0){
          const canvas=a.querySelector('canvas'),pixels=canvas.getContext('2d').getImageData(0,0,384,384).data;
          let opaque=0;for(let i=3;i<pixels.length;i+=32)if(pixels[i]>128)opaque++;
          result.samples++;if(opaque<100)result.blank.push({step:g.dataset.step,frame:a.dataset.frame,opaque});
          result.poses[`${a.dataset.motion}:${a.dataset.frame}`]=true;
        }
        if(result.watch)requestAnimationFrame(sample);
      }requestAnimationFrame(sample);
    });
    for(const step of [1,2,3,2,1]){
      const current=Number(await page.locator('[data-desktop-guide]').getAttribute('data-step'));
      await page.locator(step>current?'[data-guide-next]':'[data-guide-previous]').click();
      await page.waitForFunction(n=>{const g=document.querySelector('[data-desktop-guide]'),a=document.querySelector('[data-guide-actor]');return g.dataset.step===String(n)&&!g.inert&&a.dataset.phase==='rest';},step);
      await page.waitForFunction(()=>document.querySelector('[data-guide-actor]').dataset.phase==='blink');
      await page.waitForFunction(()=>document.querySelector('[data-guide-actor]').dataset.phase==='rest');
    }
    const result=await page.evaluate(()=>{window.renderCheck.watch=false;return window.renderCheck;});
    assert(result.samples>100);assert.deepEqual(result.blank,[]);assert.deepEqual(errors,[]);
    for(const key of ['skills:17','experience:15','projects:15'])assert(result.poses[key],`Missing blink ${key}`);
    console.log('PASS',width,'nonblank rendered frames',result.samples,'distinct poses',Object.keys(result.poses).length);
    await page.close();
  }));
} finally {await browser.close();await new Promise(done=>server.close(done));}
