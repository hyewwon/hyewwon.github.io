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

const markup = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
for (const className of ['about-window__control--expand', 'skills-window__control--expand']) {
  const control = markup.match(new RegExp(`<button[^>]*class="[^"]*${className}[^>]*>`))?.[0];
  assert.ok(control, `${className}: missing disabled button`);
  assert.match(control, /\sdisabled[\s>]/);
  assert.ok(!/data-(?:preview|store)-action/.test(control));
}
for (const action of ['preview', 'store']) {
  const control = markup.match(new RegExp(`<button[^>]*data-${action}-action="expand"[^>]*>`))?.[0];
  assert.ok(control);
  assert.ok(!/\sdisabled[\s>]/.test(control));
}
console.log('PASS: About/Skills expansion disabled, Experience/Projects expansion retained');

const resizePanel = element({});
resizePanel.classList.toggle = name => {
  const enabled = !resizePanel.classList.contains(name);
  resizePanel.classList[enabled ? 'add' : 'remove'](name);
  return enabled;
};
const normalBounds = { left: '80px', top: '48px', width: '1100px', height: '720px' };
const expandedBounds = { left: '8px', top: '40px', width: '1240px', height: '820px' };
let visualBounds = null;
let pressed;
const resizeReducedMotion = { matches: false };
const resizeApi = runInNewContext(`${source.slice(source.indexOf('  const windowSizeMotions ='), source.indexOf('  function resetWindows()'))}\n({toggleWindowSize, cancelWindowSizeMotion, windowSizeMotions})`, {
  cancelDockMotion() {}, layout() {}, reducedMotion: resizeReducedMotion,
  getComputedStyle: panel => visualBounds || (panel.classList.contains('is-expanded') ? expandedBounds : normalBounds),
});
const resizeControl = { setAttribute: (_, value) => { pressed = value; } };
resizeApi.toggleWindowSize(resizePanel, resizeControl);
let resizeAnimation = resizePanel.animations.at(-1);
assert.deepEqual(JSON.parse(JSON.stringify(resizeAnimation.frames)), [normalBounds, expandedBounds]);
assert.equal(pressed, 'true');
resizeAnimation.complete();
await new Promise(resolve => setImmediate(resolve));
assert.equal(resizeApi.windowSizeMotions.size, 0);
resizeApi.toggleWindowSize(resizePanel, resizeControl);
resizeAnimation = resizePanel.animations.at(-1);
assert.deepEqual(JSON.parse(JSON.stringify(resizeAnimation.frames)), [expandedBounds, normalBounds]);
assert.equal(pressed, 'false');
const midBounds = { left: '40px', top: '44px', width: '1170px', height: '770px' };
visualBounds = midBounds;
const priorCancel = resizeAnimation.cancel.bind(resizeAnimation);
resizeAnimation.cancel = () => { visualBounds = null; priorCancel(); };
resizeApi.toggleWindowSize(resizePanel, resizeControl);
assert(resizeAnimation.cancelled);
assert.deepEqual(JSON.parse(JSON.stringify(resizePanel.animations.at(-1).frames)), [midBounds, expandedBounds]);
resizeApi.cancelWindowSizeMotion(resizePanel);
resizeReducedMotion.matches = true;
const resizeCount = resizePanel.animations.length;
resizeApi.toggleWindowSize(resizePanel, resizeControl);
assert.equal(resizePanel.animations.length, resizeCount);
assert.equal(pressed, 'false');
console.log('PASS: expand/restore bounds, interrupted reversal, animation cleanup, reduced motion');
