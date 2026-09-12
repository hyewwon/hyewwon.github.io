import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../assets/js/desktop-guide.js', import.meta.url), 'utf8');
const windows = ['about', 'skills', 'experience', 'projects'].map(name => {
  const classes = new Set(['is-closed']);
  return { name, style: {}, classList: {
    contains: name => classes.has(name), add: name => classes.add(name), remove: name => classes.delete(name),
  } };
});
const launches = [];
const context = { windows, unlocked: true, active: false, visited: new Set(), dockApps: windows,
  document: { dispatchEvent: () => {} }, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
  finish: () => { throw new Error('Focusing an app must not restart guide cleanup'); },
  cancelDockMotion: () => {}, layout: () => {}, syncAccessibility: () => {},
  animateDockOpen: panel => launches.push(panel.name),
};
const stackCode = source.slice(source.indexOf('  const windowStack ='), source.indexOf('  const motions ='));
const openCode = source.slice(source.indexOf('  function open(panel,'), source.indexOf('  function resetWindows()'));
const api = runInNewContext(`${stackCode}\n${openCode}\n({open, focusWindow})`, context);
const order = () => windows.filter(p => !p.classList.contains('is-closed'))
  .sort((a, b) => Number(b.style.zIndex) - Number(a.style.zIndex)).map(p => p.name);
windows.forEach(panel => api.open(panel));
assert.deepEqual(order(), ['projects', 'experience', 'skills', 'about']);
for (let i = 0; i < 10; i++) {
  api.open(windows[0]);
  api.open(windows[1]);
  assert.deepEqual(order(), ['skills', 'about', 'projects', 'experience']);
  api.open(windows[0]);
  assert.deepEqual(order(), ['about', 'skills', 'projects', 'experience']);
}
assert.equal(launches.length, 4, 'Already-open apps must not replay launch animation');
windows[0].classList.add('is-closed');
assert.equal(order()[0], 'skills', 'Closing front app reveals last active app');
api.open(windows[0]);
assert.equal(launches.length, 5);
api.focusWindow(windows[2]);
assert.deepEqual(order(), ['experience', 'about', 'skills', 'projects']);
assert.match(source, /if \(!active\) focusWindow\(panel\)/);
console.log('PASS: open, repeated Dock switching, background order, close/reopen, window pointer focus');
