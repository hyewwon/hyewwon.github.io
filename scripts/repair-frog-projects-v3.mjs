import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const out = 'assets/image/character/pages/desktop/projects-guide', N = 384;
const sources = [process.argv[3], process.argv[4]]; // airborne, crouch
assert(sources.every(Boolean), 'Provide both generated local-arm repairs');
for (const d of ['source', 'frames-v3', 'sprites']) await mkdir(`${out}/${d}`, { recursive: true });
const old = await Promise.all(Array.from({ length: 16 }, (_, i) => sharp(`${out}/frames-v2/frame-projects-v2-${String(i + 1).padStart(2, '0')}.png`).ensureAlpha().raw().toBuffer()));
const clamp = v => Math.max(0, Math.min(1, v));

function skin(raw) {
  const values = [[], [], []];
  for (let p = 0; p < raw.length; p += 4) if (raw[p + 3] > 250 && raw[p + 1] > 140 && raw[p] > 100 && raw[p] < 200 && raw[p + 2] < 80)
    for (let c = 0; c < 3; c++) values[c].push(raw[p + c]);
  return values.map(a => a.sort((a, b) => a - b)[Math.floor(a.length / 2)]);
}
async function patch(source, target, name) {
  await copyFile(source, `${out}/source/${name}.png`);
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // Generator returned a neutral checkerboard. Extract chromatic frog pixels,
  // preserving any real alpha instead of baking the checkerboard into the sprite.
  for (let p = 0; p < data.length; p += 4) {
    const max = Math.max(data[p], data[p + 1], data[p + 2]), min = Math.min(data[p], data[p + 1], data[p + 2]);
    if (data[p + 3] === 255) data[p + 3] = max < 90 ? 255 : Math.round(clamp((max - min - 12) / 22) * 255);
    if (!data[p + 3]) data.fill(0, p, p + 4);
  }
  // Keep the full canvas: recentering the generated cutout would move the joints.
  const raw = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).resize(N, N).raw().toBuffer();
  const a = skin(raw), b = skin(target);
  for (let p = 0; p < raw.length; p += 4) if (raw[p + 3]) {
    const weight = clamp((raw[p + 1] - 90) / 60);
    for (let c = 0; c < 3; c++) raw[p + c] = Math.round(Math.max(0, Math.min(255, raw[p + c] + (b[c] - a[c]) * weight)));
  }
  return raw;
}
const air = await patch(sources[0], old[4], 'frog-projects-air-arm-repair-v3');
const crouch = await patch(sources[1], old[2], 'frog-projects-crouch-arm-repair-v3');
const frames = old.map(f => Buffer.from(f));
function insert(dst, src, region) {
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const p = (y * N + x) * 4, t = region(x, y);
    if (!t || !src[p + 3]) continue;
    // Blend RGB only in opaque joint interiors. Exterior pixels use source-over,
    // never a whole-layer fade that would create translucent limbs.
    const sa = src[p + 3] / 255 * t, da = dst[p + 3] / 255, a = sa + da * (1 - sa);
    for (let c = 0; c < 3; c++) dst[p + c] = Math.round((src[p + c] * sa + dst[p + c] * da * (1 - sa)) / a);
    dst[p + 3] = Math.round(a * 255);
  }
}
insert(frames[4], air, (x, y) => {
  if (x < 45 || y < 98 || y > 190) return 0;
  const edge = y < 142 ? 93 : 93 + (y - 142) * 1.05;
  return clamp((edge - x) / 4) * clamp((190 - y) / 5);
});
insert(frames[2], crouch, (x, y) => x < 244 || x > 293 || y < 224 || y > 272 ? 0 : clamp((x - 244) / 7) * clamp((y - 224) / 5) * clamp((272 - y) / 5));

async function cleanAlpha(original) {
  const dst = Buffer.from(original);
  const blurred = await sharp(original, { raw: { width: N, height: N, channels: 4 } }).extractChannel(3).blur(.55).raw().toBuffer();
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const p = (y * N + x) * 4, v = blurred[y * N + x];
    // Solid interiors remain byte-identical; only fringe/partial-alpha pixels
    // are repaired. Preserve a one-pixel antialias band at the outer contour.
    if (original[p + 3] === 255 && v >= 254) continue;
    dst[p + 3] = Math.round(clamp((v - 28) / 200) * 255);
    if (!dst[p + 3]) { dst.fill(0, p, p + 4); continue; }
    if (dst[p + 3] === 255 && original[p + 3] > 180) continue;
    let best = Infinity, chosen = -1;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue;
      const q = (yy * N + xx) * 4, d = dx * dx + dy * dy;
      if (d < best && original[q + 3] === 255 && original[q] < 125 && original[q + 1] < 150 && original[q + 2] < 80) { best = d; chosen = q; }
    }
    if (chosen >= 0) original.copy(dst, p, chosen, chosen + 3);
  }
  const edgeMask = Buffer.from(dst);
  for (let y = 3; y < N - 3; y++) for (let x = 3; x < N - 3; x++) {
    const p = (y * N + x) * 4;
    if (!dst[p + 3] || dst[p + 3] === 255) continue;
    let interior = true;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (!edgeMask[((y + dy) * N + x + dx) * 4 + 3]) interior = false;
    if (interior) dst[p + 3] = 255;
  }
  return dst;
}
const atlas = Buffer.alloc(N * N * 16 * 4), report = [];
for (let i = 0; i < 16; i++) {
  // Exact Experience handoff and original standing pose are already clean.
  if (i !== 0 && i !== 7) frames[i] = await cleanAlpha(frames[i]);
  const f = frames[i]; let innerPartial = 0, changed = 0;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const p = (y * N + x) * 4;
    if (!f.subarray(p, p + 4).equals(old[i].subarray(p, p + 4))) changed++;
    if (f[p + 3] > 32) assert(x > 8 && x < 375 && y > 8 && y < 375, `Clipped frame ${i + 1}`);
    if (f[p + 3] > 0 && f[p + 3] < 250) {
      let interior = true;
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (!f[((y + dy) * N + x + dx) * 4 + 3]) interior = false;
      if (interior) innerPartial++;
    }
  }
  assert.equal(innerPartial, 0, `Interior transparency frame ${i + 1}`);
  await sharp(f, { raw: { width: N, height: N, channels: 4 } }).png().toFile(`${out}/frames-v3/frame-projects-v3-${String(i + 1).padStart(2, '0')}.png`);
  for (let y = 0; y < N; y++) f.copy(atlas, ((Math.floor(i / 4) * N + y) * N * 4 + i % 4 * N) * 4, y * N * 4, (y + 1) * N * 4);
  report.push({ frame: i + 1, changedPixels: changed, interiorPartialAlpha: innerPartial });
}
assert(frames[0].equals(old[0]) && frames[7].equals(old[7]), 'Handoff changed');
assert(frames[13].equals(frames[15]), 'Idle loop changed');
await sharp(atlas, { raw: { width: N * 4, height: N * 4, channels: 4 } }).png().toFile(`${out}/sprites/frog-projects-center-look-sheet-v3.png`);
await writeFile(`${out}/quality-v3.json`, JSON.stringify({ frameSize: N, count: 16, preservedHandoffFrames: [1, 8], localArmRepairFrames: [3, 5], motionPathChanged: false, report }, null, 2) + '\n');
console.log('PASS: 16 frames, no inner partial alpha, safe padding, exact handoff/rest loop.', report);
