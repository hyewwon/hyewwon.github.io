// Static GitHub Pages packaging. Never copies workspace notes or private sibling folders.
import assert from 'node:assert/strict';
import { readdir, readFile, lstat, mkdir, copyFile, rm } from 'node:fs/promises';
import { resolve, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export async function walk(dir) {
  const paths = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), `Symlink is not allowed in site assets: ${entry.name}`);
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(path));
    else paths.push(path);
  }
  return paths;
}

export async function runtimeFiles(base = root) {
  const files = new Set(), queue = [];
  async function add(value, owner = 'index.html') {
    if (!value || /^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(value)) return;
    const clean = decodeURIComponent(value.split(/[?#]/)[0]);
    if (!clean || clean.includes('${')) return;
    const absolute = resolve(base, value.startsWith('/') ? '.' + clean : dirname(owner) + '/' + clean);
    const name = relative(base, absolute);
    assert(name && !name.startsWith('..'), `Reference outside site root: ${owner}: ${value}`);
    let parent = base;
    for (const part of name.split('/')) {
      assert((await readdir(parent)).includes(part), `Missing / wrong case: ${owner} → ${value}`);
      parent = resolve(parent, part);
      assert(!(await lstat(parent)).isSymbolicLink(), `Symlink: ${name}`);
    }
    assert((await lstat(absolute)).isFile(), `Not a file: ${value}`);
    if (!files.has(name)) { files.add(name); queue.push(name); }
  }
  for (const entry of ['index.html', 'splash.html', '.nojekyll', 'assets/documents/experience.html']) await add(entry);
  // Numbered assets are built dynamically by the guide, so string-only audits miss them.
  const sequences = [
    ...[['about',17], ['skills',17], ['experience',16], ['projects',16]].map(([name,count]) => [`assets/image/character/pages/desktop/guide-polish-v1/${name}/frame-`,count]),
    ['assets/image/character/pages/desktop/outro-guide/frames-v2/frame-',8],
    ['assets/image/character/pages/desktop/restart-guide/frames-v2/frame-',6],
  ];
  for (const [prefix,count] of sequences) {
    for (let n=1;n<=count;n++) await add(`${prefix}${String(n).padStart(2,'0')}.png`);
  }
  // Recently used apps resolve these file names through an interpolated icon path.
  for (const name of ['about-this-mac','photos','preview','app-store']) await add(`assets/image/desktop/dock/${name}.png`);
  while (queue.length) {
    const owner = queue.shift();
    const extension = extname(owner);
    if (!['.html','.css','.js','.svg'].includes(extension)) continue;
    const text = await readFile(resolve(base, owner), 'utf8');
    assert(!/(?:file:\/\/\/Users\/|https?:\/\/(?:localhost|127\.0\.0\.1))/.test(text), `Local-only URL in ${owner}`);
    if (extension === '.html' || extension === '.svg') {
      for (const match of text.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)) await add(match[1], owner);
    }
    if (extension === '.css') {
      for (const match of text.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/g)) await add((match[1] || match[2] || match[3]).trim(), owner);
    }
    if (extension === '.js') {
      for (const match of text.matchAll(/assets\/[\w./-]+\.(?:png|webp|jpe?g|gif|svg|ico|html|css|js)\b/g)) await add(match[0]);
    }
  }
  return [...files].sort();
}

export async function unusedFiles() {
  const used = new Set(await runtimeFiles());
  const candidates = [];
  for (const absolute of await walk(resolve(root, 'assets'))) {
    const path = relative(root, absolute);
    // Keep editable styles and provenance; old generated manifests/masters are archived separately.
    if (used.has(path) || path.startsWith('assets/scss/') || path.endsWith('/sources.json') || path.endsWith('/README.md')) continue;
    candidates.push({ path, bytes: (await lstat(absolute)).size });
  }
  return candidates;
}

async function main() {
  const mode = process.argv[2] || 'check';
  if (mode === 'audit') {
    const unused = await unusedFiles();
    console.log(JSON.stringify({ files: unused.length, bytes: unused.reduce((n,f) => n + f.bytes,0), unused }, null, 2));
    return;
  }
  const files = await runtimeFiles();
  if (mode === 'build') {
    const output = resolve(root, 'dist');
    // Only remove this tool's explicit build output, never the project/source tree.
    let exists = true;
    try { assert(!(await lstat(output)).isSymbolicLink(), 'dist must not be a symlink'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; exists = false; }
    if (exists) { await runtimeFiles(output); await rm(output, { recursive: true }); }
    for (const file of files) {
      const target = resolve(output, file);
      await mkdir(dirname(target), { recursive: true });
      await copyFile(resolve(root, file), target);
    }
    assert.deepEqual(await runtimeFiles(output), files);
    console.log(`Built and validated dist/: ${files.length} runtime files.`);
  } else assert.equal(mode, 'check', 'Use check, build, or audit');
  console.log(`PASS: ${files.length} static and dynamic resources, exact path case, root entry and legacy URL.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
