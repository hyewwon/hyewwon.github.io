import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../assets/js/desktop-apps.js', import.meta.url), 'utf8');
const animations = [];
let focusCount = 0;
const panel = {
  hidden: false, inert: false,
  animate(frames, options) {
    let finish;
    const animation = { frames, options, cancelled: false,
      finished: new Promise(resolve => { finish = resolve; }),
      cancel() { this.cancelled = true; finish(); }, finish() { finish(); } };
    animations.push(animation);
    return animation;
  },
};
const style = { opacity: '0.45', transform: 'matrix(0.97, 0, 0, 0.97, -300, -220)' };
const reduced = { matches: false };
const api = runInNewContext(`let motion = null, opened = true;
  ${source.slice(source.indexOf('  function animate(show)'), source.indexOf('  function show()'))}
  ({close, animate, reopen() { opened = true; panel.hidden = false; animate(true); }})`, {
  panel, reduced, getComputedStyle: () => style, setOptions() {}, dock: { hidden: false },
  launcher: { setAttribute() {}, focus() { focusCount++; } },
});
const flush = () => new Promise(resolve => setImmediate(resolve));

api.close(false);
api.close();
assert.equal(animations.length, 1, 'Outside pointer and menu click must close only once');
assert.equal(focusCount, 0, 'Duplicate close must not steal menu focus');
assert.equal(animations[0].frames[0].opacity, style.opacity);
assert.equal(animations[0].frames[0].transform, style.transform);
assert.equal(panel.inert, true);
assert.equal(panel.hidden, false, 'Keep panel visible until exit finishes');
api.reopen();
await flush();
assert.equal(panel.hidden, false, 'Cancelled exit must not hide reopened panel');
assert.equal(animations[1].frames[0].opacity, style.opacity);
api.close(false, true);
await flush();
assert.equal(panel.hidden, true);
assert.equal(animations[1].cancelled, true);

reduced.matches = true;
api.reopen();
api.close(false);
assert.equal(animations.at(-1).options.duration, 1);
animations.at(-1).finish();
await flush();
assert.equal(panel.hidden, true);
for (const file of ['desktop-menu.js', 'desktop-notifications.js']) {
  const text = readFileSync(new URL(`../assets/js/${file}`, import.meta.url), 'utf8');
  assert.ok(!text.includes("querySelector('[data-apps-close]')?.click()"));
}
console.log('PASS: Apps duplicate close, interrupted motion, focus, immediate close and reduced motion');
