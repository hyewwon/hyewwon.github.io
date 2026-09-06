import { createRequire } from "node:module";

const [, , inputPath, outputPath, sharpModulePath] = process.argv;

if (!inputPath || !outputPath || !sharpModulePath) {
  throw new Error(
    "Usage: node scripts/checkerboard-to-alpha.mjs <input> <output> <sharp-module-path>",
  );
}

const require = createRequire(import.meta.url);
const sharp = require(sharpModulePath);
const light = 254;
const dark = 242;
const transparentChroma = 3;
const opaqueChroma = 22;
const opaqueBrightness = 230;

const { data, info } = await sharp(inputPath)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const output = Buffer.alloc(info.width * info.height * 4);

for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    const inputOffset = (y * info.width + x) * 3;
    const outputOffset = (y * info.width + x) * 4;
    const red = data[inputOffset];
    const green = data[inputOffset + 1];
    const blue = data[inputOffset + 2];
    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    const chroma = maximum - minimum;
    const brightness = (red + green + blue) / 3;
    const isMagentaNoise =
      red > 90 && blue > 90 && green + 20 < Math.min(red, blue);

    if (isMagentaNoise) continue;

    const matte = brightness > 248 ? light : dark;
    const alpha =
      brightness <= opaqueBrightness
        ? 255
        : Math.max(
            0,
            Math.min(
              255,
              ((chroma - transparentChroma) /
                (opaqueChroma - transparentChroma)) *
              255,
            ),
          );

    if (alpha < 32) continue;

    output[outputOffset + 3] = Math.round(alpha);

    if (alpha <= 0) continue;

    const normalizedAlpha = alpha / 255;
    const inverseAlpha = 1 - normalizedAlpha;

    output[outputOffset] = Math.max(
      0,
      Math.min(255, Math.round((red - inverseAlpha * matte) / normalizedAlpha)),
    );
    output[outputOffset + 1] = Math.max(
      0,
      Math.min(255, Math.round((green - inverseAlpha * matte) / normalizedAlpha)),
    );
    output[outputOffset + 2] = Math.max(
      0,
      Math.min(255, Math.round((blue - inverseAlpha * matte) / normalizedAlpha)),
    );
  }
}

await sharp(output, {
  raw: {
    width: info.width,
    height: info.height,
    channels: 4,
  },
})
  .png({ compressionLevel: 9 })
  .toFile(outputPath);
