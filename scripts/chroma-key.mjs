import { createRequire } from "node:module";

const [
  ,
  ,
  inputPath,
  outputPath,
  sharpModulePath,
  matteRed,
  matteGreen,
  matteBlue,
] = process.argv;

if (!inputPath || !outputPath || !sharpModulePath) {
  throw new Error(
    "Usage: node scripts/chroma-key.mjs <input> <output> <sharp-module-path> [matte-r matte-g matte-b]",
  );
}

const require = createRequire(import.meta.url);
const sharp = require(sharpModulePath);

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const transparentAt = 110;
const opaqueAt = 4;
const matte =
  matteRed && matteGreen && matteBlue
    ? [Number(matteRed), Number(matteGreen), Number(matteBlue)]
    : [244, 5, 234];

for (let offset = 0; offset < data.length; offset += 4) {
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  const chromaScore = Math.min(red, blue) - green;

  if (chromaScore <= opaqueAt) continue;

  const alpha = Math.max(
    0,
    Math.min(255, ((transparentAt - chromaScore) / (transparentAt - opaqueAt)) * 255),
  );

  data[offset + 3] = Math.round(alpha);

  if (alpha > 0 && alpha < 255) {
    const normalizedAlpha = alpha / 255;
    const inverseAlpha = 1 - normalizedAlpha;

    data[offset] = Math.max(
      0,
      Math.min(255, Math.round((red - inverseAlpha * matte[0]) / normalizedAlpha)),
    );
    data[offset + 1] = Math.max(
      0,
      Math.min(255, Math.round((green - inverseAlpha * matte[1]) / normalizedAlpha)),
    );
    data[offset + 2] = Math.max(
      0,
      Math.min(255, Math.round((blue - inverseAlpha * matte[2]) / normalizedAlpha)),
    );
  }
}

await sharp(data, {
  raw: {
    width: info.width,
    height: info.height,
    channels: 4,
  },
})
  .png({ compressionLevel: 9 })
  .toFile(outputPath);
