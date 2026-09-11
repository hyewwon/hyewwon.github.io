import { createRequire } from 'node:module';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const { chromium } = createRequire(import.meta.url)(process.argv[2] || 'playwright');
const screenshots = await mkdtemp(join(tmpdir(), 'guide-polish-'));
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const url=new URL('../index.html',import.meta.url).href;
const ready=(p,n)=>p.waitForFunction(n=>{const g=document.querySelector('[data-desktop-guide]');return g.dataset.step===String(n)&&g.classList.contains('is-guide-visible')&&!g.inert;},n);
const selectors=['.about-window','[data-skills-window]','[data-experience-window]','[data-projects-window]'];
const controls='[data-skills-close], [data-preview-action="close"], [data-preview-action="expand"], [data-store-action="close"], [data-store-action="expand"]';
try { await Promise.all([[1440,900],[1024,768],[390,667],[844,390]].map(async([width,height])=>{
 const p=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 p.on('requestfailed',r=>{if(r.url().startsWith('file:'))errors.push(`Missing local resource: ${r.url()}`);});
 await p.goto(url); await ready(p,0);
 await p.emulateMedia({reducedMotion:'no-preference'});
 await p.evaluate(({selectors})=>{
   window.trace=[];window.track=true;
   function tick(){const panels=selectors.map(sel=>{const e=document.querySelector(sel),c=getComputedStyle(e);return {opacity:+c.opacity,visible:c.visibility==='visible'&&c.display!=='none',closed:e.classList.contains('is-closed')};});window.trace.push(panels);if(window.track)requestAnimationFrame(tick);}requestAnimationFrame(tick);
 },{selectors});
 for(const n of [1,2,3,2,1,0]) {
   const prev=Number(await p.locator('[data-desktop-guide]').getAttribute('data-step'));
   await p.locator(n>prev?'[data-guide-next]':'[data-guide-previous]').click(); await ready(p,n);
   await p.waitForFunction(()=>document.querySelector('[data-guide-actor]').dataset.phase==='rest');
   await p.waitForTimeout(320);
   const pointerError = await p.evaluate(() => {
     const g = document.querySelector('[data-desktop-guide]');
     const b = g.querySelector('.desktop-guide__bubble');
     const a = (g.dataset.step === '0' ? g.querySelector('.desktop-guide__frog') : document.querySelector('[data-guide-actor]')).getBoundingClientRect();
     const r = b.getBoundingClientRect(), side = b.dataset.tail;
     const offset = parseFloat(b.style.getPropertyValue('--tail-offset'));
     const vertical = side === 'top' || side === 'bottom';
     const x = vertical ? r.x + offset : side === 'left' ? r.x : r.right;
     const y = vertical ? side === 'top' ? r.y : r.bottom : r.y + offset;
     const expected = Math.atan2(a.y + a.height / 2 - y, a.x + a.width / 2 - x) * 180 / Math.PI + 90;
     const actual = parseFloat(b.style.getPropertyValue('--tail-angle'));
     return Math.abs(((actual - expected + 540) % 360) - 180);
   });
   assert(pointerError < 2, `Tail does not point at frog: ${pointerError} degrees`);
   const state=await p.evaluate(({selectors,controls})=>{
     const visible=selectors.map((sel,i)=>{const c=getComputedStyle(document.querySelector(sel));return c.visibility==='visible'&&+c.opacity>.01?i:-1;}).filter(i=>i>=0);
     const b=document.querySelector('.desktop-guide__bubble'),r=b.getBoundingClientRect(),c=getComputedStyle(b);
     return {visible,disabled:[...document.querySelectorAll(controls)].every(e=>e.disabled),tail:b.dataset.tail,tailDisplay:getComputedStyle(b,'::before').display,corners:[c.borderTopLeftRadius,c.borderTopRightRadius,c.borderBottomLeftRadius,c.borderBottomRightRadius],bubble:{x:r.x,y:r.y,right:r.right,bottom:r.bottom},canvas:document.querySelector('[data-guide-actor]').classList.contains('has-canvas-frame')};
   },{selectors,controls});
   assert.deepEqual(state.visible,[n]);assert(state.disabled);assert.equal(new Set(state.corners).size,1);assert(state.tail);assert.equal(state.tailDisplay,'block');assert(state.canvas);
   assert(state.bubble.x>=-1&&state.bubble.right<=width+1&&state.bubble.y>=30&&state.bubble.bottom<=height+1,JSON.stringify(state));
   if(width===1440) {
     await p.waitForTimeout(300);
     await p.screenshot({path:join(screenshots, `step-${n}.png`)});
     await p.waitForFunction(()=>document.querySelector('[data-guide-actor]').dataset.phase==='blink',{},{timeout:3500});
     await p.waitForFunction(()=>document.querySelector('[data-guide-actor]').dataset.phase==='rest');
   }
   // Programmatic click must also not close or maximize during the tour.
   await p.evaluate(controls=>document.querySelectorAll(controls).forEach(b=>b.dispatchEvent(new MouseEvent('click',{bubbles:true}))),controls);
   assert(await p.locator('[data-splash]').evaluate(e=>e.classList.contains('is-guide-active')));
 }
 const trace=await p.evaluate(()=>{window.track=false;return window.trace;});
 for(const sample of trace)assert(sample.filter(s=>s.visible&&s.opacity>.005).length<=1,'Overlapping windows');
 // Visible runs cannot disappear and reappear within a transition; each
 // individual opacity run rises (entry) and then falls (exit), never rebounds.
 for(let i=0;i<4;i++) {let falling=false,last=0;for(const row of trace){const value=row[i].visible?row[i].opacity:0;if(value===0){falling=false;last=0;continue;}if(value<last-.02)falling=true;if(falling)assert(value<=last+.02,`Opacity flash panel ${i}`);last=value;}}
 await p.locator('[data-guide-skip]').click();
 assert(await p.locator(controls).evaluateAll(bs=>bs.every(b=>!b.disabled)));
 await p.locator('[data-projects-open]').click();
 await p.locator('[data-store-action="expand"]').click();assert(await p.locator('[data-projects-window]').evaluate(e=>e.classList.contains('is-expanded')));
 await p.locator('[data-store-action="close"]').first().click();assert(await p.locator('[data-projects-window]').evaluate(e=>e.classList.contains('is-closed')));
 assert.deepEqual(errors,[]);console.log('PASS',width,height,'single window, monotonic transitions, blink, tails, locked/free controls');await p.close();
})); } finally {await browser.close();}
