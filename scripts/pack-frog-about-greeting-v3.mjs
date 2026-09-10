import { mkdir, copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import path from 'node:path';

// Lossless packaging of approved artwork, not image generation or redrawing.
// Run from the repository root; an external Sharp installation may be passed.
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
const source = 'assets/image/character/pages/splash/seamless-entry/frames-v12';
const destination = 'assets/image/character/pages/desktop/about-guide';
const order = [1, 2, 3, 2, 3, 2, 1, 1];
const cell = 320, columns = 4, width = cell * columns, height = cell * 2;
const sheet = Buffer.alloc(width * height * 4);
for (const folder of ['sprites', 'frames-v3']) {
  await mkdir(path.join(destination, folder), { recursive: true });
}
const sources = [];
for (let index = 0; index < order.length; index++) {
  const file = path.join(source, `frame-seamless-v12-${String(order[index]).padStart(2, '0')}.png`);
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, cell);
  assert.equal(info.height, cell);
  assert.equal(info.channels, 4);
  sources.push(data);
  // Byte copy avoids resampling and alpha-compositing edge/color changes.
  for (let y = 0; y < cell; y++) {
    const offset = (((Math.floor(index / columns) * cell + y) * width) + (index % columns) * cell) * 4;
    data.copy(sheet, offset, y * cell * 4, (y + 1) * cell * 4);
  }
  await copyFile(file, path.join(destination, 'frames-v3', `frame-about-v3-${String(index + 1).padStart(2, '0')}.png`));
}
const output = path.join(destination, 'sprites/frog-about-greeting-sheet-v3.png');
await sharp(sheet, { raw: { width, height, channels: 4 } }).png().toFile(output);
for (let index = 0; index < order.length; index++) {
  const actual = await sharp(output).extract({
    left: (index % columns) * cell, top: Math.floor(index / columns) * cell,
    width: cell, height: cell,
  }).ensureAlpha().raw().toBuffer();
  assert(actual.equals(sources[index]), `Frame ${index + 1} differs from original RGBA pixels`);
}
const metadata = await sharp(output).metadata();
assert(metadata.hasAlpha);
console.log(JSON.stringify({ output, width, height, hasAlpha: metadata.hasAlpha, packedFrames: order.length, originalPoses: 3, exactRGBA: true }, null, 2));
