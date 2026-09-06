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
  framePrefix = "frame-v2",
  columnsInput = "4",
  rowsInput = "4",
] = process.argv;

if (!inputPath || !sheetOutputPath || !framesOutputDir || !sharpModulePath) {
  throw new Error(
    "Usage: node scripts/normalize-frog-sprite.mjs <input> <sheet-output> <frames-output-dir> <sharp-module-path> [frame-prefix] [columns] [rows]",
  );
}

const require = createRequire(import.meta.url);
const sharp = require(sharpModulePath);
const columns = Number(columnsInput);
const rows = Number(rowsInput);
const frameSize = 320;
const sheetWidth = columns * frameSize;
const sheetHeight = rows * frameSize;

if (!Number.isInteger(columns) || !Number.isInteger(rows) || columns < 1 || rows < 1) {
  throw new Error("Sprite grid columns and rows must be positive integers.");
}

await mkdir(path.dirname(sheetOutputPath), { recursive: true });
await mkdir(framesOutputDir, { recursive: true });

await sharp(inputPath)
  .resize(sheetWidth, sheetHeight, { fit: "fill" })
  .png({ compressionLevel: 9 })
  .toFile(sheetOutputPath);

for (let index = 0; index < columns * rows; index += 1) {
  const column = index % columns;
  const row = Math.floor(index / columns);
  const filename = `${framePrefix}-${String(index + 1).padStart(2, "0")}.png`;

  await sharp(sheetOutputPath)
    .extract({
      left: column * frameSize,
      top: row * frameSize,
      width: frameSize,
      height: frameSize,
    })
    .png({ compressionLevel: 9 })
    .toFile(path.join(framesOutputDir, filename));
}
