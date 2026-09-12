import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Exercise animation lifecycle without opening a browser or changing page state.
const source = readFileSync(new URL('../assets/js/desktop-guide.js', import.meta.url), 'utf8');
const motionCode = source.slice(source.indexOf('  const dockMotions ='), source.indexOf('  const snapPixel ='));
const reducedMotion = { matches: false };
const api = runInNewContext(`${motionCode}; ({animateDockOpen, cancelDockMotion, dockMotions})`, {
  reducedMotion, getComputedStyle: element => ({ transform: element.transform || 'none' }),
});
function element(rect) {
  const classes = new Set();
  return {
    classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) },
    getBoundingClientRect: () => rect,
    animations: [],
    animate(frames, options) {
      let resolve;
      const animation = { frames, options, cancelled: false, finished: new Promise(r => { resolve = r; }),
        cancel() { this.cancelled = true; resolve(); }, complete() { resolve(); } };
      this.animations.push(animation);
      return animation;
    },
  };
}
const panel = element({ left: 200, top: 60, width: 1000, height: 600 });
const icon = element({});
const launcher = { getBoundingClientRect: () => ({ left: 600, top: 790, width: 64, height: 64 }), querySelector: () => icon };
api.animateDockOpen(panel, launcher);
let animation = panel.animations.at(-1);
assert.match(animation.frames[0].transform, /translate\(-68px, 462px\) scale\(0.08\)/);
assert.equal(animation.frames.at(-1).transform, 'none');
assert.equal(animation.options.duration, 480);
assert.equal(icon.animations.length, 1);
animation.complete();
await new Promise(resolve => setImmediate(resolve));
assert.equal(api.dockMotions.size, 0);
assert(!panel.classList.contains('is-dock-opening'));

panel.transform = 'matrix(1, 0, 0, 1, -500, -300)';
api.animateDockOpen(panel, launcher);
animation = panel.animations.at(-1);
assert(animation.frames[0].transform.startsWith(panel.transform));
assert.equal(animation.frames.at(-1).transform, panel.transform);
api.animateDockOpen(panel, launcher);
const replacement = panel.animations.at(-1);
assert(animation.cancelled);
await new Promise(resolve => setImmediate(resolve));
assert.equal(api.dockMotions.get(panel)[0], replacement, 'Cancelled launch must not remove its replacement');
api.cancelDockMotion(panel);
assert(replacement.cancelled);
assert.equal(api.dockMotions.size, 0);

reducedMotion.matches = true;
const before = panel.animations.length;
api.animateDockOpen(panel, launcher);
assert.equal(panel.animations.length, before);
assert(!panel.classList.contains('is-dock-opening'));
console.log('PASS: Dock origin, final transform, icon bounce, cleanup, interruption, reduced motion');

let closeAbout;
let focusCount = 0;
let syncCount = 0;
const about = element({});
about.querySelector = () => ({ addEventListener: (_, handler) => { closeAbout = handler; } });
const closeContext = {
  active: true, about,
  cancelDockMotion: api.cancelDockMotion,
  syncAccessibility: () => { syncCount++; },
  finderLauncher: { focus: () => { focusCount++; } },
};
runInNewContext(source.slice(source.indexOf("  about.querySelector('[data-about-close]').addEventListener"), source.indexOf("  dock.addEventListener('keydown'")), closeContext);
closeAbout();
assert(!about.classList.contains('is-closed'), 'Guide must block About close');
closeContext.active = false;
closeAbout();
assert(about.classList.contains('is-closed'));
assert.equal(focusCount, 1);
assert.equal(syncCount, 1);
assert.match(source, /const windowControlSelector = '[^']*\[data-about-close\]/);
console.log('PASS: About close, guide lock, Dock focus and accessibility sync');
