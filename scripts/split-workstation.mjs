import { createRequire } from "node:module";

const [, , inputPath, monitorOutputPath, inputsOutputPath, sharpModulePath] =
  process.argv;

if (!inputPath || !monitorOutputPath || !inputsOutputPath || !sharpModulePath) {
  throw new Error(
    "Usage: node scripts/split-workstation.mjs <input> <monitor-output> <inputs-output> <sharp-module-path>",
  );
}

const require = createRequire(import.meta.url);
const sharp = require(sharpModulePath);
const metadata = await sharp(inputPath).metadata();
const width = metadata.width;
const height = metadata.height;
const splitY = 888;
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

await sharp(inputPath)
  .extract({ left: 0, top: 0, width, height: splitY })
  .extend({ bottom: height - splitY, background: transparent })
  .png({ compressionLevel: 9 })
  .toFile(monitorOutputPath);

await sharp(inputPath)
  .extract({ left: 0, top: splitY, width, height: height - splitY })
  .extend({ top: splitY, background: transparent })
  .png({ compressionLevel: 9 })
  .toFile(inputsOutputPath);
