import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const [
  ,
  ,
  inputPath,
  sheetOutputPath,
  framesOutputDir,
  sharpModulePath,
  framePrefix,
  columnsInput,
  rowsInput,
] = process.argv;

if (
  !inputPath ||
  !sheetOutputPath ||
  !framesOutputDir ||
  !sharpModulePath ||
  !framePrefix ||
  !columnsInput ||
  !rowsInput
) {
  throw new Error(
    "Usage: node scripts/split-fixed-grid.mjs <input> <sheet-output> <frames-output-dir> <sharp-module-path> <frame-prefix> <columns> <rows>",
  );
}

const require = createRequire(import.meta.url);
const sharp = require(sharpModulePath);
const columns = Number(columnsInput);
const rows = Number(rowsInput);
const frameSize = 320;
const metadata = await sharp(inputPath).metadata();
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

await mkdir(path.dirname(sheetOutputPath), { recursive: true });
await mkdir(framesOutputDir, { recursive: true });

const composites = [];
for (let row = 0; row < rows; row += 1) {
  for (let column = 0; column < columns; column += 1) {
    const index = row * columns + column;
    const left = Math.round((column * metadata.width) / columns);
    const right = Math.round(((column + 1) * metadata.width) / columns);
    const top = Math.round((row * metadata.height) / rows);
    const bottom = Math.round(((row + 1) * metadata.height) / rows);
    const frame = await sharp(inputPath)
      .extract({ left, top, width: right - left, height: bottom - top })
      .resize(frameSize, frameSize, {
        fit: "contain",
        background: transparent,
      })
      .png({ compressionLevel: 9 })
      .toBuffer();
    const filename = `${framePrefix}-${String(index + 1).padStart(2, "0")}.png`;

    await sharp(frame).toFile(path.join(framesOutputDir, filename));
    composites.push({
      input: frame,
      left: column * frameSize,
      top: row * frameSize,
    });
  }
}

await sharp({
  create: {
    width: columns * frameSize,
    height: rows * frameSize,
    channels: 4,
    background: transparent,
  },
})
  .composite(composites)
  .png({ compressionLevel: 9 })
  .toFile(sheetOutputPath);
