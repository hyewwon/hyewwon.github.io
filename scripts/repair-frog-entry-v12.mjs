import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

// Asset packing only: recover the complete existing drawing, without redrawing
// the face or stretching the frog to fit the destination cell.
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || "sharp");
const directory = "assets/image/character/pages/splash/seamless-entry";
const frameSize = 320;
const outputDirectory = path.join(directory, "frames-v12");
await mkdir(outputDirectory, { recursive: true });

// The middle frog is intact in this source. The unrelated fragment to its left
// must not be included in its crop (the old fixed-grid extraction did so).
const crop = await sharp(path.join(directory, "source/frog-air-turn-generated-v11-normalized.png"))
  .extract({ left: 380, top: 70, width: 220, height: 190 })
  .png().toBuffer();
const recovered = await sharp(crop)
  .trim()
  .resize({ width: 286 })
  .png()
  .toBuffer();
const { width, height } = await sharp(recovered).metadata();
const repaired = await sharp({
  create: { width: frameSize, height: frameSize, channels: 4, background: "#00000000" },
})
  .composite([{ input: recovered, left: 16, top: 283 - height }])
  .png()
  .toBuffer();
if (width > 288 || height > 250) throw new Error("Repaired frog exceeds safe frame bounds.");

// Copy RGBA bytes rather than alpha-compositing: compositing can round
// semitransparent edge colors even in cells that were not intentionally edited.
const sheetPixels = await sharp(path.join(directory, "sprites/frog-seamless-entry-sheet-v11.png"))
  .ensureAlpha().raw().toBuffer();
for (let index = 0; index < 16; index += 1) {
  const number = String(index + 1).padStart(2, "0");
  const frame = index === 11 ? repaired : await sharp(path.join(directory, "sprites/frog-seamless-entry-sheet-v11.png"))
    .extract({ left: (index % 4) * frameSize, top: Math.floor(index / 4) * frameSize, width: frameSize, height: frameSize })
    .png().toBuffer();
  await sharp(frame).toFile(path.join(outputDirectory, `frame-seamless-v12-${number}.png`));
  if (index === 11) {
    const pixels = await sharp(frame).ensureAlpha().raw().toBuffer();
    for (let row = 0; row < frameSize; row += 1) {
      pixels.copy(sheetPixels, ((640 + row) * 1280 + 960) * 4, row * frameSize * 4, (row + 1) * frameSize * 4);
    }
  }
}
await sharp(sheetPixels, { raw: { width: 1280, height: 1280, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(path.join(directory, "sprites/frog-seamless-entry-sheet-v12.png"));
console.log("Packed v12: restored frame 12; other 15 frames preserved pixel-for-pixel.");
