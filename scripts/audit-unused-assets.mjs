// Conservative runtime audit. Historical design notes and one-off generation
// recipes are not site entry points; archived inputs can be restored to rerun them.
import { readdir, readFile, lstat, mkdtemp, writeFile, unlink } from 'node:fs/promises';
import { resolve, relative, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const image = /\.(png|jpe?g|webp|gif|svg|avif|ico)$/i;
async function walk(dir) {
  const result = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules' || e.isSymbolicLink()) continue;
    const path = join(dir, e.name);
    if (e.isDirectory()) result.push(...await walk(path));
    else if (e.isFile()) result.push(relative(root, path));
  }
  return result;
}
const files = await walk(root), existing = new Set(files);
const sources = files.filter(p => /^(index|splash)\.html$/.test(p) || /^assets\/(js|css|scss|documents)\//.test(p) && /\.(html|js|css|scss)$/.test(p));
const kept = new Map(), refs = [];
const keep = (p, why) => { if (existing.has(p)) kept.set(p, [...(kept.get(p) || []), why]); };
for (const source of sources) {
  const text = await readFile(join(root, source), 'utf8');
  const strings = [...text.matchAll(/["'`]([^"'`\n]+)["'`]/g), ...text.matchAll(/url\(([^)]+)\)/g)];
  for (const match of strings) {
    const value = match[1].replace(/^["']|["']$/g, '').split(/[?#]/)[0];
    if (/^(https?:|data:|#)/.test(value) || !/\.(png|jpe?g|webp|gif|svg|avif|ico|html)$/i.test(value) || value.includes('${')) continue;
    const candidates = [relative(root, resolve(root, dirname(source), value)), value.replace(/^\//, '')];
    const target = candidates.find(p => existing.has(p));
    if (target) { keep(target, source); refs.push({ source, target }); }
  }
}
// JS constructs these numbered filenames at runtime; do not rely on literal grep.
for (const [motion, count] of [['about',17],['skills',17],['experience',16],['projects',16]]) {
  for (let n=1;n<=count;n++) {
    const p = `assets/image/character/pages/desktop/guide-polish-v1/${motion}/frame-${String(n).padStart(2,'0')}.png`;
    if (!existing.has(p)) throw Error(`Missing current frame: ${p}`);
    keep(p, 'dynamic desktop guide frame');
  }
}
for (const p of files) {
  if (p.startsWith('assets/image/character/pages/desktop/guide-polish-v1/')) keep(p, 'current editable guide master');
  if (p.startsWith('assets/image/character/pages/splash/seamless-entry/frames-v12/')) keep(p, 'current splash frame set');
}
keep('assets/image/character/shared/base/frog-default-standing.png', 'canonical character design');
const candidates = files.filter(p => image.test(p) || /\/previews\/[^/]+\.html$/.test(p) || p === 'index.html.bak');
const removed = [];
for (const path of candidates.filter(p => !kept.has(p)).sort()) {
  const bytes = await readFile(join(root, path));
  removed.push({ path, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
const report = { root, removed, kept: [...kept].map(([path, reasons]) => ({path, reasons})), refs };
const summary = { removeFiles: removed.length, images: removed.filter(p=>image.test(p.path)).length, pages: removed.filter(p=>!image.test(p.path)).length, bytes: removed.reduce((sum,p)=>sum+p.bytes,0), groups: {} };
for (const {path} of removed) { const group = path.split('/').slice(0,6).join('/'); summary.groups[group] = (summary.groups[group] || 0) + 1; }
console.log(JSON.stringify(summary, null, 2));
if (!process.argv.includes('--apply')) {
  console.log('Deletion candidates:', removed.map(p=>p.path).join('\n'));
} else if (removed.length) {
  // A unique, out-of-repository backup also covers untracked generated art.
  const backup = await mkdtemp(join(dirname(root), 'asset-cleanup-backup-'));
  await writeFile(join(backup, 'manifest.json'), JSON.stringify(report,null,2));
  const archive = join(backup, 'unused-assets.tar.gz');
  const packed = spawnSync('/usr/bin/tar', ['-czf',archive,'--null','-T','-'], {cwd:root,input:removed.map(p=>p.path).join('\0')+'\0',encoding:'utf8'});
  if (packed.status !== 0) throw Error(packed.stderr);
  const listing = spawnSync('/usr/bin/tar', ['-tzf',archive], {encoding:'utf8'});
  const archived = new Set(listing.stdout.trim().split('\n'));
  if (listing.status !== 0 || removed.some(p=>!archived.has(p.path))) throw Error('Backup verification failed');
  // Refuse changed targets or symlinks; unlink only the individually audited files.
  for (const file of removed) {
    const path = resolve(root,file.path);
    if (!path.startsWith(root+'/') || !(await lstat(path)).isFile()) throw Error(`Unsafe target: ${path}`);
    const hash=createHash('sha256').update(await readFile(path)).digest('hex');
    if(hash!==file.sha256) throw Error(`Changed during audit: ${path}`);
  }
  for (const file of removed) await unlink(join(root,file.path));
  console.log(`BACKUP ${backup}`);
  console.log(`REMOVED ${removed.length} files`);
}
