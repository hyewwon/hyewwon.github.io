import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const source = process.argv[3], N = 384, out = 'assets/image/character/pages/desktop/projects-guide';
assert(source, 'Provide generated shoulder repair');
for (const d of ['source', 'frames-v4', 'sprites']) await mkdir(`${out}/${d}`, { recursive: true });
await copyFile(source, `${out}/source/frog-projects-shoulder-repair-v4.png`);
const old = await Promise.all(Array.from({ length: 16 }, (_, i) => sharp(`${out}/frames-v3/frame-projects-v3-${String(i + 1).padStart(2, '0')}.png`).ensureAlpha().raw().toBuffer()));
const frames = old.map(f => Buffer.from(f)), clamp = v => Math.max(0, Math.min(1, v));
// Reuse ONE approved, level, front-facing head. No per-frame regeneration,
// rotation, scaling or pupil changes; the original gait remains untouched.
const offsets = [[6, -6], [10, -9], [6, -6], [10, -9]];
for (let i = 8; i < 12; i++) {
  const [dx, dy] = offsets[i - 8], dst = frames[i];
  for (let y = 0; y < 196 + dy; y++) for (let x = 0; x < N; x++) {
    const sx = x - dx, sy = y - dy, p = (y * N + x) * 4;
    const q = (sy * N + sx) * 4;
    if (sy < 0 || sx < 0 || sx >= N) { dst.fill(0, p, p + 4); continue; }
    if (sy < 184) old[0].copy(dst, p, q, q + 4);
    else if (dst[p + 3] === 255 && old[0][q + 3] === 255) {
      const t = (196 - sy) / 12;
      for (let c = 0; c < 3; c++) dst[p + c] = Math.round(old[0][q + c] * t + dst[p + c] * (1 - t));
    }
  }
}
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let p = 0; p < data.length; p += 4) {
  const max = Math.max(data[p], data[p + 1], data[p + 2]), min = Math.min(data[p], data[p + 1], data[p + 2]);
  if (data[p + 3] === 255) data[p + 3] = max < 90 ? 255 : Math.round(clamp((max - min - 12) / 22) * 255);
  if (!data[p + 3]) data.fill(0, p, p + 4);
}
const patch = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).resize(N, N).raw().toBuffer();
function medianSkin(raw) {
  const channels = [[], [], []];
  for (let y = 195; y < 258; y++) for (let x = 90; x < 155; x++) {
    const p = (y * N + x) * 4;
    if (raw[p + 3] !== 255 || raw[p + 1] < 145 || raw[p] < 100 || raw[p] > 205 || raw[p + 2] > 80) continue;
    for (let c = 0; c < 3; c++) channels[c].push(raw[p + c]);
  }
  return channels.map(a => a.sort((a, b) => a - b)[Math.floor(a.length / 2)]);
}
const from = medianSkin(patch), to = medianSkin(old[13]);
assert(from.every(Number.isFinite) && to.every(Number.isFinite));
for (let p = 0; p < patch.length; p += 4) if (patch[p + 3]) {
  const t = clamp((patch[p + 1] - 95) / 50);
  for (let c = 0; c < 3; c++) patch[p + c] = Math.round(Math.max(0, Math.min(255, patch[p + c] + (to[c] - from[c]) * t)));
}
for (let i = 12; i < 16; i++) {
  const dst = frames[i];
  for (let y = 175; y < 281; y++) for (let x = 65; x < 305; x++) {
    const left = x < 162, right = x > 226;
    if (!left && !right) continue;
    const top = left ? 175 + Math.max(0, x - 115) * .4 : 198;
    if (y < top) continue;
    const p = (y * N + x) * 4;
    const weight = clamp((y - top) / 7) * (left ? clamp((162 - x) / 8) : clamp((x - 226) / 8)) * clamp((281 - y) / 6);
    // Replace full contours, including transparent exterior, not source-over:
    // retaining the old silhouette would leave double/broken shoulder outlines.
    if (dst[p + 3] === 255 && patch[p + 3] === 255) {
      for (let c = 0; c < 3; c++) dst[p + c] = Math.round(patch[p + c] * weight + dst[p + c] * (1 - weight));
    } else if (weight >= .5) patch.copy(dst, p, p, p + 4);
  }
}
// Clean only newly inserted arm fringes, preserving original head and feet.
for (let i = 12; i < 16; i++) {
  const original = Buffer.from(frames[i]), dst = frames[i];
  const alpha = await sharp(original, { raw: { width: N, height: N, channels: 4 } }).extractChannel(3).blur(.65).raw().toBuffer();
  for (let y = 189; y < 278; y++) for (let x = 70; x < 300; x++) {
    if (x >= 162 && x <= 226) continue;
    const p = (y * N + x) * 4;
    const a = alpha[y * N + x];
    if (dst[p + 3] === 255 && a >= 254) continue;
    dst[p + 3] = Math.round(clamp((a - 36) / 190) * 255);
    if (!dst[p + 3]) { dst.fill(0, p, p + 4); continue; }
    let interior = true, best = Infinity, found = -1;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const q = ((y + dy) * N + x + dx) * 4, d = dx * dx + dy * dy;
      if (!original[q + 3]) interior = false;
      if (d < best && original[q + 3] === 255 && original[q] < 125 && original[q + 1] < 150 && original[q + 2] < 80) { best = d; found = q; }
    }
    if (interior) dst[p + 3] = 255;
    else if (found >= 0) original.copy(dst, p, found, found + 3);
  }
}
const atlas = Buffer.alloc(1536 * 1536 * 4);
for (let i = 0; i < 16; i++) {
  const f = frames[i];
  if (i < 8) assert(f.equals(old[i]), `Jump frame ${i + 1} changed`);
  if (i >= 8 && i < 12) assert(f.subarray(190 * N * 4).equals(old[i].subarray(190 * N * 4)), 'Walking body changed');
  if (i >= 12) { assert(f.subarray(0, 175 * N * 4).equals(old[i].subarray(0, 175 * N * 4)), 'Downward face changed'); assert(f.subarray(281 * N * 4).equals(old[i].subarray(281 * N * 4)), 'Feet changed'); }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (f[(y * N + x) * 4 + 3] > 32) assert(x > 8 && x < 375 && y > 8 && y < 375);
  await sharp(f, { raw: { width: N, height: N, channels: 4 } }).png().toFile(`${out}/frames-v4/frame-projects-v4-${String(i + 1).padStart(2, '0')}.png`);
  for (let y = 0; y < N; y++) f.copy(atlas, ((Math.floor(i / 4) * N + y) * 1536 + i % 4 * N) * 4, y * N * 4, (y + 1) * N * 4);
}
assert(frames[13].equals(frames[15]));
assert(frames[13].subarray(175 * N * 4).equals(frames[14].subarray(175 * N * 4)), 'Blink changes body');
await sharp(atlas, { raw: { width: 1536, height: 1536, channels: 4 } }).png().toFile(`${out}/sprites/frog-projects-center-look-sheet-v4.png`);
await writeFile(`${out}/quality-v4.json`, JSON.stringify({ count: 16, unchangedFrames: [1,2,3,4,5,6,7,8], walkingHead: 'frame 1, translation only', walkingOffsets: offsets, walkingBodyUnchangedBelow: 190, downwardFaceUnchangedAbove: 175, feetUnchangedBelow: 281, identicalBlinkBody: true, identicalRestLoop: true, skinSource: from, skinTarget: to }, null, 2) + '\n');
console.log('PASS unchanged jump, unchanged walking legs, exact downward faces/feet, identical blink body and rest loop.');
