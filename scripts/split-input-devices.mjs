import { createRequire } from "node:module";

const [, , inputPath, keyboardOutputPath, mouseOutputPath, sharpModulePath] =
  process.argv;

if (!inputPath || !keyboardOutputPath || !mouseOutputPath || !sharpModulePath) {
  throw new Error(
    "Usage: node scripts/split-input-devices.mjs <input> <keyboard-output> <mouse-output> <sharp-module-path>",
  );
}

const require = createRequire(import.meta.url);
const sharp = require(sharpModulePath);
const metadata = await sharp(inputPath).metadata();
const width = metadata.width;
const height = metadata.height;
const splitX = 1090;
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

await sharp(inputPath)
  .extract({ left: 0, top: 0, width: splitX, height })
  .extend({ right: width - splitX, background: transparent })
  .png({ compressionLevel: 9 })
  .toFile(keyboardOutputPath);

await sharp(inputPath)
  .extract({ left: splitX, top: 0, width: width - splitX, height })
  .extend({ left: splitX, background: transparent })
  .png({ compressionLevel: 9 })
  .toFile(mouseOutputPath);
