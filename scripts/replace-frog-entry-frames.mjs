import { createRequire } from "node:module";

const [
  ,
  ,
  baseSheetPath,
  frame13Path,
  frame14Path,
  outputSheetPath,
  sharpModulePath,
] = process.argv;

if (
  !baseSheetPath ||
  !frame13Path ||
  !frame14Path ||
  !outputSheetPath ||
  !sharpModulePath
) {
  throw new Error(
    "Usage: node scripts/replace-frog-entry-frames.mjs <base-sheet> <frame-13> <frame-14> <output-sheet> <sharp-module-path>",
  );
}

const require = createRequire(import.meta.url);
const sharp = require(sharpModulePath);
const frameSize = 320;
const lastRowTop = frameSize * 3;

const clearCells = await sharp({
  create: {
    width: frameSize * 2,
    height: frameSize,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 1 },
  },
})
  .png()
  .toBuffer();

const frame13 = await sharp(frame13Path)
  .resize(frameSize, frameSize, { fit: "fill" })
  .png()
  .toBuffer();
const frame14 = await sharp(frame14Path)
  .resize(frameSize, frameSize, { fit: "fill" })
  .png()
  .toBuffer();

await sharp(baseSheetPath)
  .composite([
    { input: clearCells, left: 0, top: lastRowTop, blend: "dest-out" },
    { input: frame13, left: 0, top: lastRowTop },
    { input: frame14, left: frameSize, top: lastRowTop },
  ])
  .png({ compressionLevel: 9 })
  .toFile(outputSheetPath);
